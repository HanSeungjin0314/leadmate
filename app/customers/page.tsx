"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { CUSTOMER_STATUSES } from "@/lib/status";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      setCustomers((data as Customer[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.phone.replaceAll("-", "").includes(q.replaceAll("-", ""));
      const matchesStatus = status === "ALL" || c.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, status]);

  return (
    <AppShell>
      <div className="page-head">
        <div><p className="eyebrow">CUSTOMERS</p><h1>고객 관리</h1><p>고객 검색, 상태 확인, 재연락 일정을 한 곳에서 관리합니다.</p></div>
        <Link href="/customers/new" className="button primary">+ 고객 추가</Link>
      </div>

      <section className="panel">
        <div className="toolbar">
          <input className="search" placeholder="이름 또는 전화번호 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">전체 상태</option>
            {CUSTOMER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {loading ? <p>불러오는 중...</p> : filtered.length === 0 ? <div className="empty">조건에 맞는 고객이 없습니다.</div> : (
          <div className="list-table">
            {filtered.map((c) => (
              <Link href={`/customers/${c.id}`} key={c.id} className="customer-row">
                <div className="grow">
                  <strong>{c.name}</strong>
                  <span>{c.phone} · {c.project_name || "현장 미지정"}</span>
                </div>
                <div className="customer-meta">{c.next_contact_at ? `다음 연락 ${new Date(c.next_contact_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}` : "다음 연락 없음"}</div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
