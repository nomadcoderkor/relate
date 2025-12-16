import { createClient } from "@/lib/supabase/server";
import type {
  BusinessCard,
  BusinessCardInsert,
  BusinessCardUpdate,
  BusinessCardFilter,
  BusinessCardStats,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

/**
 * 명함 관련 데이터베이스 헬퍼 함수들
 */

/**
 * 현재 사용자의 모든 명함을 가져옵니다 (필터링 및 페이지네이션 지원)
 */
export async function getBusinessCards(
  filter?: BusinessCardFilter,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<BusinessCard>>> {
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

    // 기본 쿼리
    let query = supabase
      .from("business_cards")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // 검색 필터
    if (filter?.search) {
      query = query.or(
        `name.ilike.%${filter.search}%,company.ilike.%${filter.search}%,title.ilike.%${filter.search}%`
      );
    }

    // 태그 필터
    if (filter?.tags && filter.tags.length > 0) {
      query = query.overlaps("tags", filter.tags);
    }

    // 날짜 범위 필터
    if (filter?.dateFrom) {
      query = query.gte("created_at", filter.dateFrom);
    }
    if (filter?.dateTo) {
      query = query.lte("created_at", filter.dateTo);
    }

    // 정렬
    const sortBy = filter?.sortBy || "created_at";
    const sortOrder = filter?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // 페이지네이션
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: cards, error, count } = await query;

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      data: {
        data: cards || [],
        total: count || 0,
        page,
        pageSize,
        hasMore: count ? from + pageSize < count : false,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * ID로 명함을 가져옵니다
 */
export async function getBusinessCardById(
  id: string
): Promise<ApiResponse<BusinessCard>> {
  try {
    const supabase = await createClient();

    const { data: card, error } = await supabase
      .from("business_cards")
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
      data: card,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 새 명함을 생성합니다
 */
export async function createBusinessCard(
  cardData: Omit<BusinessCardInsert, "user_id">
): Promise<ApiResponse<BusinessCard>> {
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

    const { data: card, error } = await (supabase
      .from("business_cards") as any)
      .insert({
        ...cardData,
        user_id: user.id,
      })
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
      data: card,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 명함을 업데이트합니다
 */
export async function updateBusinessCard(
  id: string,
  updates: BusinessCardUpdate
): Promise<ApiResponse<BusinessCard>> {
  try {
    const supabase = await createClient();

    const { data: card, error } = await (supabase
      .from("business_cards") as any)
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
      data: card,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 명함을 삭제합니다
 */
export async function deleteBusinessCard(id: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("business_cards")
      .delete()
      .eq("id", id);

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
 * 여러 명함을 한 번에 삭제합니다
 */
export async function deleteBusinessCards(
  ids: string[]
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("business_cards")
      .delete()
      .in("id", ids);

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
 * 태그로 명함을 검색합니다
 */
export async function searchBusinessCardsByTag(
  tag: string
): Promise<ApiResponse<BusinessCard[]>> {
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

    const { data: cards, error } = await (supabase as any).rpc(
      "search_business_cards_by_tag",
      {
        user_uuid: user.id,
        search_tag: tag,
      }
    );

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      data: cards || [],
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 사용자의 명함 통계를 가져옵니다
 */
export async function getBusinessCardStats(): Promise<
  ApiResponse<BusinessCardStats>
> {
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

    // 전체 명함 개수
    const { count: total } = await supabase
      .from("business_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 이번 달 생성된 명함 개수
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
      .from("business_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    // 최근 7일간 수정된 명함 개수
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentlyModified } = await supabase
      .from("business_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("updated_at", sevenDaysAgo.toISOString());

    // 상위 태그 (가장 많이 사용된 태그)
    const { data: cards } = await supabase
      .from("business_cards")
      .select("tags")
      .eq("user_id", user.id);

    const tagCounts: Record<string, number> = {};
    cards?.forEach((card: any) => {
      card.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      ok: true,
      data: {
        total: total || 0,
        thisMonth: thisMonth || 0,
        recentlyModified: recentlyModified || 0,
        topTags,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 모든 고유 태그 목록을 가져옵니다
 */
export async function getAllTags(): Promise<ApiResponse<string[]>> {
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

    const { data: cards, error } = await supabase
      .from("business_cards")
      .select("tags")
      .eq("user_id", user.id);

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    // 모든 태그를 수집하고 중복 제거
    const allTags = new Set<string>();
    cards?.forEach((card: any) => {
      card.tags?.forEach((tag: string) => allTags.add(tag));
    });

    return {
      ok: true,
      data: Array.from(allTags).sort(),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

