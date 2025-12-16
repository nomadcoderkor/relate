# Supabase 빠른 설정 가이드

현재 오류:
- `Bucket not found` - Storage 버킷 미생성
- `column business_cards.title does not exist` - 데이터베이스 마이그레이션 미적용

## 🚀 빠른 설정 (5분)

### 1단계: Supabase 데이터베이스 마이그레이션

#### 1-1. Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `gzwnaqmvrhjgwnqhygtw`

#### 1-2. SQL Editor에서 마이그레이션 실행
1. 왼쪽 메뉴 → **SQL Editor** 클릭
2. **New Query** 클릭
3. 아래 SQL 전체를 복사하여 붙여넣기
4. **Run** (또는 Cmd+Enter) 클릭

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. Profiles 테이블
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles 테이블 인덱스
create index if not exists profiles_email_idx on public.profiles(email);

-- ============================================
-- 2. Business Cards 테이블
-- ============================================
create table if not exists public.business_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  company text,
  title text,
  phone text,
  email text,
  address text,
  memo text,
  image_url text,
  last_contact_date date,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Business Cards 테이블 인덱스
create index if not exists business_cards_user_id_idx on public.business_cards(user_id);
create index if not exists business_cards_name_idx on public.business_cards(name);
create index if not exists business_cards_company_idx on public.business_cards(company);
create index if not exists business_cards_tags_idx on public.business_cards using gin(tags);
create index if not exists business_cards_created_at_idx on public.business_cards(created_at desc);
create index if not exists business_cards_last_contact_date_idx on public.business_cards(last_contact_date desc);

-- ============================================
-- 3. Updated At 트리거 함수
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Profiles 테이블에 updated_at 트리거 적용
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Business Cards 테이블에 updated_at 트리거 적용
drop trigger if exists handle_business_cards_updated_at on public.business_cards;
create trigger handle_business_cards_updated_at
  before update on public.business_cards
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 4. 신규 사용자 자동 프로필 생성
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Auth 트리거
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- 5. Row Level Security (RLS) 정책
-- ============================================

-- Profiles RLS
alter table public.profiles enable row level security;

-- 사용자는 자신의 프로필만 조회
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Business Cards RLS
alter table public.business_cards enable row level security;

-- 사용자는 자신의 명함만 조회
drop policy if exists "Users can view own cards" on public.business_cards;
create policy "Users can view own cards"
  on public.business_cards for select
  using (auth.uid() = user_id);

-- 사용자는 자신의 명함만 생성
drop policy if exists "Users can create own cards" on public.business_cards;
create policy "Users can create own cards"
  on public.business_cards for insert
  with check (auth.uid() = user_id);

-- 사용자는 자신의 명함만 수정
drop policy if exists "Users can update own cards" on public.business_cards;
create policy "Users can update own cards"
  on public.business_cards for update
  using (auth.uid() = user_id);

-- 사용자는 자신의 명함만 삭제
drop policy if exists "Users can delete own cards" on public.business_cards;
create policy "Users can delete own cards"
  on public.business_cards for delete
  using (auth.uid() = user_id);
```

#### 1-3. 성공 확인
- ✅ "Success. No rows returned" 메시지가 표시되면 성공
- Table Editor에서 `profiles`, `business_cards` 테이블 확인

---

### 2단계: Supabase Storage 버킷 생성

#### 2-1. Storage 메뉴 접속
1. 왼쪽 메뉴 → **Storage** 클릭
2. **New bucket** 버튼 클릭

#### 2-2. 버킷 생성
```
Bucket name: business-card-images
Public bucket: ✅ (체크)
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

**Create bucket** 클릭

#### 2-3. Storage 정책 설정 (RLS)

**Configuration** 탭 → **Policies** → **New Policy**

**정책 1: 인증된 사용자 업로드 허용**
```sql
-- Policy name: Allow authenticated uploads
-- Allowed operation: INSERT
-- Target roles: authenticated

create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-card-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**정책 2: 사용자는 자신의 이미지만 조회**
```sql
-- Policy name: Allow users to view own images
-- Allowed operation: SELECT
-- Target roles: authenticated, anon

create policy "Allow users to view own images"
on storage.objects for select
to authenticated, anon
using (
  bucket_id = 'business-card-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**정책 3: 사용자는 자신의 이미지만 삭제**
```sql
-- Policy name: Allow users to delete own images
-- Allowed operation: DELETE
-- Target roles: authenticated

create policy "Allow users to delete own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'business-card-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**정책 4: Public 읽기 허용 (선택적)**
```sql
-- 모든 사람이 이미지를 볼 수 있도록 (Public bucket인 경우)
create policy "Public images are viewable by everyone"
on storage.objects for select
to public
using (bucket_id = 'business-card-images');
```

---

### 3단계: 애플리케이션 재시작

```bash
# 개발 서버 재시작
# Ctrl+C로 중단 후
npm run dev
```

브라우저 새로고침:
```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

---

## ✅ 테스트

### 1. 로그인
- 회원가입 또는 로그인

### 2. 명함 스캔
1. 명함 목록 → "📷 명함 스캔"
2. 이미지 선택
3. **업로드 성공** 확인
4. **OCR 분석** 실행
5. 명함 정보 추출 확인

### 3. 저장
- 명함 정보 입력 후 저장
- 데이터베이스에 저장됨

---

## 🔍 문제 해결

### Storage 업로드 실패
```
Bucket not found
```

**해결:**
1. Storage 버킷 이름 확인: `business-card-images`
2. Public bucket 설정 확인
3. RLS 정책 확인

### 데이터베이스 오류
```
column business_cards.title does not exist
```

**해결:**
1. SQL Editor에서 마이그레이션 재실행
2. Table Editor에서 테이블 구조 확인

### 권한 오류
```
new row violates row-level security policy
```

**해결:**
1. RLS 정책 확인
2. 로그인 확인
3. user_id가 올바른지 확인

---

## 📊 확인 체크리스트

### 데이터베이스
- [ ] `profiles` 테이블 생성됨
- [ ] `business_cards` 테이블 생성됨
- [ ] RLS 정책 활성화됨
- [ ] 트리거 함수 생성됨

### Storage
- [ ] `business-card-images` 버킷 생성됨
- [ ] Public bucket 설정됨
- [ ] Upload 정책 설정됨
- [ ] Select 정책 설정됨

### 애플리케이션
- [ ] 환경변수 설정됨
- [ ] 개발 서버 재시작됨
- [ ] 로그인 성공
- [ ] 명함 스캔 테스트

---

## 🎉 완료!

모든 설정이 완료되면:
- ✅ 이미지 업로드 작동
- ✅ OCR 분석 작동
- ✅ 데이터베이스 저장 작동
- ✅ 명함 목록 조회 작동

문제가 계속되면 Supabase Dashboard의 Logs를 확인하세요!

