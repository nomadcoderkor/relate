-- ============================================
-- profiles 테이블의 외래 키 제약 조건 수정
-- ============================================
-- 문제: profiles_id_fkey가 존재하지 않는 "users" 테이블을 참조
-- 해결: auth.users 테이블을 참조하도록 수정

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

-- 3. 제약 조건 확인 쿼리
-- 아래 쿼리를 실행하여 올바르게 설정되었는지 확인
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_schema AS foreign_table_schema,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'profiles';

