import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { mockBusinessCards } from "@/lib/mock-data";
import type { Profile } from "@/types/database";

export default async function ProfilePage() {
  // 개발 모드 체크
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  // 개발 모드일 때 mock 데이터 사용
  if (isDevMode) {
    const user = {
      email: "test@example.com",
      created_at: new Date().toISOString(),
    };
    const profile = {
      name: "테스트 사용자",
      created_at: new Date().toISOString(),
    };
    const cardCount = mockBusinessCards.length;

    return (
      <div className="space-y-6 max-w-4xl">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
          <p className="text-gray-600 mt-1">내 정보를 확인하고 수정하세요</p>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 프로필 카드 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {profile?.name?.[0] || user.email?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {profile?.name || "사용자"}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* 프로필 정보 폼 */}
            <form className="space-y-4">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile?.name || ""}
                    placeholder="이름을 입력하세요"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 이메일 (읽기 전용) */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              {/* 가입일 */}
              <div className="space-y-2">
                <Label>가입일</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    value={
                      profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "ko-KR"
                          )
                        : "-"
                    }
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              {/* 저장 버튼 */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled
              >
                변경사항 저장
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 통계 및 정보 카드 */}
        <div className="space-y-6">
          {/* 활동 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">활동 통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">저장된 명함</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {cardCount || 0}
                  </p>
                </div>
                <User className="h-8 w-8 text-indigo-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">계정 상태</p>
                  <p className="text-sm font-semibold text-purple-700">
                    활성화됨
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* 계정 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">계정 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                비밀번호 변경
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled
              >
                계정 삭제
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  // 명함 통계
  const { count: cardCount } = await supabase
    .from("business_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
        <p className="text-gray-600 mt-1">내 정보를 확인하고 수정하세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 프로필 카드 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {profile?.name?.[0] || user.email?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {profile?.name || "사용자"}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* 프로필 정보 폼 */}
            <form className="space-y-4">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile?.name || ""}
                    placeholder="이름을 입력하세요"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 이메일 (읽기 전용) */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              {/* 가입일 */}
              <div className="space-y-2">
                <Label>가입일</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    value={
                      profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "ko-KR"
                          )
                        : "-"
                    }
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              {/* 저장 버튼 */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled
              >
                변경사항 저장
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 통계 및 정보 카드 */}
        <div className="space-y-6">
          {/* 활동 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">활동 통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">저장된 명함</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {cardCount || 0}
                  </p>
                </div>
                <User className="h-8 w-8 text-indigo-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">계정 상태</p>
                  <p className="text-sm font-semibold text-purple-700">
                    활성화됨
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* 계정 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">계정 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                비밀번호 변경
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled
              >
                계정 삭제
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
