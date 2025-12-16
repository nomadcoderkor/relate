import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  TrendingUp,
  Calendar,
  Tag,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMockStats } from "@/lib/mock-data";
import { FollowupSuggestionCard } from "@/components/features/ai/FollowupSuggestion";
import type { BusinessCard } from "@/types/database";

async function getStats(userId: string): Promise<{
  total: number;
  thisMonth: number;
  recentlyModified: number;
  recentCards: BusinessCard[];
}> {
  const supabase = await createClient();

  // 전체 명함 개수
  const { count: total } = await supabase
    .from("business_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // 이번 달 추가된 명함
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: thisMonth } = await supabase
    .from("business_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  // 최근 7일간 수정된 명함
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentlyModified } = await supabase
    .from("business_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("updated_at", sevenDaysAgo.toISOString());

  // 최근 명함 목록
  const { data: recentCards } = await supabase
    .from("business_cards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    total: total || 0,
    thisMonth: thisMonth || 0,
    recentlyModified: recentlyModified || 0,
    recentCards: recentCards || [],
  };
}

export default async function DashboardPage() {
  // 개발 모드 체크
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  // 개발 모드일 때 mock 데이터 사용
  if (isDevMode) {
    const stats = getMockStats();

    return (
      <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">명함 관리 현황을 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <Link href="/cards">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              명함 검색
            </Button>
          </Link>
          <Link href="/cards/new">
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="h-4 w-4" />
              명함 추가
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 전체 명함 */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              전체 명함
            </CardTitle>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {stats.total}
            </div>
            <p className="text-xs text-blue-700 mt-1">저장된 명함 수</p>
          </CardContent>
        </Card>

        {/* 이번 달 추가 */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              이번 달 추가
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats.thisMonth}
            </div>
            <p className="text-xs text-green-700 mt-1">신규 명함</p>
          </CardContent>
        </Card>

        {/* 최근 수정 */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              최근 수정
            </CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {stats.recentlyModified}
            </div>
            <p className="text-xs text-purple-700 mt-1">최근 7일</p>
          </CardContent>
        </Card>

        {/* 태그 */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              태그 관리
            </CardTitle>
            <Tag className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">0</div>
            <p className="text-xs text-orange-700 mt-1">사용 중인 태그</p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 명함 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>최근 추가된 명함</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                최근에 추가된 명함을 확인하세요
              </p>
            </div>
            <Link href="/cards">
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentCards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                명함이 없습니다
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                첫 번째 명함을 추가해보세요
              </p>
              <Link href="/cards/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  명함 추가
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-700">
                        {card.name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {card.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {card.company || "회사 정보 없음"} {card.title && `· ${card.title}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex gap-1">
                        {card.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    );
  }

  // 일반 모드: Supabase 사용
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const stats = await getStats(user.id);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">명함 관리 현황을 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <Link href="/cards">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              명함 검색
            </Button>
          </Link>
          <Link href="/cards/new">
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="h-4 w-4" />
              명함 추가
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 전체 명함 */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              전체 명함
            </CardTitle>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {stats.total}
            </div>
            <p className="text-xs text-blue-700 mt-1">저장된 명함 수</p>
          </CardContent>
        </Card>

        {/* 이번 달 추가 */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              이번 달 추가
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats.thisMonth}
            </div>
            <p className="text-xs text-green-700 mt-1">신규 명함</p>
          </CardContent>
        </Card>

        {/* 최근 수정 */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              최근 수정
            </CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {stats.recentlyModified}
            </div>
            <p className="text-xs text-purple-700 mt-1">최근 7일</p>
          </CardContent>
        </Card>

        {/* 태그 */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              태그 관리
            </CardTitle>
            <Tag className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">0</div>
            <p className="text-xs text-orange-700 mt-1">사용 중인 태그</p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 명함 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>최근 추가된 명함</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                최근에 추가된 명함을 확인하세요
              </p>
            </div>
            <Link href="/cards">
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentCards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                명함이 없습니다
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                첫 번째 명함을 추가해보세요
              </p>
              <Link href="/cards/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  명함 추가
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-700">
                        {card.name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {card.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {card.company || "회사 정보 없음"} {card.title && `· ${card.title}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex gap-1">
                        {card.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI 팔로업 제안 */}
      <FollowupSuggestionCard />
    </div>
  );
}
