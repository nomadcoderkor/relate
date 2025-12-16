/**
 * 팔로업 메시지 생성 API
 * 명함 정보를 바탕으로 카카오톡/이메일 메시지 생성
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai/openai";
import { createMessagePrompt, SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import type { GenerateMessageRequest, GenerateMessageResponse, AIApiResponse } from "@/types/ai";
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
    const body: GenerateMessageRequest = await request.json();
    const { cardName, company, title, memo, lastContactDate, tone } = body;

    if (!cardName) {
      return NextResponse.json(
        { ok: false, error: "명함 이름이 필요합니다." },
        { status: 400 }
      );
    }

    if (tone !== "kakao" && tone !== "email") {
      return NextResponse.json(
        { ok: false, error: "톤은 'kakao' 또는 'email'이어야 합니다." },
        { status: 400 }
      );
    }

    // 개발 모드에서는 Mock 데이터 반환
    if (isDevMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (tone === "kakao") {
        return NextResponse.json<AIApiResponse<GenerateMessageResponse>>({
          ok: true,
          data: {
            message: `${cardName}님 안녕하세요! 😊\n요즘 어떻게 지내시나요? 저번에 말씀하신 ${memo ? memo.slice(0, 20) : "프로젝트"} 궁금하네요.\n시간 되실 때 연락 주세요!`,
            tone: "kakao",
          },
        });
      } else {
        return NextResponse.json<AIApiResponse<GenerateMessageResponse>>({
          ok: true,
          data: {
            subject: `${cardName}님께 안부 인사 드립니다`,
            message: `${cardName}님 안녕하세요.\n\n그동안 안녕하셨는지요? 저번에 ${memo ? memo.slice(0, 30) : "함께 이야기 나눴던 내용"} 이후로 시간이 꽤 지난 것 같아 연락드립니다.\n\n${company ? company + "에서의" : ""} 업무는 잘 진행되고 계신가요?\n\n시간 되실 때 편하게 연락 주시면 감사하겠습니다.\n\n감사합니다.`,
            tone: "email",
          },
        });
      }
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

    // GPT-4o-mini로 메시지 생성
    const completion = await createChatCompletion(
      [
        {
          role: "system",
          content: SYSTEM_PROMPTS.message,
        },
        {
          role: "user",
          content: createMessagePrompt(
            cardName,
            company,
            title,
            memo,
            lastContactDate,
            tone
          ),
        },
      ],
      {
        maxTokens: tone === "email" ? 400 : 200,
      }
    );

    const responseText = (completion as ChatCompletion).choices[0]?.message?.content?.trim() || "";

    if (!responseText) {
      return NextResponse.json(
        { ok: false, error: "메시지 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // 이메일인 경우 제목과 본문 분리
    let subject: string | undefined;
    let message: string = responseText;

    if (tone === "email") {
      const lines = responseText.split("\n");
      const subjectLine = lines.find((line) => line.startsWith("제목:"));

      if (subjectLine) {
        subject = subjectLine.replace("제목:", "").trim();
        // 본문 추출 (제목 이후)
        const bodyStartIndex = lines.findIndex((line) =>
          line.startsWith("본문:")
        );
        if (bodyStartIndex !== -1) {
          message = lines.slice(bodyStartIndex + 1).join("\n").trim();
        }
      }
    }

    const response: AIApiResponse<GenerateMessageResponse> = {
      ok: true,
      data: {
        message,
        subject,
        tone,
      },
      usage: {
        promptTokens: (completion as ChatCompletion).usage?.prompt_tokens || 0,
        completionTokens: (completion as ChatCompletion).usage?.completion_tokens || 0,
        totalTokens: (completion as ChatCompletion).usage?.total_tokens || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate message API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "메시지 생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

