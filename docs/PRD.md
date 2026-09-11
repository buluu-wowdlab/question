# Question Vote — PRD (v2)

> 수업 중 질문을 휴대폰으로 쉽게 등록하고, 공감 투표로 토론 우선순위를 정하는 원페이지 웹앱

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Question Vote |
| 버전 | MVP (V1) — v2 문서 (개발 환경 변경 반영) |
| 개발 도구 | VS Code + Claude Code |
| 기술 스택 | Vite + React + TypeScript + Tailwind CSS + Supabase JS |
| 데이터 | Supabase (교수님 소유 프로젝트 · 개발자는 URL + anon key만 사용) |
| 배포 | Vercel (교수님 계정 · GitHub 공개 저장소 연동) |
| 목표 개발 시간 | 1.5 ~ 2시간 (Supabase 세팅·배포 포함) |
| 기술 난이도 | 낮음 |

---

## 0. 원안 대비 변경 사항 요약

| 구분 | 원안 (Google AI Studio) | v2 (Claude Code + Supabase + Vercel) | 변경 이유 |
|---|---|---|---|
| 데이터 저장 | Local State / Mock 데이터 | Supabase DB | Local State는 각자 휴대폰 안에만 저장되어, 다른 학생의 질문이 보이지 않음 |
| 실시간 반영 | 제외 | **포함** (Supabase Realtime) | 교수님 화면과 학생 화면에 새 질문·공감이 새로고침 없이 반영되어야 함 |
| 공감 증가 방식 | 화면에서 +1 | DB 함수(RPC)로 +1 | 여러 명이 동시에 누를 때 공감 수가 누락되는 문제 방지 |
| 중복 투표 | 무제한 허용 | 기기당 질문 1회 (취소 가능) | 한 명이 연타하면 순위가 무의미해짐 |
| 수업 회차 구분 | 없음 | 날짜별 자동 구분 (오늘 질문만 표시) | 매 수업마다 이전 질문이 섞이지 않도록 |
| 이름 유지 | 없음 | 브라우저에 저장 (새로고침해도 유지) | 휴대폰 화면이 꺼지거나 새로고침될 때 재입력 방지 |
| 관리 기능 | 제외 | Supabase 대시보드로 대체 | 별도 관리자 페이지 없이 교수님이 직접 조회·삭제·내보내기 |
| 개발 방식 | AI Studio에서 바로 생성 | 개발자 Supabase에서 개발 → 교수님 Supabase로 전환 | 개발자는 교수님 DB를 볼 수 없으므로, 오류 확인이 가능한 환경에서 먼저 완성 |

---

## 1. 프로젝트 개요

### 1.1 문제

- 수업 중 학생들은 질문이 떠올라도 **다른 학생들의 시선을 의식하여** 질문을 하지 않는다.
- 질문이 **소수 학생에게 집중**되어 다양한 학생의 참여가 어렵다.

### 1.2 목표

학생들이 휴대폰을 이용해 쉽게 질문을 등록하고, 다른 학생들이 공감 투표를 할 수 있도록 하여 **수업 내 질문 참여를 증가**시킨다.

### 1.3 성공 지표

| 지표 | Before | After (목표) | 측정 방법 |
|---|---|---|---|
| 질문 참여 학생 비율 | 10% (30명 중 3명) | **60% 이상** (30명 중 18명 이상) | Supabase에서 해당 날짜의 고유 작성자 수 ÷ 출석 인원 |

---

## 2. MVP 범위

### 2.1 포함 기능 (Must Have)

