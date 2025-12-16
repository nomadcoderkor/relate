-- ============================================
-- Storage 정책 수정
-- 문제: RLS 정책이 업로드를 차단하는 문제 해결
-- ============================================

-- 기존 정책 모두 삭제
drop policy if exists "Users can upload own images" on storage.objects;
drop policy if exists "Users can view own images" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

-- 버킷 public 설정 확인 (false여야 함)
update storage.buckets 
set public = false 
where id = 'business-card-images';

-- 새로운 정책 생성 (더 명확한 조건)
-- 업로드 정책: 사용자는 자신의 폴더에만 업로드 가능
create policy "Users can upload own images"
  on storage.objects 
  for insert 
  with check (
    bucket_id = 'business-card-images' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 조회 정책: 사용자는 자신의 이미지만 조회 가능
create policy "Users can view own images"
  on storage.objects 
  for select 
  using (
    bucket_id = 'business-card-images' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 업데이트 정책: 사용자는 자신의 이미지만 업데이트 가능
create policy "Users can update own images"
  on storage.objects 
  for update 
  using (
    bucket_id = 'business-card-images' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 삭제 정책: 사용자는 자신의 이미지만 삭제 가능
create policy "Users can delete own images"
  on storage.objects 
  for delete 
  using (
    bucket_id = 'business-card-images' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 정책 확인
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where tablename = 'objects' 
  and schemaname = 'storage'
order by policyname;
