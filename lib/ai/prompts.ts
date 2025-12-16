/**
 * AI 프롬프트 템플릿
 */

/**
 * 메모 요약 프롬프트
 */
export function createSummarizePrompt(memo: string): string {
  return `다음 명함 메모를 3줄로 간결하게 요약해주세요. 핵심 내용만 포함하되, 업무 관계나 중요한 정보는 반드시 포함해야 합니다.

메모:
${memo}

요약 (3줄 이내):`;
}

/**
 * 연락 추천 분석 프롬프트
 */
export function createFollowupAnalysisPrompt(
  cards: Array<{
    id: string;
    name: string;
    company?: string;
    title?: string;
    memo?: string;
    lastContactDate?: string;
    daysSinceContact: number;
  }>
): string {
  const cardsInfo = cards
    .map((card, index) => {
      return `${index + 1}. ${card.name}
   - 회사: ${card.company || "미등록"}
   - 직함: ${card.title || "미등록"}
   - 마지막 연락: ${card.daysSinceContact}일 전
   - 메모: ${card.memo || "없음"}`;
    })
    .join("\n\n");

  return `다음은 명함 목록입니다. 각 명함에 대해 연락의 우선순위(high/medium/low)와 이유를 분석해주세요.

우선순위 기준:
- high: 30일 이상 연락 안 함 + 중요한 비즈니스 관계
- medium: 14-30일 연락 안 함 또는 보통 관계
- low: 14일 이내 연락함 또는 덜 중요한 관계

명함 목록:
${cardsInfo}

각 명함에 대해 다음 형식으로 JSON 배열로 응답해주세요:
[
  {
    "cardId": "명함 ID",
    "priority": "high|medium|low",
    "reason": "우선순위 이유 (한 문장)"
  }
]

JSON만 응답하고 다른 텍스트는 포함하지 마세요.`;
}

/**
 * 팔로업 메시지 생성 프롬프트
 */
export function createMessagePrompt(
  cardName: string,
  company: string | undefined,
  title: string | undefined,
  memo: string | undefined,
  lastContactDate: string | undefined,
  tone: "kakao" | "email"
): string {
  const contextInfo = `
이름: ${cardName}
회사: ${company || "미등록"}
직함: ${title || "미등록"}
메모: ${memo || "없음"}
마지막 연락: ${lastContactDate || "미등록"}
`;

  if (tone === "kakao") {
    return `다음 정보를 바탕으로 카카오톡으로 보낼 자연스러운 안부 메시지를 작성해주세요.

${contextInfo}

요구사항:
- 친근하고 편안한 톤
- 2-3문장으로 간결하게
- 메모 내용을 자연스럽게 언급
- 이모티콘 1-2개 포함
- 답장을 유도하는 질문 포함

메시지:`;
  } else {
    return `다음 정보를 바탕으로 이메일로 보낼 정중한 안부 메시지를 작성해주세요.

${contextInfo}

요구사항:
- 정중하고 프로페셔널한 톤
- 제목과 본문 작성
- 인사말, 안부, 마무리 인사 포함
- 메모 내용을 자연스럽게 언급

다음 형식으로 응답해주세요:
제목: [이메일 제목]

본문:
[이메일 본문]`;
  }
}

/**
 * 시스템 프롬프트
 */
export const SYSTEM_PROMPTS = {
  summarize: `당신은 비즈니스 명함 메모를 요약하는 전문가입니다. 
핵심 정보만 간결하게 추출하며, 업무 관계와 중요한 컨텍스트를 보존합니다.`,

  followup: `당신은 비즈니스 관계 관리 전문가입니다.
명함 정보를 분석하여 연락 우선순위를 판단하고, 적절한 팔로업 타이밍을 제안합니다.`,

  message: `당신은 비즈니스 커뮤니케이션 전문가입니다.
상황에 맞는 자연스럽고 효과적인 메시지를 작성합니다.`,
} as const;

