# profiles 테이블 외래 키 제약 조건 수정 가이드

## 🚨 문제 상황

회원가입 시 다음 오류가 발생합니다:

```
프로필 자동 생성 오류: {
  code: '23503',
  details: 'Key (id)=(...) is not present in table "users".',
  message: 'insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"'
}
```

---

## 🔍 문제 원인

### 현재 상태 (잘못됨):
```
profiles.id → users (존재하지 않는 테이블)
```

### 올바른 상태:
```
profiles.id → auth.users (Supabase Auth 테이블)
```

**원인:**
- Supabase에서 마이그레이션 실행 시 스키마가 명시되지 않아 `public.users`로 인식
- 실제로는 `auth.users`를 참조해야 함

---

## ✅ 해결 방법 (5분)

### 1️⃣ Supabase Dashboard 접속

```
https://supabase.com/dashboard/project/gzwnaqmvrhjgwnqhygtw
```

### 2️⃣ SQL Editor 열기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭

### 3️⃣ 수정 SQL 실행

아래 SQL을 복사하여 붙여넣고 **Run** 클릭:

```sql
-- ============================================
-- profiles 테이블의 외래 키 제약 조건 수정
-- ============================================

-- 1. 기존 잘못된 외래 키 제약 조건 삭제
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. 올바른 외래 키 제약 조건 생성
-- profiles.id → auth.users.id 참조
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
```

### 4️⃣ 실행 결과 확인

**성공 메시지:**
```
Success. No rows returned
```

또는

```
ALTER TABLE
```

---

## 🔍 수정 확인 (선택)

제약 조건이 올바르게 설정되었는지 확인:

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profiles';
```

**예상 결과:**
```
constraint_name: profiles_id_fkey
table_name: profiles
column_name: id
foreign_table_schema: auth        ← 이게 "auth"여야 함!
foreign_table_name: users
foreign_column_name: id
```

---

## 🎯 회원가입 테스트

SQL 실행 후 회원가입을 다시 테스트하세요:

### 1. 브라우저 새로고침
```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

### 2. 회원가입 시도
1. `/signup` 페이지 접속
2. 이메일, 비밀번호, 이름 입력
3. **회원가입** 버튼 클릭

### 3. 성공 확인

**터미널 로그:**
```bash
프로필 자동 생성 성공: [user_id]
POST /signup 200 ✅
```

**브라우저:**
```
✅ 회원가입이 완료되었습니다.
이메일 확인을 완료한 후 로그인하세요.
```

---

## 🔧 문제 해결

### 오류 1: 제약 조건을 삭제할 수 없음

```
ERROR: constraint "profiles_id_fkey" of relation "profiles" does not exist
```

**의미:** 제약 조건이 이미 없거나 다른 이름으로 존재

**해결:** 2단계(추가)만 실행하세요:

```sql
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
```

---

### 오류 2: 제약 조건이 이미 존재함

```
ERROR: constraint "profiles_id_fkey" for relation "profiles" already exists
```

**의미:** 제약 조건이 이미 올바르게 설정됨

**해결:** 다른 제약 조건 이름이 문제일 수 있음. 모든 외래 키 확인:

```sql
-- profiles 테이블의 모든 외래 키 조회
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles'
  AND constraint_type = 'FOREIGN KEY';
```

잘못된 제약 조건이 있다면 해당 이름으로 삭제:

```sql
ALTER TABLE public.profiles
DROP CONSTRAINT [잘못된_제약조건_이름];
```

---

### 오류 3: auth.users 테이블이 없음

```
ERROR: relation "auth.users" does not exist
```

**의미:** Supabase Auth가 활성화되지 않음

**해결:**
1. Supabase Dashboard → **Authentication** 메뉴
2. **Settings** 확인
3. Email Auth 활성화 확인

---

## 📊 Supabase 테이블 구조

### 올바른 구조:

```
auth.users (Supabase가 관리)
   ↑
   | (외래 키)
   |
public.profiles (우리가 관리)
   ↑
   | (외래 키)
   |
public.business_cards (우리가 관리)
```

### 외래 키 관계:

```
profiles.id → auth.users.id
business_cards.user_id → profiles.id
```

---

## 🎉 완료 후

수정이 완료되면:

1. ✅ **회원가입 정상 작동**
   - 프로필 자동 생성
   - 외래 키 오류 없음

2. ✅ **로그인 정상 작동**
   - 세션 유지
   - 인증 확인

3. ✅ **명함 저장 정상 작동**
   - 프로필 참조 정상
   - 데이터베이스 저장 성공

---

## 🔗 관련 문서

- Supabase Foreign Keys: https://supabase.com/docs/guides/database/tables#foreign-keys
- Supabase Auth: https://supabase.com/docs/guides/auth
- 프로젝트 마이그레이션: `supabase/migrations/`

---

## 💡 예방 방법

앞으로 마이그레이션 작성 시:

```sql
-- ❌ 잘못된 방법 (스키마 생략)
id uuid references users on delete cascade

-- ✅ 올바른 방법 (스키마 명시)
id uuid references auth.users on delete cascade
```

**항상 스키마를 명시하세요!**

---

**지금 바로 Supabase Dashboard에서 SQL을 실행하세요!** 🚀

