/**
 * OpenAI API 클라이언트
 */

import OpenAI from "openai";

// OpenAI 클라이언트 싱글톤
let openaiInstance: OpenAI | null = null;

/**
 * OpenAI 클라이언트 가져오기
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY 환경변수가 설정되지 않았습니다."
      );
    }

    openaiInstance = new OpenAI({
      apiKey,
    });
  }

  return openaiInstance;
}

/**
 * OpenAI 설정
 */
export const OPENAI_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 200,
} as const;

/**
 * ChatGPT 완성 요청 (스트리밍)
 */
export async function createChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
) {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages,
    temperature: options?.temperature ?? OPENAI_CONFIG.temperature,
    max_tokens: options?.maxTokens ?? OPENAI_CONFIG.maxTokens,
    stream: options?.stream ?? false,
  });

  return completion;
}

/**
 * ChatGPT 스트리밍 응답
 */
export async function createChatCompletionStream(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  const client = getOpenAIClient();

  const stream = await client.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages,
    temperature: options?.temperature ?? OPENAI_CONFIG.temperature,
    max_tokens: options?.maxTokens ?? OPENAI_CONFIG.maxTokens,
    stream: true,
  });

  return stream;
}

/**
 * 토큰 사용량 계산 (대략적)
 */
export function estimateTokens(text: string): number {
  // 한글은 약 1.5 토큰/글자, 영어는 약 0.75 토큰/단어
  const koreanChars = (text.match(/[\u3131-\uD79D]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  return Math.ceil(koreanChars * 1.5 + englishWords * 0.75);
}

