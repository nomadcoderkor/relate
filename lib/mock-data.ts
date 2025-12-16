/**
 * 개발 모드용 Mock 데이터
 */

import type { BusinessCard } from "@/types";

export const mockBusinessCards: BusinessCard[] = [
  {
    id: "mock-1",
    user_id: "dev-user",
    name: "김철수",
    company: "테크컴퍼니",
    title: "대표이사",
    phone: "010-1234-5678",
    email: "kim@techcompany.com",
    address: "서울시 강남구 테헤란로 123",
    memo: "AI 스타트업 대표, 비즈니스 미팅에서 만남",
    image_url: null,
    last_contact_date: "2024-12-10",
    tags: ["거래처", "VIP"],
    created_at: "2024-12-01T09:00:00Z",
    updated_at: "2024-12-01T09:00:00Z",
  },
  {
    id: "mock-2",
    user_id: "dev-user",
    name: "이영희",
    company: "디자인스튜디오",
    title: "수석 디자이너",
    phone: "010-9876-5432",
    email: "lee@designstudio.com",
    address: "서울시 마포구 월드컵로 456",
    memo: "UI/UX 디자인 협업 파트너",
    image_url: null,
    last_contact_date: "2024-12-12",
    tags: ["협력사", "디자인"],
    created_at: "2024-12-03T10:30:00Z",
    updated_at: "2024-12-03T10:30:00Z",
  },
  {
    id: "mock-3",
    user_id: "dev-user",
    name: "박민수",
    company: "마케팅그룹",
    title: "마케팅 이사",
    phone: "010-5555-7777",
    email: "park@marketinggroup.com",
    address: "서울시 송파구 올림픽로 789",
    memo: "디지털 마케팅 컨설팅, 월 1회 미팅",
    image_url: null,
    last_contact_date: "2024-12-08",
    tags: ["마케팅", "컨설팅"],
    created_at: "2024-12-05T14:20:00Z",
    updated_at: "2024-12-05T14:20:00Z",
  },
  {
    id: "mock-4",
    user_id: "dev-user",
    name: "정수진",
    company: "글로벌솔루션",
    title: "영업부장",
    phone: "010-3333-4444",
    email: "jung@globalsolution.com",
    address: "서울시 영등포구 여의대로 321",
    memo: "해외 시장 진출 관련 협의",
    image_url: null,
    last_contact_date: "2024-12-05",
    tags: ["거래처", "해외"],
    created_at: "2024-12-07T11:00:00Z",
    updated_at: "2024-12-07T11:00:00Z",
  },
  {
    id: "mock-5",
    user_id: "dev-user",
    name: "최동욱",
    company: "인베스트먼트",
    title: "투자심사역",
    phone: "010-8888-9999",
    email: "choi@investment.com",
    address: "서울시 중구 세종대로 100",
    memo: "시리즈 A 투자 검토 중",
    image_url: null,
    last_contact_date: "2024-12-13",
    tags: ["투자", "VIP"],
    created_at: "2024-12-09T16:45:00Z",
    updated_at: "2024-12-09T16:45:00Z",
  },
];

export function getMockStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisMonth = mockBusinessCards.filter(
    (card) => new Date(card.created_at) >= startOfMonth
  ).length;

  const recentlyModified = mockBusinessCards.filter(
    (card) => new Date(card.updated_at) >= sevenDaysAgo
  ).length;

  return {
    total: mockBusinessCards.length,
    thisMonth,
    recentlyModified,
    recentCards: mockBusinessCards.slice(0, 5),
  };
}

