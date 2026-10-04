"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { BUSINESS_PRESETS, getPreset, type CustomField, type IndustryCode, type UsageMode } from "@/lib/business";
import { CUSTOMER_STATUSES, type CustomerStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/client";
import { useBusinessSettings } from "@/lib/useBusinessSettings";

function fieldKey(label: string, index: number) {
  const base = label.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9가-힣_]/g, "");
  return base || `field_${index + 1}`;
}

export default function SettingsPage() {
  const { settings, loading, reload } = useBusinessSettings({ redirectToOnboarding: false });
  const [industry,setIndustry]=useState<IndustryCode>("other");
  const [usageMode,setUsageMode]=useState<UsageMode>("solo");
  const [businessName,setBusinessName]=useState("");
  const [sources,setSources]=useState<string[]>([]);
  const [sourceInput,setSourceInput]=useState("");
  const [pipeline,setPipeline]=useState<Record<CustomerStatus,string>>({} as Record<CustomerStatus,string>);
  const [customFields,setCustomFields]=useState<CustomField[]>([]);
  const [fieldLabel,setFieldLabel]=useState("");
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    if(settings){
      setIndustry(settings.industry);
      setUsageMode(settings.usage_mode);
      setBusinessName(settings.business_name||"");
      setSources(settings.source_options);
      setPipeline(settings.pipeline_labels);
      setCustomFields(settings.custom_fields || []);
    }
  },[settings]);

  const preset=useMemo(()=>getPreset(industry),[industry]);

  function applyPreset(nextIndustry: IndustryCode) {
    setIndustry(nextIndustry);
    const p = getPreset(nextIndustry);
    setSources(p.sourceOptions);
    setPipeline(p.pipelineLabels);
  }

  function addSource() {
    const value = sourceInput.trim();
    if (!value || sources.includes(value)) return;
    setSources([...sources, value]);
    setSourceInput("");
  }

  function addCustomField() {
    const label = fieldLabel.trim();
    if (!label || customFields.length >= 8) return;
    const key = `${fieldKey(label, customFields.length)}_${Date.now().toString().slice(-5)}`;
    setCustomFields([...customFields, { key, label, placeholder: `${label} 입력` }]);
    setFieldLabel("");
  }

  async function save(e:FormEvent){
    e.preventDefault();
    if(!settings)return;
    setSaving(true); setMessage("");
    const supabase=createClient();
    const {error}=await supabase.from("business_settings").update({
      industry,
      usage_mode:usageMode,
      business_name:businessName.trim()||null,
      product_label:preset.productLabel,
      secondary_label:preset.secondaryLabel,
      source_options:sources.length?sources:preset.sourceOptions,
      pipeline_labels:pipeline,
      custom_fields:customFields,
      updated_at:new Date().toISOString()
    }).eq("business_id",settings.business_id);
    if(error)setMessage(error.message);
    else {
      await supabase.from("businesses").update({name:businessName.trim()||"내 비즈니스"}).eq("id",settings.business_id);
      setMessage("설정을 저장했습니다.");
      await reload();
    }
    setSaving(false);
  }

  if(loading||!settings)return <AppShell><p>설정을 불러오는 중...</p></AppShell>;

  return <AppShell>
    <div className="page-head"><div><p className="eyebrow">SETTINGS</p><h1>비즈니스 설정</h1><p>업종 템플릿을 바탕으로 우리 영업 방식에 맞게 직접 조정하세요.</p></div></div>
    <section className="panel form-panel wide-panel">
      <form onSubmit={save} className="form-stack">
        <div className="settings-section">
          <h2>기본 설정</h2>
          <div className="form-grid">
            <label>업종<select value={industry} onChange={(e)=>applyPreset(e.target.value as IndustryCode)}>{BUSINESS_PRESETS.map(p=><option key={p.code} value={p.code}>{p.label}</option>)}</select></label>
            <label>사용 방식<select value={usageMode} onChange={(e)=>setUsageMode(e.target.value as UsageMode)}><option value="solo">개인 영업</option><option value="team">영업팀</option></select></label>
            <label className="full-span">회사/사업명<input value={businessName} onChange={(e)=>setBusinessName(e.target.value)} /></label>
          </div>
        </div>

        <div className="settings-section">
          <h2>영업 단계 이름</h2>
          <p className="section-help">내 업종에서 실제로 쓰는 표현으로 바꿀 수 있습니다.</p>
          <div className="pipeline-edit-grid">
            {CUSTOMER_STATUSES.map((s)=><label key={s.value}><span className="mini-code">{s.label}</span><input value={pipeline[s.value] || ""} onChange={(e)=>setPipeline({...pipeline,[s.value]:e.target.value})} /></label>)}
          </div>
        </div>

        <div className="settings-section">
          <h2>고객 유입경로</h2>
          <div className="tag-list">{sources.map((s)=><span key={s} className="setting-tag">{s}<button type="button" onClick={()=>setSources(sources.filter(x=>x!==s))}>×</button></span>)}</div>
          <div className="inline-add"><input placeholder="예: 인스타그램, 박람회, 지인추천" value={sourceInput} onChange={(e)=>setSourceInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();addSource();}}}/><button type="button" className="button ghost" onClick={addSource}>추가</button></div>
        </div>

        <div className="settings-section">
          <h2>사용자 정의 고객 항목</h2>
          <p className="section-help">고객마다 추가로 기록할 항목을 최대 8개까지 만들 수 있습니다.</p>
          <div className="tag-list">{customFields.length===0?<span className="muted-text">추가 항목이 없습니다.</span>:customFields.map((f)=><span key={f.key} className="setting-tag">{f.label}<button type="button" onClick={()=>setCustomFields(customFields.filter(x=>x.key!==f.key))}>×</button></span>)}</div>
          <div className="inline-add"><input placeholder="예: 예산, 구매예정일, 담당부서" value={fieldLabel} onChange={(e)=>setFieldLabel(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();addCustomField();}}}/><button type="button" className="button ghost" onClick={addCustomField}>항목 추가</button></div>
        </div>

        {message&&<p className="notice">{message}</p>}
        <button className="button primary" disabled={saving}>{saving?"저장 중...":"설정 저장"}</button>
      </form>
    </section>
  </AppShell>;
}
