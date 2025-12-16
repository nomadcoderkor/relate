/**
 * 이미지 업로드 API
 * Supabase Storage에 명함 이미지 업로드
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { UploadResult } from "@/types/ocr";

export async function POST(request: NextRequest) {
  try {
    // #region agent log
    console.error('[DEBUG-A] Upload API 시작:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      devModeRaw: process.env.NEXT_PUBLIC_DEV_MODE,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    });
    // #endregion
    
    // 개발 모드 체크 (가장 먼저)
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    
    // #region agent log
    console.error('[DEBUG-E] 개발 모드 체크 완료:', { isDevMode });
    // #endregion
    
    // 환경변수 검증 (개발 모드가 아닐 때)
    if (!isDevMode) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('[DEBUG-A] 환경변수 누락:', {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });
        return NextResponse.json(
          { 
            ok: false, 
            error: "서버 설정 오류: Supabase 환경변수가 설정되지 않았습니다." 
          },
          { status: 500 }
        );
      }
    }

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
    // #region agent log
    console.error('[DEBUG-C] Supabase 클라이언트 생성 시작');
    // #endregion
    
    const supabase = await createClient();
    
    // #region agent log
    console.error('[DEBUG-C] Supabase 클라이언트 생성 완료, 인증 확인 시작');
    // #endregion
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    // #region agent log
    console.error('[DEBUG-C] 인증 확인 완료:', { hasUser: !!user, userId: user?.id });
    // #endregion

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
    // #region agent log
    console.error('[DEBUG-D] 파일 변환 시작:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
    });
    // #endregion
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // #region agent log
    console.error('[DEBUG-D] 파일 변환 완료, 업로드 시작:', { bufferLength: buffer.length });
    // #endregion

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("business-card-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    // #region agent log
    console.error('[DEBUG-B,D] 업로드 완료:', {
      hasUploadData: !!uploadData,
      hasUploadError: !!uploadError,
      uploadErrorMessage: uploadError?.message,
      uploadErrorDetails: uploadError,
    });
    // #endregion

    if (uploadError) {
      // #region agent log
      console.error('[DEBUG-B] Storage 업로드 실패:', {
        errorMessage: uploadError.message,
        errorName: uploadError.name,
        errorDetails: JSON.stringify(uploadError),
        fileName,
        bucketName: 'business-card-images',
      });
      // #endregion
      
      console.error("Storage upload error:", uploadError);
      
      // 더 자세한 에러 메시지 제공
      let errorMessage = `업로드 실패: ${uploadError.message}`;
      if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
        errorMessage += ' (Storage 버킷이 생성되지 않았을 수 있습니다)';
      } else if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
        errorMessage += ' (Storage 권한 설정을 확인해주세요)';
      }
      
      return NextResponse.json(
        { ok: false, error: errorMessage },
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
    // #region agent log
    console.error('[DEBUG-ERROR] Upload API 에러 발생:', {
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : 'Unknown',
      errorStack: error instanceof Error ? error.stack : '',
      error: error,
    });
    // #endregion
    
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

