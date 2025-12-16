# 🚀 Vercel 배포 체크리스트

## 📋 배포 전 준비 (5분)

### ✅ 코드 준비
- [ ] 모든 변경사항 Git 커밋
- [ ] 로컬 빌드 테스트 성공 (`npm run build`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] Lint 체크 통과 (`npm run lint`)
- [ ] `.gitignore`에 환경변수 파일 포함 확인

### ✅ 환경변수 준비

#### 필수 (Supabase)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

#### 배포 설정
- [ ] `NEXT_PUBLIC_APP_URL` (배포 도메인)
- [ ] `NEXT_PUBLIC_DEV_MODE=false`

#### 선택 (기능별)
- [ ] `OCR_SPACE_API_KEY` (명함 스캔)
- [ ] `OPENAI_API_KEY` (AI 기능)

## 🗄️ Supabase 설정 (10분)

### 데이터베이스
- [ ] Supabase 프로젝트 생성
- [ ] SQL Editor에서 마이그레이션 실행
- [ ] `profiles` 테이블 생성 확인
- [ ] `business_cards` 테이블 생성 확인
- [ ] RLS 정책 활성화 확인

### Storage
- [ ] `business-cards` 버킷 생성
- [ ] 버킷 공개 설정
- [ ] Storage RLS 정책 설정

### Authentication
- [ ] 이메일 인증 활성화
- [ ] Site URL 설정
- [ ] Redirect URLs 추가
- [ ] (선택) Google OAuth 설정
- [ ] (선택) GitHub OAuth 설정

## 🌐 Vercel 배포 (5분)

### 프로젝트 생성
- [ ] [Vercel Dashboard](https://vercel.com/dashboard) 로그인
- [ ] GitHub 저장소 연결
- [ ] Import Project
- [ ] Framework: Next.js 선택

### 환경변수 설정
- [ ] 모든 환경변수 입력
- [ ] Environment: Production, Preview 선택
- [ ] 환경변수 값 확인 (오타 없는지)

### 배포 실행
- [ ] Deploy 버튼 클릭
- [ ] 빌드 성공 확인 (약 2-3분)
- [ ] 배포 URL 복사

## ✅ 배포 후 검증 (10분)

### 기본 기능
- [ ] 배포 URL 접속
- [ ] 로그인 페이지 로드
- [ ] 회원가입 기능
- [ ] 테스트 계정 로그인 (개발 모드 OFF 확인)
- [ ] 대시보드 표시

### 명함 관리
- [ ] 명함 목록 페이지
- [ ] 명함 수동 추가
- [ ] 명함 스캔 (OCR) - Naver API 설정 시
- [ ] 이미지 업로드
- [ ] 명함 검색

### AI 기능
- [ ] 메모 요약 - OpenAI API 설정 시
- [ ] 연락 추천 - OpenAI API 설정 시
- [ ] 메시지 생성 - OpenAI API 설정 시

### PWA
- [ ] Manifest 파일 로드
- [ ] Service Worker 등록
- [ ] 홈 화면 추가 가능 (모바일)
- [ ] 오프라인 페이지 작동

### Lighthouse 점수
- [ ] Performance: 90+ 점
- [ ] Accessibility: 90+ 점
- [ ] Best Practices: 90+ 점
- [ ] SEO: 90+ 점
- [ ] PWA: 100점

## 📱 모바일 테스트 (5분)

### iOS
- [ ] Safari에서 접속
- [ ] "홈 화면에 추가"
- [ ] 앱 실행
- [ ] 카메라 접근 (명함 스캔)

### Android
- [ ] Chrome에서 접속
- [ ] 설치 프롬프트
- [ ] 앱 설치
- [ ] 카메라 접근 (명함 스캔)

## 🔧 추가 설정 (선택)

### 도메인
- [ ] 커스텀 도메인 추가
- [ ] DNS 레코드 설정
- [ ] SSL 인증서 확인
- [ ] `NEXT_PUBLIC_APP_URL` 업데이트

### OAuth (선택)
- [ ] Google OAuth 설정
- [ ] GitHub OAuth 설정
- [ ] Redirect URLs 업데이트

### 모니터링
- [ ] Vercel Analytics 활성화
- [ ] Supabase Logs 확인
- [ ] 에러 모니터링 설정

## 🎉 배포 완료!

### 최종 확인
- [ ] Production URL: `https://______.vercel.app`
- [ ] 모든 핵심 기능 작동
- [ ] 모바일 반응형 확인
- [ ] 성능 최적화 확인

### 문서화
- [ ] README 업데이트
- [ ] 팀원에게 URL 공유
- [ ] 사용자 가이드 작성 (선택)

---

## 📞 문제 발생 시

### 빌드 실패
1. 로컬에서 `npm run build` 재실행
2. TypeScript 에러 수정
3. ESLint 경고 해결
4. 환경변수 확인

### 런타임 에러
1. Vercel Logs 확인
2. Supabase Logs 확인
3. 환경변수 값 검증
4. RLS 정책 확인

### PWA 문제
1. Service Worker 재등록
2. 브라우저 캐시 삭제
3. Hard refresh
4. Manifest 파일 확인

---

## 🔗 유용한 링크

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [배포 가이드 (상세)](./docs/DEPLOYMENT.md)
- [환경변수 가이드](./docs/ENVIRONMENT_VARIABLES.md)

---

**예상 소요 시간: 약 30-40분**

**배포 완료 시 팀원에게 알리세요!** 🎊

