# LeadMate V2.0

모든 리드를 다음 행동으로 연결하는 맞춤형 영업 CRM입니다.

## V1.3에서 업그레이드하는 경우
1. 기존 Supabase의 `001_v1_initial.sql`은 다시 실행하지 않습니다.
2. Supabase SQL Editor에서 `supabase/migrations/002_v2_business_customization.sql`만 실행합니다.
3. 기존 `.env.local`을 그대로 사용합니다.
4. `npm install` 후 `npm run build`로 먼저 검증합니다.
5. `npm run dev`로 실행합니다.
6. 기존 계정으로 로그인하면 최초 1회 온보딩 화면이 표시됩니다. 업종 설정을 완료하면 기존 고객 데이터가 해당 비즈니스에 연결됩니다.

## 신규 설치
1. `001_v1_initial.sql` 실행
2. `002_v2_business_customization.sql` 실행
3. `.env.local` 설정
4. `npm install`
5. `npm run build`
6. `npm run dev`

## 버전 규칙
- V2.1, V2.2: UI/UX, 필드, 작은 기능 개선
- V3.0: 핵심 아키텍처 또는 주요 DB 구조가 크게 바뀌는 경우
