# Question Vote

수업 중 학생들이 휴대폰으로 질문을 등록하고, 공감 투표로 토론할 질문의 우선순위를 정하는 웹앱입니다.

## 수업에서 쓰는 법

**학생**
1. QR 코드 또는 링크로 접속
2. 이름 입력 후 입장
3. 질문 등록 · 다른 질문에 공감 (한 질문에 한 번, 다시 누르면 취소)

**교수**
1. 같은 주소를 강의실 화면에 띄우기
2. 공감 수가 높은 질문부터 토론 진행

질문은 날짜별로 자동 구분되어, 접속한 날(한국 시간 기준)의 질문만 보입니다.

## 데이터 관리 (Supabase 대시보드)

| 하고 싶은 일 | 방법 |
|---|---|
| 질문 보기 | Table Editor → `questions` → `session_date`로 필터 |
| 부적절한 질문 삭제 | 해당 행 선택 → Delete |
| 백업 | Table Editor → Export → CSV |
| 방학 후 앱이 안 될 때 | 프로젝트가 Paused 상태면 Restore (무료 플랜은 장기간 미사용 시 일시정지될 수 있음) |

---

## 개발자용

### 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 입력
npm run dev                  # http://localhost:5173
npm run dev -- --host        # 같은 Wi-Fi의 휴대폰에서 접속 테스트
```

### 환경변수

| 이름 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon / Publishable key (service_role 키 사용 금지) |

로컬은 `.env.local`, 배포는 Vercel 프로젝트의 Environment Variables에 설정합니다. `.env.local`은 커밋하지 않습니다.

### DB 세팅

새 Supabase 프로젝트의 SQL Editor에서 `docs/schema.sql`을 실행합니다. 여러 번 실행해도 안전합니다.

### 배포

`main` 브랜치에 push하면 Vercel이 자동으로 배포합니다. push 전에 로컬에서 반드시 확인하세요.

### 문서

| 파일 | 내용 |
|---|---|
| `docs/PRD.md` | 요구사항 · 설계 · Acceptance Criteria |
| `docs/schema.sql` | DB 스키마 (테이블 · 보안 정책 · 공감 함수 · 실시간 설정) |
| `CURRENT_STATUS.md` | 개발 진행 상황 |
| `CLAUDE.md` | Claude Code 작업 규칙 |
