/**
 * 메모 요약 API
 * OpenAI GPT-4o-mini를 사용하여 긴 메모를 3줄로 요약
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai/openai";
import { createSummarizePrompt, SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import type { SummarizeRequest, SummarizeResponse, AIApiResponse } from "@/types/ai";
import type { ChatCompletion } from "openai/resources/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 개발 모드 체크
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

    // 요청 데이터 파싱
    const body: SummarizeRequest = await request.json();
    const { memo } = body;

    if (!memo || memo.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "메모 내용이 필요합니다." },
        { status: 400 }
      );
    }

    // 메모가 너무 짧으면 요약 불필요
    if (memo.length < 100) {
      return NextResponse.json<AIApiResponse<SummarizeResponse>>({
        ok: true,
        data: {
          summary: memo,
          originalLength: memo.length,
          summaryLength: memo.length,
        },
      });
    }

    // 개발 모드에서는 Mock 데이터 반환
    if (isDevMode) {
      const mockSummary = memo.split("\n").slice(0, 3).join("\n") || memo.slice(0, 100) + "...";
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json<AIApiResponse<SummarizeResponse>>({
        ok: true,
        data: {
          summary: mockSummary,
          originalLength: memo.length,
          summaryLength: mockSummary.length,
        },
      });
    }

    // 인증 확인 (개발 모드가 아닐 때)
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: "OpenAI API가 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    // GPT-4o-mini로 요약 생성
    const completion = await createChatCompletion([
      {
        role: "system",
        content: SYSTEM_PROMPTS.summarize,
      },
      {
        role: "user",
        content: createSummarizePrompt(memo),
      },
    ]);

    const summary = (completion as ChatCompletion).choices[0]?.message?.content?.trim() || "";

    if (!summary) {
      return NextResponse.json(
        { ok: false, error: "요약 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const response: AIApiResponse<SummarizeResponse> = {
      ok: true,
      data: {
        summary,
        originalLength: memo.length,
        summaryLength: summary.length,
      },
      usage: {
        promptTokens: (completion as ChatCompletion).usage?.prompt_tokens || 0,
        completionTokens: (completion as ChatCompletion).usage?.completion_tokens || 0,
        totalTokens: (completion as ChatCompletion).usage?.total_tokens || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Summarize API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "요약 생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