| # | 기능 | 설명 |
|---|---|---|
| 1 | 이름 입력 후 입장 | 이름을 입력해야 질문 작성 영역이 활성화된다. 이름은 브라우저에 저장된다. |
| 2 | 질문 등록 | 질문을 입력하면 Supabase에 저장된다. |
| 3 | 공감 투표 | 다른 질문에 공감할 수 있다. 같은 기기에서 질문당 1회, 다시 누르면 취소. |
| 4 | 공감순 정렬 | 공감 수 높은 순으로 자동 정렬된다. |
| 5 | 실시간 반영 | 다른 사용자의 질문 등록·공감이 새로고침 없이 반영된다. |
| 6 | 날짜별 구분 | 오늘(한국 시간 기준) 등록된 질문만 목록에 표시된다. |

### 2.2 제외 기능 (Not in V1)

- 학교 계정 로그인 / 회원가입
- 실시간 채팅 (※ 질문 목록의 실시간 반영은 포함, 채팅은 제외)
- AI 질문 분석 / 자동 분류
- 앱 내 관리자 페이지 (→ Supabase 대시보드로 대체, 9장 참고)
- LMS / eTL 연동
- 다중 강의실 생성 (→ 날짜별 구분으로 대체)
- 질문 익명화 기능
- 질문 수정·삭제 (학생 측) — 삭제는 교수님이 대시보드에서 처리

---

## 3. 사용자

| 사용자 | 주요 행동 | 사용 화면 |
|---|---|---|
| **학생** | 이름 입력 · 질문 등록 · 공감 투표 | 휴대폰 (웹앱) |
| **교수** | 질문 목록 확인 · 공감 수 확인 · 토론 우선순위 결정 | 강의실 PC/빔프로젝터 (웹앱) |
| **교수** | 수업 후 데이터 조회 · 부적절한 질문 삭제 · CSV 다운로드 | Supabase 대시보드 |
| **개발자** | 개발 · 배포 · 유지보수 | VS Code, Vercel, Supabase |

---

## 4. 사용자 시나리오

### 4.1 학생

1. QR코드 또는 링크로 앱 접속
2. 이름 입력 후 입장 (다음 접속부터 자동 입장)
3. 질문 작성 → 등록
4. 다른 학생 질문 확인
5. 공감 버튼 클릭 (다시 누르면 취소)

### 4.2 교수 (수업 중)

1. 강의실 PC에서 앱 실행 → 화면 공유
2. 학생들의 질문과 공감 수가 실시간으로 올라오는 것 확인
3. 공감 수 높은 질문부터 토론 진행

### 4.3 교수 (수업 후)

1. Supabase 대시보드 → Table Editor → `questions` 테이블
2. `session_date`로 필터하여 해당 수업 질문 확인
3. 필요 시 CSV로 내보내기 / 부적절한 질문 행 삭제

---

## 5. 화면 설계 (One Page App)

하나의 페이지 안에 아래 3개 영역을 위에서 아래로 배치한다. **모바일 우선**으로 설계하되, PC 화면(빔프로젝터)에서도 읽기 좋게 최대 폭을 제한한다.

```
┌─────────────────────────────┐
│ ① 이름 입력 영역             │
│   [이름 입력창]  [입장]       │
│   (입장 후) 김학생 님 · 이름 변경│
├─────────────────────────────┤
│ ② 질문 작성 영역             │
│   [질문 입력 텍스트박스]      │
│   0/200         [질문 등록]  │
├─────────────────────────────┤
│ ③ 질문 목록 영역 (오늘 질문)  │
│   ┌───────────────────────┐ │
│   │ 질문 카드              │ │
│   └───────────────────────┘ │
└─────────────────────────────┘
```

### 5.1 이름 입력 영역

- 이름 입력창 + 입장 버튼
- 입장 전: 질문 작성 영역 비활성화 (목록 보기는 가능)
- 입장 후: 한 줄로 축소 → "김학생 님 · 이름 변경"
- 이름은 브라우저(localStorage)에 저장되어 새로고침 후에도 유지

### 5.2 질문 작성 영역

- 질문 입력 텍스트박스 + 글자 수 표시 (0/200)
- 질문 등록 버튼 (등록 중에는 비활성화하여 중복 등록 방지)
- 등록 성공 시 입력창 비움 / 실패 시 안내 문구 표시

