import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트
 * Client Components와 브라우저 측 로직에서 사용
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}

/**
 * 싱글톤 패턴으로 클라이언트 인스턴스 관리
 * 불필요한 재생성 방지
 */
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}
