"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import type { ProfileInsert } from "@/types/database";

// 로그인 스키마
const loginSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 주소를 입력하세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});

// 회원가입 스키마
const signupSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 주소를 입력하세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
  name: z.string().min(2, { message: "이름은 최소 2자 이상이어야 합니다." }),
});

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export type SignupFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    _form?: string[];
  };
  success?: boolean;
};

/**
 * 로그인 Server Action
 */
export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 입력값 검증
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createClient();

    // Supabase 인증
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        errors: {
          _form: [error.message === "Invalid login credentials" 
            ? "이메일 또는 비밀번호가 올바르지 않습니다." 
            : error.message],
        },
      };
    }

    // 성공 시 홈으로 리다이렉트
    revalidatePath("/", "layout");
  } catch (error) {
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다.",
        ],
      },
    };
  }

  redirect("/dashboard");
}

/**
 * 회원가입 Server Action
 */
export async function signup(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  // 입력값 검증
  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, name } = validatedFields.data;

  try {
    const supabase = await createClient();

    // Supabase 회원가입
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        errors: {
          _form: [
            error.message === "User already registered"
              ? "이미 등록된 이메일입니다."
              : error.message,
          ],
        },
      };
    }

    // 회원가입 성공 시 프로필 자동 생성
    if (authData?.user) {
      try {
        const adminClient = createAdminClient();
        
        // 프로필 데이터 준비
        const profileData: ProfileInsert = {
          id: authData.user.id,
          email: authData.user.email || email,
          name: name,
        };
        
        // 프로필 생성 (RLS 우회)
        const { error: profileError } = await (adminClient
          .from("profiles") as any)
          .insert(profileData);

        if (profileError) {
          console.error("프로필 자동 생성 오류:", profileError);
          // 프로필 생성 실패해도 회원가입은 성공으로 처리
          // (나중에 자동 생성 로직이 다시 시도함)
        } else {
          console.log("프로필 자동 생성 성공:", authData.user.id);
        }
      } catch (adminError) {
        console.error("Admin 클라이언트 오류:", adminError);
        // 프로필 생성 실패해도 회원가입은 성공으로 처리
      }
    }

    // 성공
    return {
      success: true,
    };
  } catch (error) {
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "회원가입 중 오류가 발생했습니다.",
        ],
      },
    };
  }
}

/**
 * 로그아웃 Server Action
 */
export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    
    // 개발 모드 쿠키도 삭제
    const cookieStore = await cookies();
    cookieStore.delete("dev_mode_user");
    
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("로그아웃 오류:", error);
  }

  redirect("/login");
}

/**
 * 소셜 로그인 (Google, GitHub 등)
 */
export async function socialLogin(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * 개발 모드 테스트 계정 로그인
 */
export async function devModeLogin() {
  // 개발 모드가 아니면 에러
  if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
    redirect("/login");
    return;
  }

  try {
    // 쿠키에 개발 모드 플래그 설정
    const cookieStore = await cookies();
    
    // 임시 사용자 ID 생성 (세션용)
    const devUserId = "dev-user-" + Date.now();
    
    cookieStore.set("dev_mode_user", devUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
    });

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Dev mode login error:", error);
  }

  redirect("/dashboard");
}
