/**
 * AI 기능 관련 타입 정의
 */

// 메모 요약 요청/응답
export interface SummarizeRequest {
  memo: string;
}

export interface SummarizeResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
}

// 연락 추천 요청/응답
export interface FollowupSuggestion {
  cardId: string;
  cardName: string;
  company?: string;
  title?: string;
  lastContactDate?: string;
  daysSinceContact: number;
  priority: "high" | "medium" | "low";
  reason: string;
  suggestedMessage?: string;
}

export interface SuggestFollowupResponse {
  suggestions: FollowupSuggestion[];
}

// 메시지 생성 요청/응답
export interface GenerateMessageRequest {
  cardName: string;
  company?: string;
  title?: string;
  relationship?: string;
  memo?: string;
  lastContactDate?: string;
  tone: "kakao" | "email";
}

export interface GenerateMessageResponse {
  message: string;
  subject?: string; // 이메일인 경우 제목
  tone: "kakao" | "email";
}

// AI API 응답 포맷
export interface AIApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

