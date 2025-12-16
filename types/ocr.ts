/**
 * Google Cloud Vision OCR 타입 정의
 */

/**
 * Google Cloud Vision API 응답 타입
 */
export interface GoogleVisionOcrResponse {
  responses: Array<{
    textAnnotations?: Array<{
      locale?: string;
      description: string;
      boundingPoly?: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
    }>;
    fullTextAnnotation?: {
      pages: Array<{
        width: number;
        height: number;
        blocks: Array<{
          boundingBox: {
            vertices: Array<{
              x: number;
              y: number;
            }>;
          };
          paragraphs: Array<{
            boundingBox: {
              vertices: Array<{
                x: number;
                y: number;
              }>;
            };
            words: Array<{
              boundingBox: {
                vertices: Array<{
                  x: number;
                  y: number;
                }>;
              };
              symbols: Array<{
                text: string;
                boundingBox: {
                  vertices: Array<{
                    x: number;
                    y: number;
                  }>;
                };
                confidence: number;
              }>;
              confidence: number;
            }>;
            confidence: number;
          }>;
        }>;
      }>;
      text: string;
    };
    error?: {
      code: number;
      message: string;
      status: string;
    };
  }>;
}

/**
 * 파싱된 명함 정보
 */
export interface ParsedCardInfo {
  name?: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  confidence: number; // 0-1 사이 값
  detectedFields?: string[]; // 추출된 필드 목록
}

/**
 * OCR 처리 결과
 */
export interface OcrResult {
  success: boolean;
  fullText?: string; // 전체 추출 텍스트
  parsedInfo?: ParsedCardInfo; // 파싱된 정보
  error?: string;
}

/**
 * 이미지 업로드 결과
 */
export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * API 응답 형식
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Google Cloud Vision 요청 옵션
 */
export interface GoogleVisionOptions {
  imageContent: string; // Base64 인코딩된 이미지
  features?: Array<{
    type: string;
    maxResults?: number;
  }>;
  imageContext?: {
    languageHints?: string[];
  };
}

/**
 * OCR 파싱 신뢰도
 */
export interface ParsingConfidence {
  overall: number;
  fields: {
    name: number;
    company: number;
    title: number;
    phone: number;
    email: number;
    address: number;
    website: number;
  };
}

/**
 * OCR.space API 응답 타입
 */
export interface OcrSpaceResponse {
  ParsedResults?: Array<{
    TextOverlay?: {
      Lines: Array<{
        LineText: string;
        Words: Array<{
          WordText: string;
          Left: number;
          Top: number;
          Height: number;
          Width: number;
        }>;
      }>;
      HasOverlay: boolean;
      Message: string;
    };
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
  ErrorDetails?: string;
  ProcessingTimeInMilliseconds?: string;
}
