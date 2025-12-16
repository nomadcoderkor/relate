import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * 명함 수정 스키마
 */
const updateCardSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
  address: z.string().optional(),
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  last_contact_date: z.string().optional(),
});

/**
 * 명함 조회
 * GET /api/cards/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params await 처리 (Next.js 15)
    const { id } = await params;

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

    // 개발 모드에서는 Mock 데이터
    if (isDevMode && devModeUser) {
      return NextResponse.json({
        ok: true,
        data: {
          id: id,
          user_id: "dev-user",
          name: "이승재",
          company: "(주) 더일퍼센트",
          title: "대표",
          phone: "064300932",
          email: "nomadcoder.kor@gmail.com",
          address: "경기도 용인시 서천로201번길 11 기흥테라타워 T10014호",
          memo: "노마드코더 운영자. 개발자 교육 플랫폼.",
          tags: ["개발", "교육"],
          image_url: null,
          last_contact_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Supabase에서 명함 조회
    const { data: card, error } = await supabase
      .from("business_cards")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (error) {
      console.error("명함 조회 오류:", error);
      
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { ok: false, error: "명함을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { ok: false, error: `명함 조회 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: card });
  } catch (error) {
    console.error("Cards [id] GET error:", error);

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

/**
 * 명함 수정
 * PATCH /api/cards/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params await 처리 (Next.js 15)
    const { id } = await params;

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
    const validatedData = updateCardSchema.parse(body);

    // 개발 모드에서는 Mock 응답
    if (isDevMode && devModeUser) {
      return NextResponse.json({
        ok: true,
        data: {
          id: id,
          ...validatedData,
          user_id: "dev-user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Supabase에서 명함 수정
    const { data, error } = await (supabase
      .from("business_cards") as any)
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user!.id)
      .select()
      .single();

    if (error) {
      console.error("명함 수정 오류:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json(
          { ok: false, error: "명함을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { ok: false, error: `명함 수정 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Cards [id] PATCH error:", error);

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
            : "명함 수정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 명함 삭제
 * DELETE /api/cards/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params await 처리 (Next.js 15)
    const { id } = await params;

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

    // 개발 모드에서는 Mock 응답
    if (isDevMode && devModeUser) {
      return NextResponse.json({
        ok: true,
        message: "명함이 삭제되었습니다.",
      });
    }

    // Supabase에서 명함 삭제
    const { error } = await supabase
      .from("business_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user!.id);

    if (error) {
      console.error("명함 삭제 오류:", error);

      return NextResponse.json(
        { ok: false, error: `명함 삭제 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "명함이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Cards [id] DELETE error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "명함 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

