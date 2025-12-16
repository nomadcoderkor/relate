-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. Profiles 테이블
-- ============================================
-- 사용자 프로필 정보를 저장하는 테이블
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles 테이블 인덱스
create index profiles_email_idx on public.profiles(email);

-- Profiles 테이블 코멘트
comment on table public.profiles is '사용자 프로필 정보';
comment on column public.profiles.id is '사용자 ID (auth.users와 연결)';
comment on column public.profiles.email is '사용자 이메일';
comment on column public.profiles.name is '사용자 이름';

-- ============================================
-- 2. Business Cards 테이블
-- ============================================
-- 명함 정보를 저장하는 테이블
create table public.business_cards (
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
create index business_cards_user_id_idx on public.business_cards(user_id);
create index business_cards_name_idx on public.business_cards(name);
create index business_cards_company_idx on public.business_cards(company);
create index business_cards_tags_idx on public.business_cards using gin(tags);
create index business_cards_created_at_idx on public.business_cards(created_at desc);
create index business_cards_last_contact_date_idx on public.business_cards(last_contact_date desc);

-- Business Cards 테이블 코멘트
comment on table public.business_cards is '명함 정보';
comment on column public.business_cards.id is '명함 고유 ID';
comment on column public.business_cards.user_id is '명함 소유자 ID';
comment on column public.business_cards.name is '명함 주인 이름';
comment on column public.business_cards.company is '회사명';
comment on column public.business_cards.title is '직함';
comment on column public.business_cards.phone is '전화번호';
comment on column public.business_cards.email is '이메일';
comment on column public.business_cards.address is '주소';
comment on column public.business_cards.memo is '사용자 메모';
comment on column public.business_cards.image_url is '명함 이미지 URL';
comment on column public.business_cards.last_contact_date is '마지막 연락일';
comment on column public.business_cards.tags is '태그 배열';

-- ============================================
-- 3. Updated At 트리거 함수
-- ============================================
-- updated_at을 자동으로 업데이트하는 함수
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Profiles 테이블에 updated_at 트리거 적용
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Business Cards 테이블에 updated_at 트리거 적용
create trigger handle_business_cards_updated_at
  before update on public.business_cards
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 4. 신규 사용자 자동 프로필 생성 함수
-- ============================================
-- auth.users에 새 사용자가 생성되면 자동으로 profiles 레코드 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- 신규 사용자 생성 시 프로필 자동 생성 트리거
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- 5. Row Level Security (RLS) 정책
-- ============================================

-- Profiles 테이블 RLS 활성화
alter table public.profiles enable row level security;

-- 사용자는 자신의 프로필만 조회 가능
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Business Cards 테이블 RLS 활성화
alter table public.business_cards enable row level security;

-- 사용자는 자신의 명함만 조회 가능
create policy "Users can view own business cards"
  on public.business_cards for select
  using (auth.uid() = user_id);

-- 사용자는 자신의 명함만 생성 가능
create policy "Users can create own business cards"
  on public.business_cards for insert
  with check (auth.uid() = user_id);

-- 사용자는 자신의 명함만 수정 가능
create policy "Users can update own business cards"
  on public.business_cards for update
  using (auth.uid() = user_id);

-- 사용자는 자신의 명함만 삭제 가능
create policy "Users can delete own business cards"
  on public.business_cards for delete
  using (auth.uid() = user_id);

-- ============================================
-- 6. Storage 버킷 생성 (명함 이미지용)
-- ============================================

-- 명함 이미지를 저장할 Storage 버킷 생성
insert into storage.buckets (id, name, public)
values ('business-card-images', 'business-card-images', false);

-- Storage 정책: 사용자는 자신의 이미지만 업로드 가능
create policy "Users can upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage 정책: 사용자는 자신의 이미지만 조회 가능
create policy "Users can view own images"
  on storage.objects for select
  using (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage 정책: 사용자는 자신의 이미지만 수정 가능
create policy "Users can update own images"
  on storage.objects for update
  using (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage 정책: 사용자는 자신의 이미지만 삭제 가능
create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 7. 유용한 함수들
-- ============================================

-- 특정 사용자의 명함 개수를 세는 함수
create or replace function public.get_business_card_count(user_uuid uuid)
returns bigint as $$
  select count(*)
  from public.business_cards
  where user_id = user_uuid;
$$ language sql security definer;

-- 특정 기간 동안 생성된 명함 개수를 세는 함수
create or replace function public.get_business_cards_created_in_period(
  user_uuid uuid,
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
returns bigint as $$
  select count(*)
  from public.business_cards
  where user_id = user_uuid
    and created_at >= start_date
    and created_at <= end_date;
$$ language sql security definer;

-- 태그로 명함 검색하는 함수
create or replace function public.search_business_cards_by_tag(
  user_uuid uuid,
  search_tag text
)
returns setof public.business_cards as $$
  select *
  from public.business_cards
  where user_id = user_uuid
    and search_tag = any(tags)
  order by created_at desc;
$$ language sql security definer;

