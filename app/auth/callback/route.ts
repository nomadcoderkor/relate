import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

/**
 * 이메일 인증 링크 클릭 시 호출되는 콜백 핸들러
 * Supabase가 이메일 링크에서 code를 보내면, 이를 처리하여 세션을 생성
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    // code를 사용하여 세션 생성
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 프로덕션 URL로 리다이렉트 (로컬호스트가 아닌)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        // 로컬 개발 환경
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // 프로덕션 환경 - 명시적으로 프로덕션 URL 사용
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        return NextResponse.redirect(`${appUrl}${next}`);
      }
    }
  }

  // 오류 발생 시 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
}

