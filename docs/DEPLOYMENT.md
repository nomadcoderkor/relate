# Vercel 배포 가이드

명함 관리 앱을 Vercel에 배포하는 완벽한 가이드입니다.

## 📋 배포 전 체크리스트

### ✅ 1. 코드 준비

- [ ] 모든 변경사항 커밋
- [ ] `.gitignore`에 환경변수 파일 포함 확인
- [ ] 로컬에서 프로덕션 빌드 테스트
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음

```bash
# 빌드 테스트
npm run build
npm start

# 타입 체크
npm run type-check

# Lint 체크
npm run lint
```

### ✅ 2. 환경변수 준비

필수 환경변수 목록:

#### 필수 (Supabase)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

#### 선택 (기능별)
- [ ] `OCR_SPACE_API_KEY` (명함 스캔)
- [ ] `OPENAI_API_KEY` (AI 기능)

#### 배포 설정
- [ ] `NEXT_PUBLIC_APP_URL` (배포 URL)
- [ ] `NEXT_PUBLIC_DEV_MODE=false` (프로덕션)

📖 전체 환경변수 가이드: [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md)

### ✅ 3. Supabase 설정

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 마이그레이션 적용
- [ ] RLS 정책 활성화
- [ ] Storage 버킷 생성 (`business-cards`)
- [ ] Storage 정책 설정
- [ ] 인증 설정 (이메일, 소셜 로그인)

```sql
-- SQL Editor에서 실행
-- supabase/migrations/001_initial_schema.sql
```

### ✅ 4. 외부 API 설정

#### Naver Clova OCR (선택)
- [ ] Naver Cloud Platform 계정
- [ ] Clova OCR 서비스 신청
- [ ] API Gateway 설정
- [ ] Secret Key 발급

#### OpenAI (선택)
- [ ] OpenAI 계정
- [ ] API Key 발급
- [ ] Usage Limits 설정

## 🚀 Vercel 배포 방법

### 방법 1: GitHub 연동 (추천)

#### 1단계: GitHub 저장소 생성

```bash
# Git 초기화 (아직 안했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 생성 후
git remote add origin https://github.com/your-username/business-card-app.git
git push -u origin main
```

#### 2단계: Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **"Add New..."** → **"Project"** 클릭
3. GitHub 저장소 선택
4. **Import** 클릭

#### 3단계: 프로젝트 설정

| 설정 | 값 |
|------|-----|
| Framework Preset | Next.js |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

#### 4단계: 환경변수 추가

**Environment Variables** 섹션에서:

```bash
# Production 환경
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OCR_SPACE_API_KEY=AIzaSyC-xxx
OPENAI_API_KEY=sk-proj-xxx
```

**Environment 선택:**
- ✅ Production
- ✅ Preview
- ⬜ Development (로컬 개발용)

#### 5단계: 배포

**"Deploy"** 버튼 클릭!

⏱️ 배포 시간: 약 2-3분

### 방법 2: Vercel CLI

#### 1단계: CLI 설치

```bash
npm i -g vercel
```

#### 2단계: 로그인

```bash
vercel login
```

#### 3단계: 프로젝트 연결

```bash
vercel
```