### 5.3 질문 목록 영역

**카드 표시 정보**: 질문 내용 · 작성자 이름 · 공감 수 · 공감 버튼

```
┌──────────────────────────────────┐
│ 왜 생성형 AI는 환각이 발생하나요?   │
│ 작성자: 김학생                     │
│                         공감 ❤️ 7 │
└──────────────────────────────────┘
```

- 내가 공감한 질문은 버튼 색이 채워진 상태로 표시
- 질문이 없을 때: "아직 등록된 질문이 없어요" 안내

### 5.4 정렬 규칙

| 우선순위 | 기준 |
|---|---|
| 1차 (기본) | 공감 수 높은 순 |
| 2차 (동점 시) | 최신 등록 순 |

---

## 6. 데이터 구조 (Supabase)

### 6.1 `questions` 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (자동 증가) | 질문 고유 ID |
| `session_date` | date | 수업 날짜 (한국 시간 기준, 자동 입력) |
| `question_text` | text | 질문 내용 (공백 제외 1~200자) |
| `author_name` | text | 작성자 이름 (1~20자) |
| `vote_count` | integer | 공감 수 (기본값 0) |
| `created_at` | timestamptz | 등록 시각 (자동 입력) |

> DB 컬럼은 snake_case, 프론트엔드 코드에서는 camelCase(`questionText` 등)로 변환해 사용한다.

### 6.2 스키마 SQL (교수님이 Supabase SQL Editor에서 실행)

> 교수님이 직접 실행하시므로, **여러 번 실행해도 오류 없이 같은 결과가 나오도록** 작성했다. 중간에 실패하거나 실수로 두 번 눌러도 다시 Run 하면 된다. (기존 데이터는 지워지지 않음)

```sql
-- 1. 테이블
create table if not exists public.questions (
  id bigint generated always as identity primary key,
  session_date date not null default (now() at time zone 'Asia/Seoul')::date,
  question_text text not null check (char_length(btrim(question_text)) between 1 and 200),
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
```

> **스키마는 이 SQL로 확정한다.** 배포 후 컬럼·함수를 바꾸려면 교수님께 SQL을 다시 실행해달라고 요청해야 하므로, 개발 단계(개발자 Supabase)에서 충분히 검증한 뒤 교수님께 전달한다.

### 6.3 브라우저 저장 데이터 (localStorage)

| 키 | 값 | 용도 |
|---|---|---|
| `qv:name` | 문자열 | 입장한 이름 |
| `qv:voted` | 질문 ID 배열 | 이 기기에서 공감한 질문 (중복 공감 방지) |

---

## 7. 핵심 기능 상세

### 7.1 질문 등록

| 구분 | 내용 |
|---|---|
| 입력 | 질문 내용, 작성자 이름(저장된 이름) |
| 처리 | Supabase `questions` 테이블에 insert |
| 출력 | 모든 사용자 목록에 실시간 추가 |
| 예외 처리 | 공백만 입력 불가 · 200자 제한(입력창 + DB 이중 검증) · 네트워크 오류 시 안내 |

### 7.2 공감 투표

| 구분 | 내용 |
|---|---|
| 입력 | 공감 버튼 클릭 |
| 처리 | 공감 안 한 질문 → `vote(id, 1)` / 이미 공감한 질문 → `vote(id, -1)` |
| 출력 | 공감 수 즉시 반영(낙관적 업데이트) → 서버 응답값으로 확정 |
| 중복 방지 | 기기(localStorage) 기준 질문당 1회. 로그인 검증은 하지 않음 |

> 참고: 브라우저 데이터를 지우거나 다른 기기를 쓰면 다시 공감할 수 있다. 수업용 MVP에서는 이 수준으로 충분하다고 판단한다.

### 7.3 공감순 정렬

