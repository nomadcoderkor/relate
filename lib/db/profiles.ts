import { createClient } from "@/lib/supabase/server";
import type { Profile, ProfileUpdate, ApiResponse } from "@/types";

/**
 * 프로필 관련 데이터베이스 헬퍼 함수들
 */

/**
 * 현재 로그인한 사용자의 프로필을 가져옵니다
 */
export async function getCurrentProfile(): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient();

    // 현재 사용자 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        ok: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    // 프로필 가져오기
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      data: profile,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * ID로 프로필을 가져옵니다
 */
export async function getProfileById(
  id: string
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      data: profile,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 프로필을 업데이트합니다
 */
export async function updateProfile(
  id: string,
  updates: ProfileUpdate
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await (supabase
      .from("profiles") as any)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      data: profile,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 사용자의 프로필을 업데이트합니다
 */
export async function updateCurrentProfile(
  updates: ProfileUpdate
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient();

    // 현재 사용자 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        ok: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    return updateProfile(user.id, updates);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 프로필 삭제 (soft delete는 아니고 실제 삭제)
 * 주의: cascade로 인해 관련 명함도 모두 삭제됩니다
 */
export async function deleteProfile(id: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