질문에 답변:
- Set up and deploy? **Y**
- Which scope? **your-account**
- Link to existing project? **N**
- Project name? **business-card-app**
- Directory? **./**

#### 4단계: 환경변수 추가

```bash
# Production 환경변수
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... 나머지 환경변수
```

또는 `.env.production` 파일에서 일괄 추가:

```bash
vercel env pull .env.production
```

#### 5단계: 프로덕션 배포

```bash
vercel --prod
```

### 방법 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/business-card-app)

1. 버튼 클릭
2. GitHub 계정 연결
3. 저장소 복제
4. 환경변수 입력
5. 배포!

## 🔧 배포 후 설정

### 1. 도메인 설정

#### Vercel 기본 도메인
- `https://your-project.vercel.app`
- 자동으로 HTTPS 제공

#### 커스텀 도메인 추가

1. Vercel Dashboard → **Settings** → **Domains**
2. 도메인 입력 (예: `businesscard.com`)
3. DNS 레코드 추가:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. SSL 자동 발급 ✅

### 2. 환경변수 업데이트

`NEXT_PUBLIC_APP_URL` 업데이트:

```bash
# Vercel Dashboard
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

### 3. Supabase 리다이렉트 URL 추가

Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL: https://your-domain.vercel.app
Redirect URLs:
  - https://your-domain.vercel.app/auth/callback
  - https://your-domain.vercel.app/login
```

### 4. OAuth 제공자 설정 (선택)

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/)
2. OAuth 2.0 Client ID 생성
3. Authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Supabase에 클라이언트 ID/Secret 추가

#### GitHub OAuth
1. [GitHub Developer Settings](https://github.com/settings/developers)
2. OAuth App 생성
3. Authorization callback URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Supabase에 클라이언트 ID/Secret 추가

## ✅ 배포 후 검증

### 1. 기능 테스트

- [ ] 로그인/회원가입
- [ ] 대시보드 로드
- [ ] 명함 목록 표시
- [ ] 명함 추가 (수동)
- [ ] 명함 스캔 (OCR)
- [ ] AI 메모 요약
- [ ] AI 연락 추천
- [ ] AI 메시지 생성
- [ ] 이미지 업로드
- [ ] 로그아웃

### 2. PWA 검증

Chrome DevTools (F12):

#### Application 탭
- [ ] Manifest 파일 로드
- [ ] Service Worker 등록
- [ ] 아이콘 표시 (192x192, 512x512)
- [ ] Cache Storage 작동

#### Lighthouse 탭
- [ ] Performance: 90+ 점
- [ ] Accessibility: 90+ 점
- [ ] Best Practices: 90+ 점
- [ ] SEO: 90+ 점
- [ ] PWA: 100점 (목표)

### 3. 모바일 테스트

#### iOS (Safari)
- [ ] 페이지 로드
- [ ] "홈 화면에 추가" 가능
- [ ] 전체 화면 실행
- [ ] 카메라 접근
- [ ] 오프라인 페이지

#### Android (Chrome)
- [ ] 페이지 로드
- [ ] 설치 프롬프트 표시
- [ ] 앱 설치
- [ ] 카메라 접근
- [ ] 오프라인 페이지

### 4. 보안 검증

- [ ] HTTPS 적용
- [ ] 보안 헤더 설정 (vercel.json)
- [ ] RLS 정책 활성화
- [ ] Service Role Key 서버 전용
- [ ] API Rate Limiting

## 📊 모니터링

### Vercel Analytics

1. Vercel Dashboard → **Analytics**
2. 실시간 트래픽 확인
3. 페이지 성능 분석

### Supabase Logs

1. Supabase Dashboard → **Logs**
2. API 요청 확인
3. 에러 모니터링

### 환경변수 확인

```bash
# Vercel CLI
vercel env ls
```

## 🔄 업데이트 배포

### GitHub 연동 (자동 배포)

```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel이 자동으로 배포! 🚀

### Preview 배포

```bash
# 브랜치 생성
git checkout -b feature/new-feature

# 변경사항 푸시
git push origin feature/new-feature
```

Pull Request 생성 시 자동으로 Preview URL 생성!

### 수동 재배포

```bash
# Vercel CLI
vercel --prod
```

## 🐛 트러블슈팅

### 빌드 실패

#### 에러: TypeScript 타입 에러
```bash
# 로컬에서 확인
npm run type-check
```

#### 에러: ESLint 에러
```bash
npm run lint
```

#### 에러: 환경변수 누락
- Vercel Dashboard에서 환경변수 확인
- `NEXT_PUBLIC_` 접두사 확인

### 런타임 에러

#### Supabase 연결 실패
```bash
# 환경변수 확인
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  ✅
NEXT_PUBLIC_SUPABASE_URL=http://xxx.supabase.co   ❌ (https 필수)
```

#### 이미지 업로드 실패
- Supabase Storage 버킷 생성 확인
- Storage 정책 설정 확인
- RLS 정책 확인

### PWA 문제

#### Service Worker 업데이트 안됨
```javascript
// 브라우저 콘솔
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));
location.reload();
```

#### 아이콘 표시 안됨
- 캐시 삭제: Settings → Privacy → Clear browsing data
- Hard refresh: Ctrl+Shift+R (또는 Cmd+Shift+R)
- 아이콘 경로 확인: `/icons/icon-192x192.png`

## 📈 성능 최적화

### 이미지 최적화

```tsx
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/icons/icon-512x512.png"
  alt="App Icon"
  width={512}
  height={512}
  priority
/>
```

### 코드 스플리팅

```tsx
// 동적 임포트
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### API Rate Limiting

```typescript
// app/api/ai/route.ts
const rateLimit = {
  windowMs: 60000, // 1분
  max: 10, // 10 요청
};
```

## 🔐 보안 강화

### 환경변수 검증

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
});

export const env = envSchema.parse(process.env);
```

### 보안 헤더 (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 📞 지원

### 문제 해결이 안되나요?

1. [Vercel 문서](https://vercel.com/docs)
2. [Supabase 문서](https://supabase.com/docs)
3. [GitHub Issues](https://github.com/your-username/business-card-app/issues)
4. [Discord 커뮤니티](https://discord.gg/your-server)

## 🎉 배포 완료!

축하합니다! 🎊

이제 다음 URL에서 앱을 사용할 수 있습니다:
- **Production**: https://your-domain.vercel.app
- **Preview**: https://git-branch-name.vercel.app

### 다음 단계

- [ ] 팀원 초대 (Vercel → Settings → Members)
- [ ] 커스텀 도메인 연결
- [ ] Analytics 모니터링
- [ ] 사용자 피드백 수집
- [ ] 기능 개선

---

**Happy Deploying! 🚀**