| 구분 | 내용 |
|---|---|
| 트리거 | 질문 추가 · 공감 수 변경 (내 동작 + 다른 사용자 동작 모두) |
| 동작 | 목록 자동 재정렬 (5.4 규칙 적용) |

### 7.4 실시간 반영

| 구분 | 내용 |
|---|---|
| 방식 | Supabase Realtime `postgres_changes` 구독 (INSERT, UPDATE) |
| 필터 | 오늘 `session_date`의 질문만 반영 |
| 재연결 | 휴대폰 화면이 꺼졌다 켜지거나 탭으로 돌아올 때 목록 전체 재조회 |

---

## 8. Acceptance Criteria

| ID | 조건 |
|---|---|
| **AC-1** | 학생이 이름을 입력한 후 질문을 등록할 수 있고, 질문이 Supabase에 저장된다. |
| **AC-2** | 학생이 질문에 공감 버튼을 누르면 공감 수가 1 증가하고, 다시 누르면 1 감소한다. |
| **AC-3** | 공감 수가 변경되면 질문 목록이 자동으로 재정렬된다. |
| **AC-4** | 교수는 가장 공감 수가 높은 질문과 질문자를 확인할 수 있다. |
| **AC-5** | A 기기에서 등록·공감한 내용이 B 기기에 새로고침 없이 3초 이내 반영된다. |
| **AC-6** | 새로고침해도 이름, 질문 목록, 내 공감 상태가 유지된다. |
| **AC-7** | 여러 기기에서 같은 질문에 동시에 공감해도 공감 수가 누락되지 않는다. |
| **AC-8** | 전날 등록된 질문은 오늘 목록에 보이지 않는다. |
| **AC-9** | 교수님이 Supabase 대시보드에서 질문을 조회·삭제·CSV 다운로드할 수 있다. |
| **AC-10** | GitHub 저장소에 Supabase 키가 커밋되지 않는다. |

---

## 9. 소유권 · 권한 구조

**모든 계정은 교수님 소유**로 하고, 개발자는 GitHub 협업자로서 코드만 올린다. 개발자는 교수님 계정 비밀번호를 알 필요가 없다.

| 대상 | 소유 | 개발자 권한 |
|---|---|---|
| GitHub 저장소 (`question-vote`, **공개**) | 교수님 | 협업자(Collaborator)로 초대받아 push |
| Vercel 프로젝트 | 교수님 | 없음 — push하면 자동 배포되므로 접근 불필요 |
| 운영용 Supabase | 교수님 | URL + anon key만 사용 |
| 개발용 Supabase | 개발자 | 전체 (개발·테스트용) |

### 9.1 전체 진행 흐름

| 단계 | 누가 | 내용 |
|---|---|---|
| ① 개발 | 개발자 | 개발용 Supabase + 로컬(`localhost`)에서 Phase 0~5 완료 |
| ② 계정 세팅 미팅 | 교수님 + 개발자 대면 | GitHub·Supabase·Vercel 가입 → SQL 실행 → 코드 push → 배포 → 실기기 확인 (별도 문서 「계정 세팅 미팅 가이드」) |
| ③ 운영·수정 | 개발자 | 코드 수정 → push → Vercel 자동 배포. 교수님 할 일 없음 |

> 미팅은 **①이 끝난 뒤** 잡는다. Vercel은 올릴 코드가 있어야 배포할 수 있으므로, 한 번 만나서 배포까지 끝내기 위함이다.

### 9.2 왜 GitHub 저장소를 공개로 하는가

- Vercel 무료(Hobby) 플랜은 **비공개 저장소**에서는 Vercel 계정 소유자(교수님)가 작성한 커밋만 배포한다. 개발자가 push하면 배포가 막힌다.
- **공개 저장소**는 협업자 커밋도 무료로 배포된다.
- 코드에는 키가 없고(환경변수로 분리), anon key는 원래 공개돼도 되는 키이므로 공개 저장소여도 보안 문제가 없다.

