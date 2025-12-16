import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

/**
 * Supabase Storage 헬퍼 함수들
 * 명함 이미지 업로드/다운로드/삭제
 */

const BUCKET_NAME = "business-card-images";

/**
 * 명함 이미지를 업로드합니다
 * @param file - 업로드할 파일
 * @param userId - 사용자 ID
 * @param cardId - 명함 ID (선택사항, 없으면 자동 생성)
 * @returns 업로드된 이미지의 공개 URL
 */
export async function uploadCardImage(
  file: File,
  userId: string,
  cardId?: string
): Promise<ApiResponse<string>> {
  try {
    const supabase = await createClient();

    // 파일 확장자 추출
    const fileExt = file.name.split(".").pop();
    const fileName = cardId
      ? `${cardId}.${fileExt}`
      : `${Date.now()}.${fileExt}`;

    // 파일 경로: {userId}/{fileName}
    const filePath = `${userId}/${fileName}`;

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // 같은 이름이 있으면 덮어쓰기
      });

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      ok: true,
      data: publicUrl,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 명함 이미지를 삭제합니다
 * @param imageUrl - 삭제할 이미지 URL
 * @returns 성공 여부
 */
export async function deleteCardImage(
  imageUrl: string
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    // URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);

    if (bucketIndex === -1) {
      return {
        ok: false,
        error: "잘못된 이미지 URL입니다.",
      };
    }

    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    // 파일 삭제
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

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

/**
 * 여러 명함 이미지를 한 번에 삭제합니다
 * @param imageUrls - 삭제할 이미지 URL 배열
 * @returns 성공 여부
 */
export async function deleteCardImages(
  imageUrls: string[]
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    const filePaths: string[] = [];

    // 각 URL에서 파일 경로 추출
    for (const imageUrl of imageUrls) {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf(BUCKET_NAME);

      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");
        filePaths.push(filePath);
      }
    }

    if (filePaths.length === 0) {
      return {
        ok: false,
        error: "삭제할 이미지가 없습니다.",
      };
    }

    // 파일들 삭제
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

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

/**
 * 이미지 URL에서 서명된(signed) URL을 생성합니다
 * 비공개 버킷의 경우 필요
 * @param imagePath - 이미지 경로
 * @param expiresIn - URL 만료 시간 (초), 기본값 3600초 (1시간)
 * @returns 서명된 URL
 */
export async function getSignedUrl(
  imagePath: string,
  expiresIn: number = 3600
): Promise<ApiResponse<string>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(imagePath, expiresIn);

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      data: data.signedUrl,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자의 모든 이미지 목록을 가져옵니다
 * @param userId - 사용자 ID
 * @returns 이미지 경로 배열
 */
export async function listUserImages(
  userId: string
): Promise<ApiResponse<string[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    const filePaths = data.map((file) => `${userId}/${file.name}`);

    return {
      ok: true,
      data: filePaths,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

