"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      project_name: String(form.get("project_name") || "").trim() || null,
      source: String(form.get("source") || "").trim() || null,
      interest_type: String(form.get("interest_type") || "").trim() || null,
      memo: String(form.get("memo") || "").trim() || null,
      status: "NEW"
    };

    const { data, error } = await supabase.from("customers").insert(payload).select("id").single();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/customers/${data.id}`);
    router.refresh();
  }

  return (
    <AppShell>
      <div className="page-head"><div><p className="eyebrow">NEW LEAD</p><h1>신규 고객 등록</h1><p>최소 정보만 입력하고 상담을 시작하세요.</p></div></div>
      <section className="panel form-panel">
        <form onSubmit={submit} className="form-grid">
          <label>이름 *<input name="name" required /></label>
          <label>전화번호 *<input name="phone" required placeholder="010-0000-0000" /></label>
          <label>현장<input name="project_name" placeholder="예: 아산자이그랜드파크" /></label>
          <label>유입경로
            <select name="source" defaultValue="Meta">
              <option>Meta</option><option>Google</option><option>Naver</option><option>소개</option><option>현장방문</option><option>기타</option>
            </select>
          </label>
          <label>관심타입<input name="interest_type" placeholder="예: 34평" /></label>
          <label className="full-span">메모<textarea name="memo" rows={5} placeholder="고객 상황, 관심 혜택, 자금계획 등을 기록하세요." /></label>
          {error && <p className="notice error full-span">{error}</p>}
          <div className="form-actions full-span"><button type="button" className="button ghost" onClick={() => router.back()}>취소</button><button className="button primary" disabled={saving}>{saving ? "저장 중..." : "고객 저장"}</button></div>
        </form>
      </section>
    </AppShell>
  );
}
