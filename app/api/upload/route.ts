/**
 * 이미지 업로드 API
 * Supabase Storage에 명함 이미지 업로드
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { UploadResult } from "@/types/ocr";

export async function POST(request: NextRequest) {
  try {
    // 개발 모드 체크 (가장 먼저)
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "파일이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)",
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { ok: false, error: "파일 크기는 10MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    // 개발 모드에서는 Mock URL 반환
    if (isDevMode) {
      // 약간의 지연 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockUrl = `https://placehold.co/400x250/4F46E5/FFFFFF/png?text=${encodeURIComponent('명함 이미지')}`;
      const result: UploadResult = {
        success: true,
        imageUrl: mockUrl,
      };

      return NextResponse.json({ ok: true, data: result });
    }

    // 인증 확인 (개발 모드가 아닐 때만)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 실제 Supabase Storage 업로드
    const userId = user.id;
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${timestamp}.${fileExt}`;

    // ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("business-card-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { ok: false, error: `업로드 실패: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("business-card-images").getPublicUrl(fileName);

    const result: UploadResult = {
      success: true,
      imageUrl: publicUrl,
    };

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "업로드 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

