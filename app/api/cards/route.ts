/**
 * 명함 CRUD API
 */

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 명함 데이터 스키마
const cardSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다."),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("올바른 이메일 형식이 아닙니다.").optional().or(z.literal("")),
  address: z.string().optional(),
  website: z.string().optional(),
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

/**
 * 명함 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 개발 모드 체크
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    const cookies = request.cookies;
    const devModeUser = cookies.get("dev_mode_user");

    if (!user && !(isDevMode && devModeUser)) {
      return NextResponse.json(
        { ok: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const validatedData = cardSchema.parse(body);

    // 개발 모드에서는 Mock 응답
    if (isDevMode && devModeUser) {
      return NextResponse.json({
        ok: true,
        data: {
          id: `mock-${Date.now()}`,
          ...validatedData,
          user_id: "dev-user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // 프로필 존재 확인 및 자동 생성
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user!.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // 프로필이 없으면 Admin 클라이언트로 생성 (RLS 우회)
      console.log("프로필이 없어서 자동 생성합니다:", user!.id);
      
      try {
        const adminClient = createAdminClient();
        const { error: createProfileError } = await (adminClient
          .from("profiles") as any)
          .insert({
            id: user!.id,
            email: user!.email || "",
            name: user!.user_metadata?.name || user!.email?.split("@")[0] || "사용자",
          });

        if (createProfileError) {
          console.error("프로필 생성 오류:", createProfileError);
          return NextResponse.json(
            { ok: false, error: `프로필 생성 실패: ${createProfileError.message}` },
            { status: 500 }
          );
        }
        
        console.log("프로필 자동 생성 성공:", user!.id);
      } catch (adminError) {
        console.error("Admin 클라이언트 오류:", adminError);
        return NextResponse.json(
          { ok: false, error: `프로필 생성 실패: Service Role Key가 설정되지 않았습니다.` },
          { status: 500 }
        );
      }
    } else if (profileError) {
      console.error("프로필 확인 오류:", profileError);
      return NextResponse.json(
        { ok: false, error: `프로필 확인 실패: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Supabase에 명함 저장
    const { data, error } = await (supabase
      .from("business_cards") as any)
      .insert({
        user_id: user!.id,
        name: validatedData.name,
        company: validatedData.company || null,
        title: validatedData.title || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
        memo: validatedData.memo || null,
        tags: validatedData.tags || [],
        image_url: validatedData.imageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("명함 저장 오류:", error);
      return NextResponse.json(
        { ok: false, error: `명함 저장 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Cards API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "입력 데이터가 올바르지 않습니다.", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "명함 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 명함 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 개발 모드 체크
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    const cookies = request.cookies;
    const devModeUser = cookies.get("dev_mode_user");

    if (!user && !(isDevMode && devModeUser)) {
      return NextResponse.json(
        { ok: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 개발 모드에서는 빈 배열 반환
    if (isDevMode && devModeUser) {
      return NextResponse.json({ ok: true, data: [] });
    }

    // 명함 목록 조회
    const { data, error } = await supabase
      .from("business_cards")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("명함 조회 오류:", error);
      return NextResponse.json(
        { ok: false, error: `명함 조회 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Cards GET API error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "명함 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

