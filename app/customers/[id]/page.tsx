"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { CUSTOMER_STATUSES } from "@/lib/status";
import { createClient } from "@/lib/supabase/client";
import type { Activity, Customer } from "@/lib/types";

function toLocalInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toInputDate(d: Date) {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, "");
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activityText, setActivityText] = useState("");
  const [nextContactAt, setNextContactAt] = useState("");

  async function load() {
    const supabase = createClient();
    const [{ data: customerData, error }, { data: activityData }] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("activities").select("*").eq("customer_id", id).order("created_at", { ascending: false })
    ]);
    if (error) setMessage(error.message);
    const loaded = (customerData as Customer) ?? null;
    setCustomer(loaded);
    setNextContactAt(toLocalInput(loaded?.next_contact_at ?? null));
    setActivities((activityData as Activity[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function saveCustomer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customer) return;
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      status: String(form.get("status")),
      project_name: String(form.get("project_name") || "").trim() || null,
      source: String(form.get("source") || "").trim() || null,
      interest_type: String(form.get("interest_type") || "").trim() || null,
      memo: String(form.get("memo") || "").trim() || null,
      next_contact_at: nextContactAt ? new Date(nextContactAt).toISOString() : null
    };

    if (!payload.name || !payload.phone) return setMessage("이름과 전화번호는 필수입니다.");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const previousStatus = customer.status;
    const { error } = await supabase.from("customers").update(payload).eq("id", id);
    if (error) return setMessage(error.message);

    if (user && previousStatus !== payload.status) {
      await supabase.from("activities").insert({
        customer_id: id,
        user_id: user.id,
        type: "status_change",
        content: `상태 변경: ${previousStatus} → ${payload.status}`
      });
    }
    setMessage("고객 정보를 저장했습니다.");
    await load();
  }

  async function addActivity() {
    const text = activityText.trim();
    if (!text) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("activities").insert({ customer_id: id, user_id: user.id, type: "call", content: text });
    if (error) return setMessage(error.message);
    setActivityText("");
    setMessage("상담기록을 추가했습니다.");
    await load();
  }

  async function copyPhone() {
    if (!customer) return;
    try {
      await navigator.clipboard.writeText(customer.phone);
      setMessage("전화번호를 복사했습니다.");
    } catch {
      setMessage("전화번호 복사에 실패했습니다. 직접 선택해 복사해주세요.");
    }
  }

  function scheduleQuick(kind: "1h" | "tomorrow10" | "tomorrow14" | "3days10" | "clear") {
    if (kind === "clear") {
      setNextContactAt("");
      setMessage("다음 연락 일정을 해제했습니다. 저장 버튼을 눌러 반영하세요.");
      return;
    }

    const d = new Date();
    d.setSeconds(0, 0);
    if (kind === "1h") d.setHours(d.getHours() + 1);
    if (kind === "tomorrow10") {
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
    }
    if (kind === "tomorrow14") {
      d.setDate(d.getDate() + 1);
      d.setHours(14, 0, 0, 0);
    }
    if (kind === "3days10") {
      d.setDate(d.getDate() + 3);
      d.setHours(10, 0, 0, 0);
    }
    setNextContactAt(toInputDate(d));
    setMessage("재연락 시간을 선택했습니다. 저장 버튼을 눌러 반영하세요.");
  }

  async function deleteCustomer() {
    if (!customer) return;
    const ok = confirm(`'${customer.name}' 고객을 삭제할까요?\n상담 기록도 함께 삭제되며 이 작업은 되돌릴 수 없습니다.`);
    if (!ok) return;
    const supabase = createClient();
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return setMessage(error.message);
    router.push("/customers");
    router.refresh();
  }

  if (loading) return <AppShell><p>불러오는 중...</p></AppShell>;
  if (!customer) return <AppShell><div className="empty">고객을 찾을 수 없습니다.</div></AppShell>;

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <p className="eyebrow">CUSTOMER DETAIL</p>
          <div className="title-with-badge"><h1>{customer.name}</h1><StatusBadge status={customer.status} /></div>
          <div className="phone-actions">
            <a className="phone-link" href={`tel:${normalizePhone(customer.phone)}`}>{customer.phone}</a>
            <a className="button mini primary" href={`tel:${normalizePhone(customer.phone)}`}>전화 걸기</a>
            <button type="button" className="button mini ghost" onClick={copyPhone}>번호 복사</button>
          </div>
        </div>
        <button className="button danger" onClick={deleteCustomer}>고객 삭제</button>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>고객 정보</h2>
          <form onSubmit={saveCustomer} className="form-stack">
            <label>이름 *<input name="name" required defaultValue={customer.name} /></label>
            <label>전화번호 *<input name="phone" required defaultValue={customer.phone} /></label>
            <label>상태<select name="status" defaultValue={customer.status}>{CUSTOMER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
            <label>현장<input name="project_name" defaultValue={customer.project_name ?? ""} /></label>
            <label>유입경로<input name="source" defaultValue={customer.source ?? ""} /></label>
            <label>관심타입<input name="interest_type" defaultValue={customer.interest_type ?? ""} /></label>
            <label>다음 연락
              <input type="datetime-local" name="next_contact_at" value={nextContactAt} onChange={(e) => setNextContactAt(e.target.value)} />
            </label>
            <div className="quick-schedule" aria-label="재연락 빠른 선택">
              <button type="button" onClick={() => scheduleQuick("1h")}>1시간 후</button>
              <button type="button" onClick={() => scheduleQuick("tomorrow10")}>내일 10시</button>
              <button type="button" onClick={() => scheduleQuick("tomorrow14")}>내일 14시</button>
              <button type="button" onClick={() => scheduleQuick("3days10")}>3일 후 10시</button>
              <button type="button" className="clear" onClick={() => scheduleQuick("clear")}>일정 해제</button>
            </div>
            <label>메모<textarea name="memo" rows={6} defaultValue={customer.memo ?? ""} /></label>
            <button className="button primary">고객 정보 저장</button>
          </form>
          {message && <p className="notice">{message}</p>}
        </section>

        <section className="panel">
          <h2>상담 기록</h2>
          <div className="activity-compose">
            <textarea value={activityText} onChange={(e) => setActivityText(e.target.value)} rows={4} placeholder="통화 내용, 고객 반응, 다음 확인사항을 기록하세요." />
            <button className="button primary" onClick={addActivity}>상담 기록 추가</button>
          </div>
          <div className="timeline">
            {activities.length === 0 ? <div className="empty">아직 상담 기록이 없습니다.</div> : activities.map((a) => (
              <div key={a.id} className="timeline-item">
                <div className="timeline-dot" />
                <div><strong>{a.type === "status_change" ? "상태 변경" : "상담 기록"}</strong><p>{a.content}</p><span>{new Date(a.created_at).toLocaleString("ko-KR")}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
