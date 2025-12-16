# 환경변수 설정 가이드

`.env.local` 파일에 다음 환경변수를 설정하세요.

## 📋 전체 환경변수 목록

### Application URL
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
# 배포 시: https://your-domain.vercel.app
```

### Development Mode
```bash
NEXT_PUBLIC_DEV_MODE=true
# true: Mock 데이터 사용 (API 키 없이 테스트 가능)
# false: 실제 API 사용
```

### Supabase (필수)
```bash
# Public (클라이언트에서 사용)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role (서버에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Google Cloud Vision OCR (선택)
```bash
OCR_SPACE_API_KEY=AIzaSyC-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### OpenAI API (선택)
```bash
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🚀 로컬 개발 설정

### 1. .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEV_MODE=true

# Supabase (실제 값으로 변경)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key

# Google Cloud Vision OCR (선택)
OCR_SPACE_API_KEY=AIzaSyC-XXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OpenAI (선택)
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXX
```

### 2. 개발 서버 실행

```bash
npm run dev
```

## 🌐 Vercel 배포 설정

### 1. Vercel Dashboard 접속

1. [Vercel Dashboard](https://vercel.com/dashboard) 로그인
2. 프로젝트 선택
3. **Settings** > **Environment Variables**

### 2. 환경변수 추가

| 변수 이름 | 값 | 환경 |
|-----------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production, Preview, Development |
| `NEXT_PUBLIC_DEV_MODE` | `false` | Production |
| `NEXT_PUBLIC_DEV_MODE` | `true` | Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key | All |
| `OCR_SPACE_API_KEY` | Google Vision API Key | All |
| `OPENAI_API_KEY` | OpenAI API Key | All |

### 3. 재배포

환경변수 추가 후 자동으로 재배포됩니다.

## 🔒 보안 주의사항

### ❌ 절대 공개하지 말 것

- `SUPABASE_SERVICE_ROLE_KEY`
- `OCR_SPACE_API_KEY`
- `OPENAI_API_KEY`

### ✅ 클라이언트 노출 가능

- `NEXT_PUBLIC_`로 시작하는 모든 변수
- 브라우저 콘솔에서 접근 가능

### 📝 Best Practices

1. **Service Role Key는 서버에서만 사용**
   ```typescript
   // ✅ Good (Server Component/API Route)
   const supabase = createClient();
   const { data } = await supabase.from('table').select();
   
   // ❌ Bad (Client Component)
   // Service Role Key 사용 금지!
   ```

2. **환경변수 검증**
   ```typescript
   if (!process.env.OPENAI_API_KEY) {
     throw new Error('OPENAI_API_KEY is required');
   }
   ```

3. **Git에 절대 커밋하지 않기**
   ```bash
   # .gitignore에 포함되어 있음
   .env*.local
   .env
   ```

## 📚 환경변수별 상세 설명

### NEXT_PUBLIC_APP_URL
- **목적**: 앱의 베이스 URL
- **사용처**: 이메일 리다이렉트, OAuth 콜백
- **예시**: `https://business-card-app.vercel.app`

### NEXT_PUBLIC_DEV_MODE
- **목적**: 개발 모드 활성화
- **true**: Mock 데이터 사용, API 키 불필요
- **false**: 실제 API 사용
- **로컬**: `true`
- **배포**: `false`

### Supabase
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase 프로젝트 URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 클라이언트 인증용 키
- **SUPABASE_SERVICE_ROLE_KEY**: 관리자 권한 키 (서버 전용)

### Google Cloud Vision OCR
- **OCR_SPACE_API_KEY**: Google Cloud Vision API 키
- **기능**: 명함 스캔 및 텍스트 추출
- **무료 할당량**: 월 1,000건

### OpenAI
- **OPENAI_API_KEY**: OpenAI API 인증 키
- **기능**: AI 메모 요약, 연락 추천, 메시지 생성
- **모델**: gpt-4o-mini

## 🔧 트러블슈팅

### 환경변수가 인식되지 않음

```bash
# 1. 서버 재시작
npm run dev

# 2. .env.local 파일 위치 확인
# 프로젝트 루트에 있어야 함

# 3. 변수 이름 확인
# NEXT_PUBLIC_으로 시작하는지 확인
```

### Vercel에서 환경변수 오류

1. Dashboard에서 변수 확인
2. 환경 (Production/Preview/Development) 선택 확인
3. 재배포 필요 시 수동 재배포

### Supabase 연결 오류

```bash
# URL 형식 확인
https://xxxxx.supabase.co  # ✅
http://xxxxx.supabase.co   # ❌ (https 필수)

# Anon Key 확인
# Project Settings > API > anon public
```

## 📖 참고 자료

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)

