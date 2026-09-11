# Question Vote — Claude Code 작업 규칙

## 세션 시작 시 반드시

1. `CURRENT_STATUS.md`를 읽고 현재 Phase와 다음 할 일을 확인한다.
2. 요구사항은 `docs/PRD.md`가 유일한 기준이다.
3. 확인한 현재 상태를 한두 줄로 요약해 보여준 뒤 작업을 시작한다.

## 프로젝트 요약

- 수업 중 학생이 휴대폰으로 질문을 등록하고, 공감 투표로 토론 우선순위를 정하는 원페이지 웹앱
- 스택: Vite + React + TypeScript + Tailwind CSS + @supabase/supabase-js
- DB 스키마: `docs/schema.sql` (PRD 6.2와 동일)
- 배포: Vercel. **main 브랜치에 push되면 실제 수업용 앱에 바로 반영된다.**

## 작업 방식

- 한 번에 한 Phase만 구현한다. Phase 목록은 PRD 11.3.
- 코드를 쓰기 전에 **수정할 파일 목록과 이유를 먼저 보여주고 승인을 기다린다.**
- 동작하는 코드를 통째로 다시 쓰지 않는다. 필요한 부분만 최소 수정한다.
- PRD에 없는 기능은 추가하지 않는다. 좋은 아이디어가 있으면 제안만 한다.
- Phase가 끝나면 멈추고, 사람이 직접 확인할 방법(PRD 11.4 참고)을 알려준다.
- Phase 완료가 승인되면 `CURRENT_STATUS.md`를 업데이트한다.

## Git

- 커밋은 사람이 요청할 때만 한다.
- **`git push`는 직접 실행하지 않는다.** (push = 수업용 앱 즉시 반영)

## 보안 — 이 저장소는 공개 저장소다

- Supabase 키는 `.env.local`에서만 읽는다. 코드·주석·문서에 키 값을 쓰지 않는다.
- `.env.local`은 절대 커밋하지 않는다. 값 없는 `.env.example`만 커밋한다.
- service_role(secret) key는 사용하지 않는다.
- 실제 학생 이름 등 개인정보를 샘플 데이터나 테스트 코드에 넣지 않는다. (예시는 "김학생" 수준)

## DB 규칙

- 운영 DB는 교수님 소유이며, 앱은 anon key 권한만 가진다.
- 코드에서 `update` / `delete`를 직접 호출하지 않는다. 공감은 반드시 `vote(q_id, delta)` RPC로만 처리한다.
- 스키마 변경이 필요하면 `docs/schema.sql` 수정안과 **여러 번 실행해도 안전한 SQL**을 제안만 한다. 실행은 사람이 한다.

## 코드 규칙

- DB 컬럼(snake_case) ↔ 앱 타입(camelCase) 변환은 `src/lib/` 한 곳에서만 한다.
- 모바일 우선. PC(빔프로젝터)에서는 최대 폭 제한.
- UI 문구는 한국어.
- 날짜 구분은 한국 시간(Asia/Seoul) 기준.

## 명령어

| 용도 | 명령 |
|---|---|
| 로컬 실행 | `npm run dev` |
| 휴대폰에서 접속 테스트 | `npm run dev -- --host` |
| 빌드 확인 | `npm run build` |
