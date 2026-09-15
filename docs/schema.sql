-- 1. 테이블
create table if not exists public.questions (
  id bigint generated always as identity primary key,
  session_date date not null default (now() at time zone 'Asia/Seoul')::date,
  question_text text not null check (char_length(btrim(question_text)) between 1 and 500),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 20),
  vote_count integer not null default 0 check (vote_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists questions_session_idx
  on public.questions (session_date, vote_count desc, created_at desc);

-- 2. 보안(RLS): 누구나 조회·등록만 가능, 직접 수정·삭제 불가
alter table public.questions enable row level security;

grant select, insert on public.questions to anon;

drop policy if exists "anyone can read" on public.questions;
create policy "anyone can read"
  on public.questions for select to anon using (true);

drop policy if exists "anyone can insert" on public.questions;
create policy "anyone can insert"
  on public.questions for insert to anon with check (vote_count = 0);

-- 3. 공감 +1 / -1 함수 (동시 클릭 시 누락 방지)
create or replace function public.vote(q_id bigint, delta integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.questions
     set vote_count = greatest(vote_count + case when delta > 0 then 1 else -1 end, 0)
   where id = q_id
  returning vote_count;
$$;

grant execute on function public.vote(bigint, integer) to anon;

-- 4. 실시간 반영 켜기 (이미 켜져 있으면 건너뜀)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'questions'
  ) then
    alter publication supabase_realtime add table public.questions;
  end if;
end $$;
