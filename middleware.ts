import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 개발 모드 체크
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const devModeUser = request.cookies.get("dev_mode_user");

  // 개발 모드이고 쿠키가 있으면 인증된 것으로 처리
  if (isDevMode && devModeUser) {
    const isAuthPage =
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup");

    // 이미 로그인한 사용자가 인증 페이지에 접근하면 대시보드로 리다이렉트
    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // 보호된 경로는 그대로 통과
    return NextResponse.next();
  }

  // 환경변수 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 없으면 로그인/회원가입 페이지로 리다이렉트
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    const isAuthPage =
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup");

    // 인증 페이지가 아니면 로그인으로 리다이렉트
    if (!isAuthPage && !request.nextUrl.pathname.startsWith("/_next")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // 인증 페이지는 그대로 통과
    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch (error) {
    // Supabase 연결 오류 시 로그인 페이지로
    console.error("Middleware error:", error);

    const isAuthPage =
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup");

    if (!isAuthPage && !request.nextUrl.pathname.startsWith("/_next")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
