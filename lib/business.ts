import type { CustomerStatus } from "@/lib/status";

export type IndustryCode = "real_estate" | "insurance" | "automotive" | "medical" | "education" | "b2b" | "retail" | "other";
export type UsageMode = "solo" | "team";

export type BusinessPreset = {
  code: IndustryCode;
  label: string;
  productLabel: string;
  secondaryLabel: string;
  productPlaceholder: string;
  secondaryPlaceholder: string;
  sourceOptions: string[];
  pipelineLabels: Record<CustomerStatus, string>;
  dashboard: { newLabel: string; actionLabel: string; scheduleLabel: string; staleLabel: string };
};

const commonSources = ["Meta", "Google", "Naver", "소개", "전화", "오프라인", "기타"];

export const BUSINESS_PRESETS: BusinessPreset[] = [
  { code:"real_estate", label:"부동산 / 분양", productLabel:"현장", secondaryLabel:"관심평형", productPlaceholder:"예: 아산자이그랜드파크", secondaryPlaceholder:"예: 34평", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규",CONTACTED:"상담",INTERESTED:"관심",CALLBACK:"재상담",VISIT_BOOKED:"방문예약",VISITED:"방문",CONTRACTED:"계약",HOLD:"보류",REJECTED:"거절"},
    dashboard:{newLabel:"신규 고객",actionLabel:"오늘 재연락",scheduleLabel:"오늘 방문",staleLabel:"장기 미접촉"}},
  { code:"insurance", label:"보험 / 금융", productLabel:"관심상품", secondaryLabel:"보험종류", productPlaceholder:"예: 종신보험 / 건강보험", secondaryPlaceholder:"예: 보장성 / 저축성", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규",CONTACTED:"상담",INTERESTED:"니즈분석",CALLBACK:"상품제안",VISIT_BOOKED:"검토",VISITED:"청약",CONTRACTED:"계약",HOLD:"보류",REJECTED:"거절"},
    dashboard:{newLabel:"신규 고객",actionLabel:"오늘 상담",scheduleLabel:"예정 상담",staleLabel:"장기 미접촉"}},
  { code:"automotive", label:"자동차", productLabel:"관심차량", secondaryLabel:"구매예정시기", productPlaceholder:"예: GV80", secondaryPlaceholder:"예: 3개월 이내", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규",CONTACTED:"상담",INTERESTED:"차량선택",CALLBACK:"견적",VISIT_BOOKED:"시승",VISITED:"계약검토",CONTRACTED:"계약/출고",HOLD:"보류",REJECTED:"거절"},
    dashboard:{newLabel:"신규 고객",actionLabel:"오늘 상담",scheduleLabel:"시승 예정",staleLabel:"장기 미접촉"}},
  { code:"medical", label:"의료 / 병원 / 의료기기", productLabel:"관심제품", secondaryLabel:"병원/기관명", productPlaceholder:"예: 환자감시장치", secondaryPlaceholder:"예: OO병원", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규 리드",CONTACTED:"연락",INTERESTED:"미팅",CALLBACK:"제안",VISIT_BOOKED:"견적",VISITED:"협상",CONTRACTED:"계약",HOLD:"보류",REJECTED:"실주"},
    dashboard:{newLabel:"신규 리드",actionLabel:"오늘 후속연락",scheduleLabel:"미팅/일정",staleLabel:"장기 미접촉"}},
  { code:"education", label:"교육 / 학원", productLabel:"관심과정", secondaryLabel:"학생/수강정보", productPlaceholder:"예: 컴활 2급", secondaryPlaceholder:"예: 고3 / 직장인", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규",CONTACTED:"상담",INTERESTED:"과정추천",CALLBACK:"재상담",VISIT_BOOKED:"방문/체험",VISITED:"등록검토",CONTRACTED:"등록",HOLD:"보류",REJECTED:"거절"},
    dashboard:{newLabel:"신규 문의",actionLabel:"오늘 상담",scheduleLabel:"방문/체험",staleLabel:"장기 미접촉"}},
  { code:"b2b", label:"B2B 영업", productLabel:"관심제품/서비스", secondaryLabel:"회사명", productPlaceholder:"예: 솔루션 / 장비 / 서비스", secondaryPlaceholder:"예: ABC Corp.", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규 리드",CONTACTED:"연락",INTERESTED:"미팅",CALLBACK:"제안",VISIT_BOOKED:"견적",VISITED:"협상",CONTRACTED:"계약",HOLD:"보류",REJECTED:"실주"},
    dashboard:{newLabel:"신규 리드",actionLabel:"오늘 후속연락",scheduleLabel:"미팅/일정",staleLabel:"장기 미접촉"}},
  { code:"retail", label:"쇼핑 / 유통", productLabel:"관심상품", secondaryLabel:"구매예정/수량", productPlaceholder:"예: 프리미엄 패키지", secondaryPlaceholder:"예: 이번 달 / 10개", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규",CONTACTED:"문의응대",INTERESTED:"관심",CALLBACK:"후속안내",VISIT_BOOKED:"견적/샘플",VISITED:"구매검토",CONTRACTED:"구매",HOLD:"보류",REJECTED:"이탈"},
    dashboard:{newLabel:"신규 문의",actionLabel:"오늘 후속연락",scheduleLabel:"예정 일정",staleLabel:"장기 미접촉"}},
  { code:"other", label:"기타", productLabel:"관심상품/서비스", secondaryLabel:"추가정보", productPlaceholder:"고객이 관심 있는 상품 또는 서비스", secondaryPlaceholder:"영업에 필요한 추가 정보", sourceOptions:commonSources,
    pipelineLabels:{NEW:"신규",CONTACTED:"연락",INTERESTED:"관심",CALLBACK:"후속연락",VISIT_BOOKED:"일정확정",VISITED:"진행",CONTRACTED:"계약/완료",HOLD:"보류",REJECTED:"거절"},
    dashboard:{newLabel:"신규 리드",actionLabel:"오늘 후속연락",scheduleLabel:"예정 일정",staleLabel:"장기 미접촉"}}
];

export function getPreset(code?: string | null) {
  return BUSINESS_PRESETS.find((p) => p.code === code) ?? BUSINESS_PRESETS[BUSINESS_PRESETS.length - 1];
}

export type BusinessSettings = {
  business_id: string;
  industry: IndustryCode;
  usage_mode: UsageMode;
  business_name: string | null;
  product_label: string;
  secondary_label: string;
  source_options: string[];
  pipeline_labels: Record<CustomerStatus, string>;
  onboarding_completed: boolean;
};

export function normalizeSettings(row: any): BusinessSettings | null {
  if (!row) return null;
  const preset = getPreset(row.industry);
  return {
    business_id: row.business_id,
    industry: (row.industry ?? "other") as IndustryCode,
    usage_mode: (row.usage_mode ?? "solo") as UsageMode,
    business_name: row.business_name ?? null,
    product_label: row.product_label || preset.productLabel,
    secondary_label: row.secondary_label || preset.secondaryLabel,
    source_options: Array.isArray(row.source_options) && row.source_options.length ? row.source_options : preset.sourceOptions,
    pipeline_labels: { ...preset.pipelineLabels, ...(row.pipeline_labels || {}) },
    onboarding_completed: Boolean(row.onboarding_completed)
  };
}
