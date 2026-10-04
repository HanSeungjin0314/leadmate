# LeadMate V1.1

광고 DB부터 재연락·방문·계약까지 놓치지 않도록 관리하는 분양 영업 CRM의 V1.1입니다.

## 버전 규칙
- `V1`, `V2`, `V3` : DB 구조, 핵심 기능, 서비스 구조 등 중요한 변경
- `V1.1`, `V1.2` : UI/UX, 작은 기능 추가, 오류 수정 등 사소한 변경
- Supabase DB 변경이 필요한 경우 새 migration SQL 파일을 번호 순서로 추가합니다.
- 기존 migration 파일은 수정하거나 다시 실행하지 않습니다.

## V1.1 업그레이드
V1.1은 DB 변경이 없습니다.

### 기존 V1 사용자의 경우
1. 기존 `.env.local` 파일을 안전하게 보관합니다.
2. V1.1 소스 폴더에 기존 `.env.local`을 복사합니다.
3. Supabase의 `001_v1_initial.sql`을 다시 실행하지 않습니다.
4. 터미널에서 실행:

```bash
npm install
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속
6. 기존 계정으로 로그인하면 기존 데이터가 그대로 보입니다.

## V1.1 주요 개선
- 고객 상세에서 전화 걸기
- 전화번호 복사
- 고객 이름/전화번호 수정
- 재연락 일정 빠른 선택
- 삭제 확인 UX 강화

## 신규 설치
1. Supabase 프로젝트 생성
2. `supabase/migrations/001_v1_initial.sql`을 SQL Editor에서 1회 실행
3. `.env.example`을 `.env.local`로 복사
4. Supabase Project URL과 anon/publishable key 입력
5. 설치/실행

```bash
npm install
npm run dev
```

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

`service_role` 키는 브라우저 앱에 넣지 마세요.

## V1.1 테스트 체크리스트
- [ ] 기존 계정 로그인
- [ ] 기존 고객 데이터 확인
- [ ] 고객 이름 수정 후 새로고침해도 유지
- [ ] 전화번호 수정 후 유지
- [ ] 전화 걸기 버튼 동작
- [ ] 번호 복사 버튼 동작
- [ ] 재연락 `1시간 후` 선택 → 저장 → 유지
- [ ] 내일 10시/14시 선택 → 저장 → 대시보드 반영
- [ ] 일정 해제 → 저장
- [ ] 고객 삭제 취소/확인 동작

## Supabase migration 정책
현재 적용:

```text
001_v1_initial.sql  ← V1 최초 스키마
V1.1               ← DB 변경 없음
```

향후 DB 변경이 생기면 예를 들어:

```text
002_v2_team_schema.sql
003_v2_meta_lead_source.sql
```

처럼 새 파일만 추가합니다.
