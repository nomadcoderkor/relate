/**
 * 중앙 집중식 타입 내보내기
 */

// 데이터베이스 타입
export type {
  Database,
  Json,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  BusinessCard,
  BusinessCardInsert,
  BusinessCardUpdate,
  BusinessCardFormData,
  BusinessCardFilter,
  BusinessCardStats,
  ProfileFormData,
  ApiResponse,
  PaginatedResponse,
  SupabaseError,
} from "./database";

// UI 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 폼 상태 타입
export interface FormState<T = unknown> extends LoadingState {
  data: T | null;
  isDirty: boolean;
}

// 모달 상태 타입
export interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  itemId?: string;
}

// 토스트 메시지 타입
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

// 사용자 인증 상태 타입
export interface AuthState {
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 명함 카드 표시 모드
export type CardDisplayMode = "grid" | "list" | "table";

// 정렬 옵션
export interface SortOption<T = string> {
  field: T;
  order: "asc" | "desc";
  label: string;
}
