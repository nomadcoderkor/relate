# Supabase 데이터베이스 설정

이 폴더에는 Supabase 데이터베이스 마이그레이션 파일이 포함되어 있습니다.

## 📁 구조

```
supabase/
└── migrations/
    └── 001_initial_schema.sql  # 초기 데이터베이스 스키마
```

## 🚀 마이그레이션 적용 방법

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. `migrations/001_initial_schema.sql` 파일의 내용을 복사
5. SQL Editor에 붙여넣기
6. **Run** 버튼 클릭

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (아직 설치하지 않았다면)
npm install -g supabase

# Supabase 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 적용
supabase db push
```

## 📊 데이터베이스 스키마

### 1. profiles 테이블

사용자 프로필 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | 사용자 ID (auth.users와 연결) |
| email | text | 이메일 |
| name | text | 이름 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

**RLS 정책:**
- ✅ 사용자는 자신의 프로필만 조회 가능
- ✅ 사용자는 자신의 프로필만 수정 가능

### 2. business_cards 테이블

명함 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | 명함 고유 ID |
| user_id | uuid | 소유자 ID (profiles 참조) |
| name | text | 명함 주인 이름 (필수) |
| company | text | 회사명 |
| title | text | 직함 |
| phone | text | 전화번호 |
| email | text | 이메일 |
| address | text | 주소 |
| memo | text | 사용자 메모 |
| image_url | text | 명함 이미지 URL |
| last_contact_date | date | 마지막 연락일 |
| tags | text[] | 태그 배열 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

**인덱스:**
- user_id (명함 조회 최적화)
- name (이름 검색 최적화)
- company (회사명 검색 최적화)
- tags (GIN 인덱스, 태그 검색 최적화)
- created_at (정렬 최적화)
- last_contact_date (정렬 최적화)

**RLS 정책:**
- ✅ 사용자는 자신의 명함만 조회 가능
- ✅ 사용자는 자신의 명함만 생성 가능
- ✅ 사용자는 자신의 명함만 수정 가능
- ✅ 사용자는 자신의 명함만 삭제 가능

### 3. Storage 버킷

**business-card-images** 버킷이 자동으로 생성됩니다.

**Storage 정책:**
- ✅ 사용자는 자신의 폴더에만 이미지 업로드 가능
- ✅ 사용자는 자신의 이미지만 조회 가능
- ✅ 사용자는 자신의 이미지만 수정/삭제 가능

파일 경로 구조: `{user_id}/{filename}`

## 🔧 유용한 함수들

마이그레이션에 포함된 PostgreSQL 함수:

### 1. handle_updated_at()
`updated_at` 컬럼을 자동으로 업데이트하는 트리거 함수

### 2. handle_new_user()
새 사용자가 가입하면 자동으로 프로필 레코드를 생성

### 3. get_business_card_count(user_uuid)
특정 사용자의 명함 개수 반환

```sql
SELECT get_business_card_count('user-uuid-here');
```

### 4. get_business_cards_created_in_period(user_uuid, start_date, end_date)
특정 기간 동안 생성된 명함 개수 반환

```sql
SELECT get_business_cards_created_in_period(
  'user-uuid-here',
  '2024-01-01'::timestamptz,
  '2024-12-31'::timestamptz
);
```

### 5. search_business_cards_by_tag(user_uuid, search_tag)
태그로 명함 검색

```sql
SELECT * FROM search_business_cards_by_tag('user-uuid-here', '거래처');
```

## 🔐 보안

- **Row Level Security (RLS)** 모든 테이블에 활성화됨
- **인증된 사용자만** 데이터 접근 가능
- **사용자는 자신의 데이터만** 접근 가능
- **Storage도 RLS로 보호됨**

## 🧪 테스트 데이터

마이그레이션 적용 후 테스트 데이터를 추가하려면:

```sql
-- 현재 로그인한 사용자의 UUID 확인
SELECT auth.uid();

-- 테스트 명함 추가
INSERT INTO public.business_cards (
  user_id,
  name,
  company,
  title,
  phone,
  email,
  tags
) VALUES (
  auth.uid(),
  '홍길동',
  '테크컴퍼니',
  '대표이사',
  '010-1234-5678',
  'hong@example.com',
  ARRAY['거래처', 'VIP']
);
```

## 📝 TypeScript 타입 자동 생성

Supabase CLI를 사용하여 데이터베이스 스키마에서 TypeScript 타입을 자동 생성할 수 있습니다:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database-generated.ts
```

## 🔄 마이그레이션 롤백

마이그레이션을 롤백하려면 SQL Editor에서 다음을 실행:

```sql
-- Storage 정책 삭제
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;

-- 함수 삭제
DROP FUNCTION IF EXISTS public.search_business_cards_by_tag;
DROP FUNCTION IF EXISTS public.get_business_cards_created_in_period;
DROP FUNCTION IF EXISTS public.get_business_card_count;

-- RLS 정책 삭제
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_business_cards_updated_at ON public.business_cards;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;

-- 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.handle_updated_at;

-- 테이블 삭제
DROP TABLE IF EXISTS public.business_cards;
DROP TABLE IF EXISTS public.profiles;

-- Storage 버킷 삭제
DELETE FROM storage.buckets WHERE id = 'business-card-images';
```

## 📚 추가 리소스

- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