### 9.3 키 취급 원칙

- anon(publishable) key는 브라우저에 노출되어도 되는 키다. 대신 6.2의 RLS 정책으로 조회·등록·공감 외 동작을 막는다.
- **service_role(secret) key는 받지 않는다.** 이 앱에 필요 없고, 유출 시 모든 데이터를 지울 수 있는 키다.
- 교수님 계정 비밀번호, Supabase DB 비밀번호는 교수님만 보관한다. 개발자에게 공유하지 않는다.

### 9.4 운영용 DB에서 개발자가 할 수 없는 것

| 제약 | 대응 |
|---|---|
| 테스트 데이터 삭제 불가 (anon은 삭제 권한 없음) | 미팅 중 교수님이 Table Editor에서 바로 삭제. 이후엔 수업 없는 날 테스트 → 날짜 필터로 다음 날부터 안 보임 |
| 테이블·로그 직접 확인 불가 | 오류 원인은 개발용 DB에서 재현해서 확인 |
| 스키마 변경 불가 | 변경 SQL을 작성해 교수님께 실행 요청 (6.2처럼 재실행 안전하게) |
| Vercel 환경변수 변경 불가 | 필요 시 교수님께 요청 (Supabase 프로젝트를 바꾸지 않는 한 거의 없음) |

---

## 10. 결정 사항

| 항목 | 결정 |
|---|---|
| Supabase 접근 방식 | URL + anon key만 받음. SQL은 교수님이 실행 |
| 수업 회차 구분 | 날짜별 자동 구분 (오늘 질문만) |
| 공감 중복 | 기기당 질문 1회 (다시 누르면 취소되는 방식은 확인 중) |
| 계정 소유 | GitHub·Vercel·Supabase 모두 교수님 계정. 개발자가 대면으로 가입 지원 |
| 저장소 공개 여부 | 공개 (9.2) |
| 개발·테스트 | 개발자 로컬 환경에서 진행 (11.4) |

**남은 확인 사항**

| 항목 | 현재 가정 |
|---|---|
| 공감 취소 기능 | 포함 |
| 앱 주소 | `<프로젝트이름>.vercel.app` — 미팅 때 교수님과 이름 결정 |
| 작성자 실명 표시 | 원안대로 실명 표시 (1.1 문제정의와 긴장 관계가 있어 교수님 의도 확인 권장) |

---

## 11. Claude Code 개발 지침

### 11.1 프로젝트 루트 `CLAUDE.md` (권장 내용)

```markdown
# Question Vote

- 이 문서(PRD)가 유일한 요구사항 기준이다. PRD에 없는 기능은 추가하지 않는다.
- 스택: Vite + React + TypeScript + Tailwind CSS + @supabase/supabase-js
- 한 번에 한 Phase만 구현하고, 끝나면 멈춰서 확인 방법을 알려준 뒤 승인을 기다린다.
- 기존에 동작하는 코드를 통째로 다시 쓰지 않는다. 필요한 파일만 최소 수정한다.
- 변경 전에 수정할 파일 목록과 이유를 먼저 보여준다.
- Supabase 키는 .env.local에서만 읽는다. 코드에 하드코딩하지 않는다.
- 이 저장소는 공개 저장소가 된다. 키·비밀번호·개인정보를 코드나 커밋에 넣지 않는다.
- DB 스키마는 PRD 6.2를 따른다. 스키마 변경이 필요하면 SQL만 제안하고 실행은 사람이 한다.
- 운영 DB는 anon key 권한만 있다. 코드에서 update/delete를 직접 호출하지 않고, 공감은 반드시 vote() RPC로만 처리한다.
- 스키마 변경 SQL은 여러 번 실행해도 안전하게(if not exists, drop policy if exists 등) 작성한다.
```

### 11.2 환경변수

