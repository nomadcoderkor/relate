# Supabase Service Role Key 설정 가이드

## 🚨 회원가입 기능 오류 해결

회원가입 시 프로필이 자동으로 생성되지 않는 문제를 해결하려면 **Service Role Key**가 필요합니다.

---

## 🔑 Service Role Key란?

- **Admin 권한**을 가진 API 키
- **Row Level Security (RLS)를 우회**할 수 있음
- 서버 측에서만 사용 (절대 프론트엔드에 노출 금지!)

---

## 📋 설정 방법 (3분)

### 1️⃣ Supabase Dashboard 접속

```
https://supabase.com/dashboard/project/gzwnaqmvrhjgwnqhygtw
```

### 2️⃣ API 키 복사

1. 왼쪽 메뉴 → **Settings** (⚙️)
2. **API** 메뉴 클릭
3. **Project API keys** 섹션으로 스크롤
4. **`service_role`** 키 찾기 (🔒 secret 표시)
5. **Copy** 버튼 클릭

**⚠️ 주의:**
- `anon` 키가 아닌 **`service_role`** 키를 복사하세요!
- 이 키는 매우 민감한 정보입니다.

---

### 3️⃣ .env.local에 추가

#### 방법 A: 수동으로 추가

`.env.local` 파일을 열고 다음 줄 추가:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 방법 B: 터미널로 추가

```bash
echo "SUPABASE_SERVICE_ROLE_KEY=여기에_복사한_키" >> .env.local
```

---

### 4️⃣ 개발 서버 재시작

```bash
# 터미널에서 Ctrl+C로 서버 중단
npm run dev
```

---

## ✅ 설정 확인

### 회원가입 테스트:

1. 브라우저에서 `/signup` 접속
2. 이메일, 비밀번호, 이름 입력
3. **회원가입** 버튼 클릭
4. ✅ "회원가입이 완료되었습니다" 메시지 확인

### 터미널 로그 확인:

```bash
# 성공 시:
프로필 자동 생성 성공: [user_id]
POST /signup 200
```

---

## 🔒 보안 주의사항

### ⚠️ 절대 하지 말아야 할 것:

1. ❌ **Git에 커밋하지 마세요**
   - `.env.local`은 이미 `.gitignore`에 포함됨
   
2. ❌ **프론트엔드 코드에 노출하지 마세요**
   - `NEXT_PUBLIC_` 접두사 사용 금지
   
3. ❌ **공개 저장소에 업로드하지 마세요**
   - GitHub, GitLab 등에 노출 금지

### ✅ 올바른 사용:

- ✅ 서버 측 코드에서만 사용 (Server Actions, API Routes)
- ✅ 환경변수로 안전하게 관리
- ✅ Vercel 배포 시 환경변수로 설정

---

## 🎯 Service Role Key가 필요한 이유

### 문제 상황:

```
프로필 생성 오류: {
  code: '42501',
  message: 'new row violates row-level security policy for table "profiles"'
}
```

### 원인:

1. Supabase는 보안을 위해 **RLS (Row Level Security)** 정책을 적용
2. 일반 클라이언트는 자신의 데이터만 접근 가능
3. 회원가입 시 프로필 생성은 **시스템 작업**이므로 Admin 권한 필요

### 해결:

- **Service Role Key**를 사용하면 RLS를 우회하여 프로필 생성 가능
- 서버 측에서만 사용하므로 안전함

---

## 📊 동작 방식

### 회원가입 흐름:

```
1. 사용자 회원가입 요청
   ↓
2. Supabase Auth에 사용자 생성
   ↓
3. Service Role Key로 profiles 테이블에 레코드 생성
   ↓
4. 회원가입 완료 ✅
```

### 명함 저장 흐름:

```
1. 사용자 명함 저장 요청
   ↓
2. profiles 테이블에서 사용자 확인
   ↓
3. 프로필 없으면 Service Role Key로 자동 생성
   ↓
4. business_cards 테이블에 명함 저장 ✅
```

---

## 🔧 문제 해결

### 오류 1: Service Role Key를 찾을 수 없음

```
Error: SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.
```

**해결:**
1. Supabase Dashboard에서 키 확인
2. `.env.local`에 올바르게 추가되었는지 확인
3. 개발 서버 재시작

---

### 오류 2: 잘못된 키 형식

```
Error: Invalid JWT
```

**해결:**
1. `service_role` 키인지 확인 (`anon` 키가 아님)
2. 키가 완전히 복사되었는지 확인 (공백, 개행 없이)
3. 키 앞뒤에 따옴표 없이 복사

---

### 오류 3: 여전히 프로필 생성 실패

```
프로필 생성 오류: ...
```

**해결:**
1. Supabase Dashboard → SQL Editor
2. 다음 SQL 실행하여 RLS 정책 확인:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

3. 필요시 `docs/SUPABASE_SETUP_QUICK.md`의 마이그레이션 재실행

---

## 🎉 완료!

설정이 완료되면:
- ✅ 회원가입 정상 작동
- ✅ 프로필 자동 생성
- ✅ 명함 저장 가능
- ✅ 모든 기능 정상 작동

---

## 📚 추가 자료

- [Supabase Service Role Keys 문서](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- 프로젝트 문서: `docs/ENVIRONMENT_VARIABLES.md`

