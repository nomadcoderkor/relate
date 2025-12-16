/**
 * OCR.space API 클라이언트
 * 
 * 명함 이미지에서 텍스트를 추출합니다.
 * OCR.space는 무료 티어를 제공하며 API 키만으로 간단히 사용 가능합니다.
 */

import sharp from "sharp";
import type { OcrResult } from "@/types/ocr";

/**
 * OCR.space API 응답 타입
 */
interface OcrSpaceResponse {
  ParsedResults?: Array<{
    TextOverlay?: {
      Lines?: Array<{
        LineText: string;
      }>;
    };
    ParsedText?: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string | null;
  ErrorDetails?: string;
}

/**
 * OCR.space API를 호출하여 이미지에서 텍스트 추출
 * 
 * @param imageBuffer - 이미지 파일의 Buffer
 * @param mimeType - 이미지의 MIME 타입 (예: "image/jpeg")
 * @returns OCR 처리 결과
 */
export async function callGoogleVisionOcr(
  imageBuffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<OcrResult> {
  try {
    // 환경변수 확인
    const apiKey = process.env.OCR_SPACE_API_KEY;
    
    if (!apiKey) {
      throw new Error("OCR_SPACE_API_KEY is not configured");
    }

    // 이미지 리사이징 (OCR.space 1MB 제한 대응)
    // Base64 인코딩은 원본의 약 133% 크기가 되므로
    // 안전하게 500KB 이하로 압축합니다
    let processedBuffer = imageBuffer;
    
    // 이미지 메타데이터 확인
    const metadata = await sharp(imageBuffer).metadata();
    const originalSize = imageBuffer.length;
    
    console.log("Original image info:", {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: originalSize,
      sizeKB: Math.round(originalSize / 1024),
    });

    // 500KB(512000 bytes) 이상이면 리사이징
    if (originalSize > 512000) {
      console.log("Image too large, resizing...");
      
      // 명함 인식에 적합한 크기로 리사이징 (최대 1600px)
      // JPEG 품질 85%로 압축
      processedBuffer = await sharp(imageBuffer)
        .resize(1600, 1600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      const newSize = processedBuffer.length;
      console.log("Resized image info:", {
        originalSizeKB: Math.round(originalSize / 1024),
        newSizeKB: Math.round(newSize / 1024),
        reduction: Math.round((1 - newSize / originalSize) * 100) + "%",
      });
    }

    // Base64 인코딩
    const base64Image = processedBuffer.toString("base64");

    // MIME 타입을 파일 확장자로 변환
    const getFileExtension = (mime: string): string => {
      const mimeMap: { [key: string]: string } = {
        "image/jpeg": "JPG",
        "image/jpg": "JPG",
        "image/png": "PNG",
        "image/webp": "PNG", // WebP를 PNG로 처리
        "image/gif": "GIF",
        "image/bmp": "BMP",
      };
      return mimeMap[mime.toLowerCase()] || "JPG";
    };

    const fileType = getFileExtension(mimeType);

    // 디버깅: 요청 파라미터 로깅
    console.log("OCR.space API request params:", {
      mimeType,
      fileType,
      base64Length: base64Image.length,
    });

    // URLSearchParams를 사용한 Form-encoded 방식
    // OCR.space는 application/x-www-form-urlencoded를 선호함
    const formParams = new URLSearchParams();
    formParams.append("base64Image", `data:${mimeType};base64,${base64Image}`);
    formParams.append("filetype", fileType);
    formParams.append("language", "kor");
    formParams.append("isOverlayRequired", "false");
    formParams.append("detectOrientation", "true");
    formParams.append("scale", "true");
    formParams.append("OCREngine", "2");

    // OCR.space API 요청
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apikey: apiKey,
      },
      body: formParams.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `OCR.space API error: ${response.status} - ${response.statusText}`
      );
    }

    const data: OcrSpaceResponse = await response.json();

    // 디버깅: API 응답 로깅
    console.log("OCR.space API response:", {
      OCRExitCode: data.OCRExitCode,
      IsErroredOnProcessing: data.IsErroredOnProcessing,
      ErrorMessage: data.ErrorMessage,
      ErrorDetails: data.ErrorDetails,
      ParsedResults: data.ParsedResults?.length || 0,
    });

    // 에러 체크
    if (data.IsErroredOnProcessing) {
      console.error("OCR.space processing error details:", {
        ErrorMessage: data.ErrorMessage,
        ErrorDetails: data.ErrorDetails,
        ParsedResults: data.ParsedResults,
      });
      throw new Error(
        `OCR processing error: ${data.ErrorMessage || "Unknown error"}${
          data.ErrorDetails ? ` - ${data.ErrorDetails}` : ""
        }`
      );
    }

    // 텍스트 추출
    const fullText = extractFullText(data);

    if (!fullText) {
      return {
        success: false,
        error: "No text detected in the image",
      };
    }

    return {
      success: true,
      fullText,
    };
  } catch (error) {
    console.error("OCR.space error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown OCR error",
    };
  }
}

/**
 * OCR.space 응답에서 전체 텍스트 추출
 */
function extractFullText(response: OcrSpaceResponse): string {
  const parsedResults = response.ParsedResults;
  
  if (!parsedResults || parsedResults.length === 0) {
    return "";
  }

  const firstResult = parsedResults[0];

  // ParsedText가 가장 간단하고 정확함
  if (firstResult.ParsedText) {
    return firstResult.ParsedText.trim();
  }

  // TextOverlay의 Lines로부터 추출
  if (firstResult.TextOverlay?.Lines) {
    return firstResult.TextOverlay.Lines.map((line) => line.LineText)
      .join("\n")
      .trim();
  }

  return "";
}

/**
 * 개발 모드용 Mock OCR 응답
 */
export function getMockOcrResult(): OcrResult {
  return {
    success: true,
    fullText: `홍길동
주식회사 테크노바
대표이사

서울시 강남구 테헤란로 123
Mobile: 010-1234-5678
Email: hong@technova.com
www.technova.com`,
  };
}

