"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useBusinessSettings } from "@/lib/useBusinessSettings";

export default function NewCustomerPage() {
  const router = useRouter();
  const { settings, loading: settingsLoading } = useBusinessSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true); setError("");
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("로그인이 필요합니다."); setSaving(false); return; }
    const payload = {
      user_id: user.id,
      business_id: settings.business_id,
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      project_name: String(form.get("project_name") || "").trim() || null,
      source: String(form.get("source") || "").trim() || null,
      interest_type: String(form.get("interest_type") || "").trim() || null,
      memo: String(form.get("memo") || "").trim() || null,
      status: "NEW"
    };
    const { data, error } = await supabase.from("customers").insert(payload).select("id").single();
    if (error) { setError(error.message); setSaving(false); return; }
    router.push(`/customers/${data.id}`); router.refresh();
  }

  if (settingsLoading || !settings) return <AppShell><p>설정을 불러오는 중...</p></AppShell>;
  return <AppShell>
    <div className="page-head"><div><p className="eyebrow">NEW LEAD</p><h1>신규 고객 등록</h1><p>업종에 맞춘 핵심 정보만 입력하고 영업을 시작하세요.</p></div></div>
    <section className="panel form-panel"><form onSubmit={submit} className="form-grid">
      <label>이름 *<input name="name" required /></label>
      <label>전화번호 *<input name="phone" required placeholder="010-0000-0000" /></label>
      <label>{settings.product_label}<input name="project_name" placeholder={`${settings.product_label} 입력`} /></label>
      <label>유입경로<select name="source" defaultValue={settings.source_options[0] || "기타"}>{settings.source_options.map((s)=><option key={s}>{s}</option>)}</select></label>
      <label>{settings.secondary_label}<input name="interest_type" placeholder={`${settings.secondary_label} 입력`} /></label>
      <label className="full-span">메모<textarea name="memo" rows={5} placeholder="고객 상황, 니즈, 제안 내용, 다음 확인사항을 기록하세요." /></label>
      {error && <p className="notice error full-span">{error}</p>}
      <div className="form-actions full-span"><button type="button" className="button ghost" onClick={() => router.back()}>취소</button><button className="button primary" disabled={saving}>{saving ? "저장 중..." : "고객 저장"}</button></div>
    </form></section>
  </AppShell>;
}
