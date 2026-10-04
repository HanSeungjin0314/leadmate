"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { BUSINESS_PRESETS, getPreset, type IndustryCode, type UsageMode } from "@/lib/business";
import { createClient } from "@/lib/supabase/client";
import { useBusinessSettings } from "@/lib/useBusinessSettings";

export default function SettingsPage() {
  const { settings, loading, reload } = useBusinessSettings({ redirectToOnboarding: false });
  const [industry,setIndustry]=useState<IndustryCode>("other"); const [usageMode,setUsageMode]=useState<UsageMode>("solo"); const [businessName,setBusinessName]=useState(""); const [message,setMessage]=useState(""); const [saving,setSaving]=useState(false);
  useEffect(()=>{ if(settings){ setIndustry(settings.industry); setUsageMode(settings.usage_mode); setBusinessName(settings.business_name||""); } },[settings]);
  const preset=useMemo(()=>getPreset(industry),[industry]);
  async function save(e:FormEvent){ e.preventDefault(); if(!settings)return; setSaving(true); setMessage(""); const supabase=createClient(); const {error}=await supabase.from("business_settings").update({industry,usage_mode:usageMode,business_name:businessName.trim()||null,product_label:preset.productLabel,secondary_label:preset.secondaryLabel,source_options:preset.sourceOptions,pipeline_labels:preset.pipelineLabels,updated_at:new Date().toISOString()}).eq("business_id",settings.business_id); if(error)setMessage(error.message); else { await supabase.from("businesses").update({name:businessName.trim()||"내 비즈니스"}).eq("id",settings.business_id); setMessage("설정을 저장했습니다. 업종별 용어와 영업 단계가 반영됩니다."); await reload(); } setSaving(false); }
  if(loading||!settings)return <AppShell><p>설정을 불러오는 중...</p></AppShell>;
  return <AppShell><div className="page-head"><div><p className="eyebrow">SETTINGS</p><h1>비즈니스 설정</h1><p>업종을 바꾸면 고객 정보 라벨과 영업 단계가 자동으로 바뀝니다.</p></div></div><section className="panel form-panel"><form onSubmit={save} className="form-stack"><label>업종<select value={industry} onChange={(e)=>setIndustry(e.target.value as IndustryCode)}>{BUSINESS_PRESETS.map(p=><option key={p.code} value={p.code}>{p.label}</option>)}</select></label><label>사용 방식<select value={usageMode} onChange={(e)=>setUsageMode(e.target.value as UsageMode)}><option value="solo">개인 영업</option><option value="team">영업팀</option></select></label><label>회사/사업명<input value={businessName} onChange={(e)=>setBusinessName(e.target.value)} /></label><div className="preset-preview"><strong>적용될 고객 정보</strong><p>{preset.productLabel} · {preset.secondaryLabel}</p><strong>적용될 영업 단계</strong><p>{Object.values(preset.pipelineLabels).join(" → ")}</p></div>{message&&<p className="notice">{message}</p>}<button className="button primary" disabled={saving}>{saving?"저장 중...":"설정 저장"}</button></form></section></AppShell>;
}
