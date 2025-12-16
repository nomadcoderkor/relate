# Storage RLS 정책 수정 가이드

## 🔴 문제
```
new row violates row-level security policy
```
Supabase Storage의 RLS 정책이 이미지 업로드를 차단하고 있습니다.

## ✅ 해결 방법

### 방법 1: SQL 마이그레이션 실행 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭

3. **마이그레이션 실행**
   - `supabase/migrations/003_fix_storage_policies.sql` 파일의 내용 전체를 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

4. **결과 확인**
   - 맨 아래 SELECT 쿼리 결과에서 4개의 정책이 표시되어야 함:
     - `Users can upload own images`
     - `Users can view own images`
     - `Users can update own images`
     - `Users can delete own images`

### 방법 2: Storage 버킷 설정 확인

1. **Storage 메뉴 접속**
   - Supabase Dashboard → Storage 메뉴

2. **버킷 확인**
   - `business-card-images` 버킷이 존재하는지 확인
   - 없다면 "New bucket" 클릭하여 생성:
     - Name: `business-card-images`
     - Public: **OFF** (체크 해제)
     - File size limit: 10 MB
     - Allowed MIME types: `image/png,image/jpeg,image/jpg,image/webp`

3. **버킷 정책 확인**
   - 버킷 클릭 → "Policies" 탭
   - 4개의 정책이 있어야 함
   - 없다면 위의 SQL 실행

### 방법 3: 임시 해결 (테스트용)

**⚠️ 주의: 이 방법은 보안이 약해지므로 프로덕션에서 사용하지 마세요!**

```sql
-- 모든 인증된 사용자가 업로드 가능하도록 변경
drop policy if exists "Users can upload own images" on storage.objects;

create policy "Allow authenticated uploads"
  on storage.objects 
  for insert 
  with check (
    bucket_id = 'business-card-images' 
    and auth.role() = 'authenticated'
  );
```

## 🧪 테스트

SQL 실행 후:
1. Vercel 사이트에서 이미지 업로드 재시도
2. 성공하면 Supabase Storage → `business-card-images` 버킷에서 파일 확인
3. 파일 경로: `{user_id}/{timestamp}.{extension}`

## 🔍 문제 지속 시 확인사항

### 버킷이 생성되지 않은 경우
```sql
-- 버킷 생성
insert into storage.buckets (id, name, public)
values ('business-card-images', 'business-card-images', false)
on conflict (id) do nothing;
```

### 정책이 제대로 작동하지 않는 경우
```sql
-- 현재 정책 확인
select * from pg_policies 
where tablename = 'objects' 
  and schemaname = 'storage';

-- storage.objects 테이블에 RLS가 활성화되어 있는지 확인
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'storage' 
  and tablename = 'objects';
```

## ✨ 예상 결과

마이그레이션 실행 후 업로드 시도 시:
- ✅ 파일이 Supabase Storage에 업로드됨
- ✅ Public URL 생성됨
- ✅ 명함 이미지가 앱에 표시됨
