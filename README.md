# LeadMate V2.1

범용 영업 CRM LeadMate의 V2.1입니다.

## V2.1 핵심
- 업종 템플릿 유지
- 영업 단계 명칭 직접 수정
- 고객 유입경로 직접 관리
- 사용자 정의 고객 필드 최대 8개
- 기본 영업 통계

## 기존 V2.0 사용자의 업데이트
1. 기존 Supabase에서 `001`, `002`를 다시 실행하지 마세요.
2. `supabase/migrations/003_v2_1_customization.sql`만 SQL Editor에서 실행하세요.
3. 기존 `.env.local`을 유지합니다.
4. `npm install`
5. `npm run build`
6. `npm run dev`

기존 고객/상담 기록은 유지됩니다.


## V2.2 변경사항
- 웹 브라우저 제목: LeadMate
- 범용 영업 CRM 메타 설명 적용
- Supabase migration 추가 없음
