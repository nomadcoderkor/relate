import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { mockBusinessCards } from "@/lib/mock-data";
import { CardsPageClient } from "@/components/features/cards/CardsPageClient";

async function getBusinessCards(userId: string) {
  const supabase = await createClient();

  const { data: cards, error } = await supabase
    .from("business_cards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("명함 조회 오류:", error);
    return [];
  }

  return cards || [];
}

export default async function CardsPage() {
  // 개발 모드 체크
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  // 개발 모드일 때 mock 데이터 사용
  let cards;
  if (isDevMode) {
    cards = mockBusinessCards;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    cards = await getBusinessCards(user.id);
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">명함 목록</h1>
          <p className="text-gray-600 mt-1">
            총 {cards.length}개의 명함이 있습니다
          </p>
        </div>
        <CardsPageClient />
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="이름, 회사명, 직함으로 검색..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 명함 그리드 */}
      {cards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <CreditCard className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              명함이 없습니다
            </h3>
            <p className="mt-2 text-gray-600">
              첫 번째 명함을 추가하여 관리를 시작하세요
            </p>
            <Link href="/cards/new">
              <Button className="mt-6 gap-2">
                <Plus className="h-4 w-4" />
                명함 추가하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.id} href={`/cards/${card.id}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-2 hover:border-indigo-200">
                <CardContent className="p-6">
                  {/* 명함 이미지 또는 아바타 */}
                  <div className="mb-4">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-6xl font-bold text-indigo-600">
                          {card.name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 명함 정보 */}
                  <div className="space-y-3">
                    {/* 이름 */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {card.name}
                      </h3>
                      {card.title && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Briefcase className="h-3 w-3" />
                          {card.title}
                        </p>
                      )}
                    </div>

                    {/* 회사 */}
                    {card.company && (
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {card.company}
                      </p>
                    )}

                    {/* 연락처 */}
                    <div className="space-y-2 pt-2 border-t">
                      {card.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {card.phone}
                        </p>
                      )}
                      {card.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-2 truncate">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {card.email}
                        </p>
                      )}
                      {card.address && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {card.address}
                        </p>
                      )}
                    </div>

                    {/* 태그 */}
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {card.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 메모 미리보기 */}
                    {card.memo && (
                      <p className="text-xs text-gray-500 italic line-clamp-2 pt-2 border-t">
                        {card.memo}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
