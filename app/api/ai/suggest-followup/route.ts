/**
 * 연락 추천 API
 * 명함 목록을 분석하여 연락이 필요한 사람을 추천
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai/openai";
import { createFollowupAnalysisPrompt, SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import type { FollowupSuggestion, SuggestFollowupResponse, AIApiResponse } from "@/types/ai";
import type { BusinessCard } from "@/types/database";
import type { ChatCompletion } from "openai/resources/chat/completions";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 개발 모드 체크
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    const cookies = request.cookies;
    const devModeUser = cookies.get("dev_mode_user");

    // 개발 모드에서는 Mock 데이터 반환 (인증 체크보다 우선)
    if (isDevMode) {
      const mockSuggestions: FollowupSuggestion[] = [
        {
          cardId: "mock-1",
          cardName: "김철수",
          company: "주식회사 테크컴퍼니",
          title: "대표이사",
          lastContactDate: "2024-11-15",
          daysSinceContact: 30,
          priority: "high",
          reason: "30일 이상 연락하지 않았으며, 중요한 비즈니스 파트너입니다.",
          suggestedMessage: "안녕하세요 대표님! 한 달이 지났네요. 요즘 어떻게 지내시나요? 😊",
        },
        {
          cardId: "mock-2",
          cardName: "이영희",
          company: "디자인스튜디오",
          title: "수석 디자이너",
          lastContactDate: "2024-12-01",
          daysSinceContact: 14,
          priority: "medium",
          reason: "2주 정도 연락하지 않았으며, 정기적인 소통이 필요한 관계입니다.",
          suggestedMessage: "영희님 안녕하세요! 프로젝트 준비는 잘 되고 계신가요?",
        },
      ];

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json<AIApiResponse<SuggestFollowupResponse>>({
        ok: true,
        data: {
          suggestions: mockSuggestions,
        },
      });
    }

    // 인증 확인 (개발 모드가 아닐 때만)
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 명함 목록 조회
    const { data: cards, error: cardsError } = await supabase
      .from("business_cards")
      .select("id, name, company, title, memo, last_contact_date")
      .eq("user_id", user!.id)
      .order("last_contact_date", { ascending: true, nullsFirst: false })
      .limit(10) as { data: Pick<BusinessCard, "id" | "name" | "company" | "title" | "memo" | "last_contact_date">[] | null; error: any };

    if (cardsError) {
      console.error("Cards query error:", cardsError);
      return NextResponse.json(
        { ok: false, error: "명함 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    if (!cards || cards.length === 0) {
      return NextResponse.json<AIApiResponse<SuggestFollowupResponse>>({
        ok: true,
        data: {
          suggestions: [],
        },
      });
    }

    // 마지막 연락일 계산
    const today = new Date();
    const cardsWithDays = cards.map((card) => {
      const daysSince = card.last_contact_date
        ? Math.floor(
            (today.getTime() - new Date(card.last_contact_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

      return {
        id: card.id,
        name: card.name,
        company: card.company || undefined,
        title: card.title || undefined,
        memo: card.memo || undefined,
        lastContactDate: card.last_contact_date || undefined,
        daysSinceContact: daysSince,
      };
    });

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      // OpenAI 없이 간단한 알고리즘으로 처리
      const suggestions: FollowupSuggestion[] = cardsWithDays
        .filter((card) => card.daysSinceContact >= 14)
        .map((card) => ({
          cardId: card.id,
          cardName: card.name,
          company: card.company || undefined,
          title: card.title || undefined,
          lastContactDate: card.lastContactDate || undefined,
          daysSinceContact: card.daysSinceContact,
          priority:
            card.daysSinceContact >= 30
              ? ("high" as const)
              : card.daysSinceContact >= 21
              ? ("medium" as const)
              : ("low" as const),
          reason:
            card.daysSinceContact >= 30
              ? "한 달 이상 연락하지 않았습니다."
              : "2-3주 연락하지 않았습니다.",
        }))
        .slice(0, 5);

      return NextResponse.json<AIApiResponse<SuggestFollowupResponse>>({
        ok: true,
        data: {
          suggestions,
        },
      });
    }

    // GPT-4o-mini로 분석
    const completion = await createChatCompletion(
      [
        {
          role: "system",
          content: SYSTEM_PROMPTS.followup,
        },
        {
          role: "user",
          content: createFollowupAnalysisPrompt(cardsWithDays),
        },
      ],
      {
        maxTokens: 500,
      }
    );

    const responseText = (completion as ChatCompletion).choices[0]?.message?.content?.trim() || "";

    // JSON 파싱
    let analysisResults: Array<{
      cardId: string;
      priority: "high" | "medium" | "low";
      reason: string;
    }> = [];

    try {
      // JSON 추출 (코드 블록 제거)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        analysisResults = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
    }

    // 결과 매핑
    const mappedResults = cardsWithDays
      .map((card) => {
        const analysis = analysisResults.find((a) => a.cardId === card.id);
        if (!analysis) return null;

        return {
          cardId: card.id,
          cardName: card.name,
          company: card.company,
          title: card.title,
          lastContactDate: card.lastContactDate,
          daysSinceContact: card.daysSinceContact,
          priority: analysis.priority,
          reason: analysis.reason,
        } as FollowupSuggestion;
      })
      .filter((s) => s !== null) as FollowupSuggestion[];
    
    const suggestions = mappedResults
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5);

    const response: AIApiResponse<SuggestFollowupResponse> = {
      ok: true,
      data: {
        suggestions,
      },
      usage: {
        promptTokens: (completion as ChatCompletion).usage?.prompt_tokens || 0,
        completionTokens: (completion as ChatCompletion).usage?.completion_tokens || 0,
        totalTokens: (completion as ChatCompletion).usage?.total_tokens || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Suggest followup API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "연락 추천 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

