"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CreditCard, Mail, Lock, User, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

// 환경변수 체크
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          가입 중...
        </>
      ) : (
        <>
          회원가입
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, {});

  // 회원가입 성공 시 표시할 화면
  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              회원가입 완료!
            </h2>
            <p className="text-gray-600 mb-6">
              인증 이메일을 전송했습니다.
              <br />
              이메일을 확인하여 계정을 활성화하세요.
            </p>
            <Link href="/login">
              <Button className="w-full" size="lg">
                로그인하러 가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            명함 관리 앱
          </h1>
          <p className="text-gray-600">새 계정을 만들어보세요</p>
        </div>

        {/* 회원가입 카드 */}
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <CardDescription>
              정보를 입력하여 계정을 만드세요
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              {/* Supabase 미설정 경고 */}
              {!isSupabaseConfigured && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Supabase 미설정</p>
                    <p className="text-xs mt-1">
                      실제 회원가입을 사용하려면 <code className="bg-amber-100 px-1 rounded">.env.local</code> 파일에 Supabase 환경변수를 설정하세요.
                    </p>
                  </div>
                </div>
              )}

              {/* 전체 에러 메시지 */}
              {state.errors?._form && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {state.errors._form[0]}
                </div>
              )}

              {/* 이름 입력 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  이름
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="홍길동"
                    className="pl-10 h-11"
                    required
                  />
                </div>
                {state.errors?.name && (
                  <p className="text-sm text-red-600">{state.errors.name[0]}</p>
                )}
              </div>

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  이메일
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 h-11"
                    required
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-sm text-red-600">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  비밀번호
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    required
                  />
                </div>
                {state.errors?.password && (
                  <p className="text-sm text-red-600">
                    {state.errors.password[0]}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  최소 6자 이상의 비밀번호를 입력하세요
                </p>
              </div>

              {/* 이용약관 동의 */}
              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  <Link href="/terms" className="text-indigo-600 hover:underline">
                    이용약관
                  </Link>
                  과{" "}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다
                </label>
              </div>

              {/* 회원가입 버튼 */}
              <SubmitButton />
            </CardContent>
            <CardFooter>
              <div className="text-center w-full text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  로그인
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 명함 관리 앱. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
