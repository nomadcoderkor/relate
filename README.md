# 🎴 명함 관리 앱

명함을 스캔하고 관리하며 AI로 연락을 추천받는 스마트 비즈니스 네트워크 관리 앱

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[데모 보기](https://your-domain.vercel.app) · [문제 보고](https://github.com/your-repo/issues) · [기능 요청](https://github.com/your-repo/issues)

</div>

## ✨ 주요 기능

### 📸 명함 스캔
- 카메라 또는 갤러리에서 명함 이미지 선택
- **Google Cloud Vision API**로 자동 정보 추출
- 이름, 회사, 직함, 연락처, 이메일 자동 인식

### 🤖 AI 기능
- **메모 자동 요약**: 긴 메모를 3줄로 간결하게 요약
- **연락 추천**: 마지막 연락일 분석하여 연락이 필요한 사람 추천
- **메시지 생성**: 카카오톡/이메일 톤으로 자연스러운 안부 메시지 작성

### 📇 명함 관리
- 명함 검색 및 필터링
- 태그 관리
- 메모 작성
- 마지막 연락일 기록

### 📊 대시보드
- 명함 통계 (전체, 이번 달 추가, 최근 수정)
- 최근 명함 목록
- AI 연락 추천

### 📱 PWA 지원
- 홈 화면에 추가
- 오프라인 지원
- 앱 같은 사용자 경험
- 카메라 접근 권한

## 🛠️ 기술 스택

### Frontend
- **Next.js 16** - App Router, Server Components
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 CSS
- **Shadcn/ui** - UI 컴포넌트

### Backend
- **Supabase** - 인증, 데이터베이스, 스토리지
- **PostgreSQL** - 관계형 데이터베이스
- **Row Level Security (RLS)** - 데이터 보안

### AI & OCR
- **OpenAI GPT-4o-mini** - AI 기능
- **Google Cloud Vision API** - 명함 텍스트 인식

### DevOps
- **Vercel** - 배포 플랫폼
- **PWA** - Progressive Web App
- **Service Worker** - 오프라인 지원

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/business-card-app.git
cd business-card-app
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.local` 파일 생성:

```bash
# 개발 모드 (API 키 없이 테스트 가능)
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (실제 값으로 변경)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 선택적 (개발 모드에서는 불필요)
OCR_SPACE_API_KEY=AIzaSyC-your-api-key
OPENAI_API_KEY=sk-proj-your-api-key
```

📖 전체 환경변수 목록: [`docs/ENVIRONMENT_VARIABLES.md`](./docs/ENVIRONMENT_VARIABLES.md)

### 4. 데이터베이스 설정

[Supabase Dashboard](https://supabase.com/dashboard)에서:

1. 새 프로젝트 생성
2. **SQL Editor** 열기
3. `supabase/migrations/001_initial_schema.sql` 내용 실행
4. 테이블 및 RLS 정책 자동 생성

📖 상세 가이드: [`supabase/README.md`](./supabase/README.md)

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 6. 테스트 계정 로그인

개발 모드에서는 **"🚀 테스트 계정으로 로그인"** 버튼으로 바로 체험 가능!

## 📦 프로젝트 구조

```
relate/
├── app/
│   ├── (auth)/                  # 인증 페이지
│   │   ├── login/               # 로그인
│   │   └── signup/              # 회원가입
│   ├── (dashboard)/             # 대시보드 레이아웃
│   │   ├── dashboard/           # 메인 대시보드
│   │   ├── cards/               # 명함 목록
│   │   └── profile/             # 사용자 프로필
│   ├── api/                     # API 라우트
│   │   ├── ai/                  # AI 기능 API
│   │   ├── cards/               # 명함 CRUD API
│   │   ├── ocr/                 # OCR 처리 API
│   │   └── upload/              # 이미지 업로드 API
│   ├── offline/                 # 오프라인 페이지
│   └── actions/                 # Server Actions
├── components/
│   ├── ui/                      # Shadcn/ui 컴포넌트
│   └── features/                # 기능별 컴포넌트
│       ├── ai/                  # AI 기능 컴포넌트
│       └── cards/               # 명함 관리 컴포넌트
├── lib/
│   ├── supabase/                # Supabase 클라이언트
│   ├── ai/                      # AI (OpenAI) 클라이언트
│   ├── ocr/                     # OCR 처리 로직
│   ├── db/                      # 데이터베이스 헬퍼
│   └── utils.ts
├── types/
│   ├── database.ts              # DB 타입
│   ├── ocr.ts                   # OCR 타입
│   └── ai.ts                    # AI 타입
├── supabase/
│   └── migrations/              # DB 마이그레이션
├── public/
│   ├── icons/                   # PWA 아이콘
│   └── manifest.json            # PWA 매니페스트
├── scripts/
│   ├── generate-icons.js        # 아이콘 생성
│   └── convert-icons-to-png.js  # PNG 변환
└── docs/
    ├── ENVIRONMENT_VARIABLES.md # 환경변수 가이드
    ├── OCR_SETUP.md             # OCR 설정
    ├── AI_SETUP.md              # AI 설정
    └── PWA_SETUP.md             # PWA 설정
```

## 🎯 사용 가능한 스크립트

```bash
# 개발
npm run dev              # 개발 서버 실행 (http://localhost:3000)

# 빌드
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행

# 코드 품질
npm run lint             # ESLint 실행
npm run type-check       # TypeScript 타입 체크

# 아이콘 생성
npm run generate:icons   # PWA 아이콘 생성
```

## 📚 상세 가이드

### 필수 설정
- 📘 [환경변수 설정](./docs/ENVIRONMENT_VARIABLES.md)
- 📘 [Supabase 데이터베이스](./supabase/README.md)

### 선택적 기능
- 📗 [OCR 명함 스캔](./docs/OCR_SETUP.md)
- 📗 [AI 기능 설정](./docs/AI_SETUP.md)
- 📗 [PWA 설정](./docs/PWA_SETUP.md)

### 배포
- 📕 [Vercel 배포 가이드](./docs/DEPLOYMENT.md)

## 🌐 Vercel 배포

### 빠른 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/business-card-app)

### 수동 배포

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인 및 배포**
   ```bash
   vercel
   ```

3. **환경변수 설정**
   - Vercel Dashboard > Settings > Environment Variables
   - 모든 환경변수 추가

4. **재배포**
   ```bash
   vercel --prod
   ```

📖 상세 가이드: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

## 🧪 개발 모드

API 키 없이 앱을 테스트할 수 있습니다:

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE=true
```

개발 모드에서는:
- ✅ 테스트 계정으로 로그인 가능
- ✅ Mock 데이터로 모든 기능 체험
- ✅ OCR Mock 응답
- ✅ AI Mock 응답
- ✅ Supabase 설정 불필요

## 🎨 주요 화면

### 로그인
- 이메일/비밀번호 로그인
- 소셜 로그인 (Google, GitHub)
- 테스트 계정 로그인 (개발 모드)

### 대시보드
- 명함 통계 카드
- 최근 추가 명함
- **AI 연락 추천** (이번 주 연락할 사람)

### 명함 목록
- 그리드 레이아웃
- 검색 및 필터
- **명함 스캔** 버튼 (OCR)
- 수동 입력

### 명함 상세
- 명함 정보 표시
- 메모 작성/수정
- **AI 메모 요약**
- **AI 메시지 생성**
- 태그 관리

## 🔐 보안

- ✅ Row Level Security (RLS)
- ✅ 서버 전용 API 키
- ✅ HTTPS (Vercel 자동)
- ✅ XSS 보호
- ✅ CSRF 토큰

## 📊 데이터베이스 스키마

### profiles
- 사용자 프로필 정보
- Supabase Auth 연동

### business_cards
- 명함 정보 (이름, 회사, 직함, 연락처 등)
- 이미지 URL
- 태그 배열
- 마지막 연락일

상세 스키마: [`types/database.ts`](./types/database.ts)

## 🤝 기여

Pull Request를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

MIT License - 자유롭게 사용하세요.

## 📧 문의

프로젝트 관련 문의: [Issues](https://github.com/your-username/business-card-app/issues)

## 🙏 감사

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Naver Clova OCR](https://www.ncloud.com/product/aiService/clovaOcr)
- [OpenAI](https://openai.com/)

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**

Made with ❤️ by Business Card App Team

</div>