| 이름 | 로컬 `.env.local` | Vercel (교수님이 미팅 때 입력) |
|---|---|---|
| `VITE_SUPABASE_URL` | 개발용(내) 프로젝트 URL | 운영용(교수님) 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | 개발용 anon/publishable key | 운영용 anon/publishable key |

- `.env.local`은 `.gitignore`에 포함 확인. 저장소에는 값 없이 `.env.example`만 커밋
- Vercel 환경변수를 바꾼 뒤에는 **재배포(Redeploy)해야 반영**된다.

### 11.3 구현 단계 (Phase별로 멈추고 확인)

| Phase | 내용 | 완료 확인 |
|---|---|---|
| 0 | 개발용 Supabase 생성 후 6.2 SQL 실행 | Table Editor에 `questions` 테이블 존재 |
| 1 | Vite 프로젝트 생성, Supabase 연결, 오늘 질문 조회 | 대시보드에서 넣은 테스트 행이 `localhost`에 표시 |
| 2 | 이름 입장 + 질문 등록 | AC-1, AC-6(이름) |
| 3 | 공감 투표(RPC) + 정렬 | AC-2, AC-3, AC-4, AC-7 |
| 4 | Realtime 구독 + 화면 복귀 시 재조회 | AC-5, AC-8 |
| 5 | 모바일 UI 다듬기 · 빈 상태 · 오류 안내 · 로컬 git 커밋 정리 | 11.4 로컬 테스트 전체 통과 |
| 6 | 계정 세팅 미팅 (별도 가이드) | 배포 주소에서 AC 전체 재확인, AC-9, AC-10 |

### 11.4 로컬 테스트 방법

| 확인 항목 | 방법 |
|---|---|
| 기본 동작 | `npm run dev` → 브라우저에서 `http://localhost:5173` |
| 두 사용자 흉내 | 일반 창 + 시크릿 창을 나란히 열기 (시크릿 창은 이름·공감 기록이 따로 저장됨) |
| 휴대폰 실기기 | PC와 휴대폰을 같은 Wi-Fi에 연결 → `npm run dev -- --host` → 터미널에 표시된 `Network: http://192.168.x.x:5173` 주소를 휴대폰에서 열기 |
| 동시 공감 (AC-7) | 창 여러 개에서 같은 질문 공감을 빠르게 누른 뒤 Supabase Table Editor의 `vote_count`와 화면 숫자 비교 |
| 날짜 구분 (AC-8) | 개발용 Table Editor에서 테스트 행의 `session_date`를 어제로 바꾸고 새로고침 → 목록에서 사라지는지 확인 |

> 휴대폰 접속이 안 되면: 회사·학교 Wi-Fi가 기기 간 접속을 막는 경우가 많다. 휴대폰 핫스팟에 PC를 연결하거나, Windows 방화벽의 Node.js 허용 팝업에서 '허용'을 눌렀는지 확인한다.

### 11.5 MVP 완료 기준

> **서로 다른 두 휴대폰에서: 학생 A가 질문 등록 → 학생 B 화면에 바로 뜸 → B가 공감 → 두 화면 모두 공감순으로 재정렬**
>
> 로컬에서 먼저 확인하고, 미팅 때 배포 주소에서 한 번 더 확인하면 MVP 완료.

---

## 12. 운영 안내 (교수님 전달용)

- **질문 보기**: Supabase → Table Editor → `questions` → `session_date`로 필터
- **부적절한 질문 삭제**: 해당 행 선택 → Delete (학생 화면에서는 새로고침 시 사라짐)
- **백업**: Table Editor → Export → CSV
- **방학·휴강 후 첫 수업 전**: Supabase 대시보드에 접속해 프로젝트가 일시정지(Paused)면 **Restore** 클릭 (무료 플랜은 약 1주 미사용 시 정지될 수 있음)
- **앱 수정이 필요할 때**: 개발자에게 요청 → 개발자가 수정해 올리면 자동 반영 (교수님 할 일 없음)
