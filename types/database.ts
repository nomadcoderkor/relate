/**
 * Supabase 데이터베이스 타입 정의
 * 이 파일은 Supabase CLI로 자동 생성할 수도 있습니다:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      business_cards: {
        Row: BusinessCard;
        Insert: BusinessCardInsert;
        Update: BusinessCardUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_business_card_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_business_cards_created_in_period: {
        Args: {
          user_uuid: string;
          start_date: string;
          end_date: string;
        };
        Returns: number;
      };
      search_business_cards_by_tag: {
        Args: {
          user_uuid: string;
          search_tag: string;
        };
        Returns: BusinessCard[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ============================================
// Profile 타입
// ============================================

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  email?: string;
  name?: string | null;
  updated_at?: string;
}

// ============================================
// Business Card 타입
// ============================================

export interface BusinessCard {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  memo: string | null;
  image_url: string | null;
  last_contact_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessCardInsert {
  id?: string;
  user_id: string;
  name: string;
  company?: string | null;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  memo?: string | null;
  image_url?: string | null;
  last_contact_date?: string | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface BusinessCardUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  company?: string | null;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  memo?: string | null;
  image_url?: string | null;
  last_contact_date?: string | null;
  tags?: string[];
  updated_at?: string;
}

// ============================================
// 유틸리티 타입
// ============================================

// 명함 생성 폼 데이터 타입
export interface BusinessCardFormData {
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  memo?: string;
  image_url?: string;
  last_contact_date?: string;
  tags?: string[];
}

// 명함 필터링 옵션
export interface BusinessCardFilter {
  search?: string; // 이름, 회사명, 직함 검색
  tags?: string[]; // 태그 필터
  dateFrom?: string; // 생성일 필터 (시작)
  dateTo?: string; // 생성일 필터 (종료)
  sortBy?: "created_at" | "name" | "company" | "last_contact_date";
  sortOrder?: "asc" | "desc";
}

// 명함 통계 타입
export interface BusinessCardStats {
  total: number;
  thisMonth: number;
  recentlyModified: number;
  topTags: Array<{ tag: string; count: number }>;
}

// 프로필 업데이트 폼 데이터
export interface ProfileFormData {
  name: string;
  email: string;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Supabase 에러 타입
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

