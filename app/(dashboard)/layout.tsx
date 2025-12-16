import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardNav } from "@/components/features/dashboard-nav";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 개발 모드 체크
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  // 개발 모드면 통과
  if (isDevMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav userName="테스트 사용자 (개발 모드)" />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* 개발 모드 배너 */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">🚀 개발 모드</span> - 테스트 계정으로 로그인했습니다. 실제 데이터는 저장되지 않습니다.
            </p>
          </div>
          {children}
        </main>
      </div>
    );
  }

  // 일반 모드: Supabase 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 사용자 프로필 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single() as { data: Pick<Profile, 'name'> | null };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userName={profile?.name || user.email || undefined} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
