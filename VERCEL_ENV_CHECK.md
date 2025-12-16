# Vercel 환경변수 확인 체크리스트

업로드 API가 500 에러를 반환하는 경우, 다음 사항을 확인하세요:

## 1️⃣ Vercel 환경변수 확인

### 필수 환경변수
Vercel Dashboard → 프로젝트 → Settings → Environment Variables에서 다음 환경변수가 **모두** 설정되어 있는지 확인:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (사용하지 않지만 다른 API에서 필요할 수 있음)
- ✅ `NEXT_PUBLIC_DEV_MODE` = `false` (Production 환경)

### 환경 설정
각 환경변수가 다음 환경에 적용되어 있는지 확인:
- Production: ✅
- Preview: ✅
- Development: ✅

## 2️⃣ Supabase Storage 버킷 확인

### 버킷 존재 여부
1. Supabase Dashboard 접속
2. Storage 메뉴 클릭
3. `business-card-images` 버킷이 존재하는지 확인

### 버킷이 없는 경우
SQL Editor에서 다음 명령 실행:
```sql
-- 버킷 생성
insert into storage.buckets (id, name, public)
values ('business-card-images', 'business-card-images', false)
on conflict (id) do nothing;

-- Storage 정책 확인
select * from storage.policies where bucket_id = 'business-card-images';
```

### Storage 정책 재생성 (필요시)
```sql
-- 기존 정책 삭제
drop policy if exists "Users can upload own images" on storage.objects;
drop policy if exists "Users can view own images" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

-- 정책 재생성
create policy "Users can upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own images"
  on storage.objects for select
  using (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own images"
  on storage.objects for update
  using (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'business-card-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 3️⃣ Vercel 로그 확인

1. Vercel Dashboard → 프로젝트 → Logs
2. 이미지 업로드 시도 시점의 로그 확인
3. `[DEBUG-A]`, `[DEBUG-C]`, `[DEBUG-D]`, `[DEBUG-ERROR]` 태그 찾기

### 로그 해석

#### `[DEBUG-A]` - 환경변수 확인
```
hasSupabaseUrl: false  → 환경변수 누락!
hasSupabaseAnonKey: false  → 환경변수 누락!
```

#### `[DEBUG-C]` - 인증 확인
```
hasUser: false  → 로그인 필요
```

#### `[DEBUG-B]` - Storage 업로드 실패
```
errorMessage: "Bucket not found"  → 버킷 미생성
errorMessage: "new row violates row-level security policy"  → 권한 설정 문제
```

## 4️⃣ 빠른 해결 방법

### 방법 1: 개발 모드로 전환 (임시)
Vercel 환경변수에서:
```
NEXT_PUBLIC_DEV_MODE=true
```
설정하면 Mock 데이터를 사용하여 업로드 기능 우회

### 방법 2: 마이그레이션 재실행
Supabase SQL Editor에서:
```sql
-- 001_initial_schema.sql 전체 내용 복사하여 실행
```

## 5️⃣ 확인 완료 후
- Vercel에서 재배포 (환경변수 변경 시 자동 배포됨)
- 이미지 업로드 재시도
- 로그에서 성공 메시지 확인
