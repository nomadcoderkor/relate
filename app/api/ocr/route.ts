/**
 * OCR API
 * 명함 이미지에서 텍스트 추출 및 파싱
 * OCR.space API 사용
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { callGoogleVisionOcr, getMockOcrResult } from "@/lib/ocr/google-vision";
import { parseOcrResult } from "@/lib/ocr/parser";
import type { OcrResult } from "@/types/ocr";

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

    // 개발 모드에서는 Mock 데이터 반환
    if (isDevMode) {
      const mockOcrResult = getMockOcrResult();
      
      if (!mockOcrResult.fullText) {
        return NextResponse.json(
          { ok: false, error: "Mock OCR 결과 생성 실패" },
          { status: 500 }
        );
      }

      const parsedData = parseOcrResult(mockOcrResult.fullText);

      // 약간의 지연 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json({
        ok: true,
        data: {
          success: true,
          fullText: mockOcrResult.fullText,
          parsedInfo: parsedData,
        },
      });
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

    // OCR.space API 설정 확인
    const apiKey = process.env.OCR_SPACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "OCR.space API 설정이 필요합니다. 환경변수를 확인해주세요.",
        },
        { status: 500 }
      );
    }

    // 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // OCR.space API 호출 (MIME 타입 전달)
    const ocrResult = await callGoogleVisionOcr(buffer, file.type);

    if (!ocrResult.success || !ocrResult.fullText) {
      return NextResponse.json(
        {
          ok: false,
          error: ocrResult.error || "텍스트를 인식할 수 없습니다.",
        },
        { status: 500 }
      );
    }

    // OCR 결과 파싱
    const parsedData = parseOcrResult(ocrResult.fullText);

    const result: OcrResult = {
      success: true,
      fullText: ocrResult.fullText,
      parsedInfo: parsedData,
    };

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("OCR API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "OCR 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
