export const CUSTOMER_STATUSES = [
  { value: "NEW", label: "신규" },
  { value: "CONTACTED", label: "1차 통화" },
  { value: "INTERESTED", label: "관심" },
  { value: "CALLBACK", label: "재통화" },
  { value: "VISIT_BOOKED", label: "방문예약" },
  { value: "VISITED", label: "방문완료" },
  { value: "CONTRACTED", label: "계약" },
  { value: "HOLD", label: "보류" },
  { value: "REJECTED", label: "거절" }
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]["value"];

export function statusLabel(value?: string | null) {
  return CUSTOMER_STATUSES.find((item) => item.value === value)?.label ?? value ?? "-";
}
