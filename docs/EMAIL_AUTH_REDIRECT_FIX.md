# 이메일 인증 후 로컬호스트 리다이렉트 문제 해결

## 🐛 문제 증상

이메일 인증 링크를 클릭하면 **프로덕션 도메인이 아닌 localhost로 리다이렉트**되는 문제

## 🔍 원인

1. **Supabase Site URL이 localhost로 설정**되어 있음
2. **Redirect URLs에 프로덕션 URL이 누락**됨
3. **환경 변수 `NEXT_PUBLIC_APP_URL`이 올바르게 설정되지 않음**

## ✅ 해결 방법

### 1단계: Supabase Dashboard 설정

#### 1-1. Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택

#### 1-2. URL Configuration 설정
1. 왼쪽 메뉴 → **Authentication** → **URL Configuration**
2. 아래와 같이 설정:

```plaintext
Site URL:
https://your-actual-domain.vercel.app

Additional Redirect URLs (한 줄에 하나씩 입력):
https://your-actual-domain.vercel.app/**
https://your-actual-domain.vercel.app/auth/callback
https://your-actual-domain.vercel.app/dashboard
http://localhost:3000/** (로컬 개발용 - 선택사항)
http://localhost:3000/auth/callback (로컬 개발용 - 선택사항)
```

**❗ 중요:** `your-actual-domain.vercel.app`을 실제 Vercel 도메인으로 변경하세요!

예시:
```plaintext
Site URL:
https://business-card-app.vercel.app

Additional Redirect URLs:
https://business-card-app.vercel.app/**
https://business-card-app.vercel.app/auth/callback
https://business-card-app.vercel.app/dashboard
http://localhost:3000/**
http://localhost:3000/auth/callback
```

3. **Save** 버튼 클릭

---

### 2단계: Vercel 환경변수 설정

#### 2-1. Vercel Dashboard 접속
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**

#### 2-2. 환경변수 추가/수정

다음 환경변수를 **Production**, **Preview**, **Development** 환경 모두에 추가:

| 변수 이름 | 값 | 환경 |
|----------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://your-actual-domain.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://git-branch-name.vercel.app` | Preview (선택) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development (로컬용) |

**❗ 주의:**
- Production 환경의 `NEXT_PUBLIC_APP_URL`은 **반드시** 실제 배포된 Vercel 도메인과 일치해야 합니다
- Supabase의 Site URL과 동일해야 합니다

#### 2-3. 재배포
환경변수 변경 후 **자동으로 재배포**되거나, 수동으로 재배포:
```bash
# Vercel CLI 사용
vercel --prod
```

---

### 3단계: 코드 변경 확인

#### 3-1. Auth Callback 라우트 확인
`app/auth/callback/route.ts` 파일이 존재하고 다음과 같은지 확인:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        return NextResponse.redirect(`${appUrl}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
}
```

#### 3-2. Supabase Client 설정 확인
`lib/supabase/client.ts`에서 auth 옵션이 설정되었는지 확인:

```typescript
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
```

#### 3-3. 회원가입 액션 확인
`app/actions/auth.ts`에서 `emailRedirectTo`가 올바르게 설정되었는지 확인:

```typescript
const { data: authData, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
    },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  },
});
```

---

## 🧪 테스트

### 로컬 환경 테스트
1. `.env.local` 파일에 다음 추가:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. 개발 서버 재시작:
```bash
npm run dev
```

3. 회원가입 테스트:
   - 새 이메일로 회원가입
   - 이메일 확인 링크 클릭
   - **localhost:3000**으로 리다이렉트되는지 확인

### 프로덕션 환경 테스트
1. Vercel에 배포

2. 프로덕션에서 회원가입 테스트:
   - 실제 이메일로 회원가입
   - 이메일 확인 링크 클릭
   - **프로덕션 도메인**으로 리다이렉트되는지 확인
   - ❌ localhost로 가면 안됨!

---

## 🔍 문제 해결

### 여전히 localhost로 리다이렉트되는 경우

#### 1. Supabase Site URL 다시 확인
```plaintext
❌ 잘못된 예:
Site URL: http://localhost:3000

✅ 올바른 예:
Site URL: https://your-domain.vercel.app
```

#### 2. 환경변수 다시 확인
Vercel Dashboard에서:
```bash
# Production 환경에서 확인
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app  ✅
NEXT_PUBLIC_APP_URL=http://localhost:3000  ❌
```

#### 3. 브라우저 캐시 삭제
```plaintext
Chrome: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)
→ "쿠키 및 사이트 데이터", "캐시된 이미지 및 파일" 선택
→ "데이터 삭제"
```

#### 4. Vercel 로그 확인
```bash
# Vercel CLI
vercel logs
```

환경변수가 제대로 로드되었는지 확인

#### 5. Supabase Auth Logs 확인
Supabase Dashboard → **Auth** → **Logs**
- 어떤 redirect_url이 사용되고 있는지 확인

---

## 📝 체크리스트

설정이 완료되었는지 확인:

### Supabase
- [ ] Site URL이 프로덕션 도메인으로 설정됨
- [ ] Redirect URLs에 프로덕션 도메인 추가됨
- [ ] localhost URL도 추가됨 (로컬 개발용)

### Vercel
- [ ] `NEXT_PUBLIC_APP_URL`이 Production 환경에 설정됨
- [ ] 값이 프로덕션 도메인과 일치함
- [ ] 환경변수 변경 후 재배포됨

### 코드
- [ ] `app/auth/callback/route.ts` 파일이 존재함
- [ ] `lib/supabase/client.ts`에 auth 옵션 설정됨
- [ ] `app/actions/auth.ts`에 `emailRedirectTo` 설정됨

### 테스트
- [ ] 로컬에서 이메일 인증 테스트 성공
- [ ] 프로덕션에서 이메일 인증 테스트 성공
- [ ] localhost로 리다이렉트되지 않음 ✅

---

## 🎉 완료!

모든 설정이 완료되면:
- ✅ 이메일 확인 링크가 프로덕션 도메인으로 리다이렉트됨
- ✅ 로컬 개발 시에는 localhost로 리다이렉트됨
- ✅ 사용자가 정상적으로 이메일 인증 후 로그인됨

---

## 💡 추가 팁

### 커스텀 도메인 사용 시
커스텀 도메인 (예: `www.myapp.com`)을 사용하는 경우:

1. Vercel에서 도메인 연결
2. Supabase Site URL을 커스텀 도메인으로 변경:
```plaintext
Site URL: https://www.myapp.com
```

3. 환경변수도 변경:
```bash
NEXT_PUBLIC_APP_URL=https://www.myapp.com
```

### Preview 배포 (Git 브랜치)
Preview 배포에서도 이메일 인증을 테스트하려면:

1. Supabase Redirect URLs에 추가:
```plaintext
https://*.vercel.app/**
```

2. 또는 특정 Preview URL 추가:
```plaintext
https://git-feature-branch.vercel.app/**
```

---

## 📚 참고 문서
- [Supabase Auth Deep Dive](https://supabase.com/docs/guides/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)


