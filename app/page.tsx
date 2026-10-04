"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/lib/types";

function isToday(value: string | null) {
  if (!value) return false;
  const d = new Date(value);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      fresh: customers.filter((c) => c.status === "NEW").length,
      callbacks: customers.filter((c) => c.next_contact_at && isToday(c.next_contact_at)).length,
      visits: customers.filter((c) => c.status === "VISIT_BOOKED" && c.next_contact_at && isToday(c.next_contact_at)).length,
      stale: customers.filter((c) => now - new Date(c.updated_at).getTime() >= 3 * 24 * 60 * 60 * 1000 && !["CONTRACTED", "REJECTED"].includes(c.status)).length
    };
  }, [customers]);

  const todayList = customers
    .filter((c) => c.next_contact_at && isToday(c.next_contact_at))
    .sort((a, b) => new Date(a.next_contact_at!).getTime() - new Date(b.next_contact_at!).getTime())
    .slice(0, 10);

  return (
    <AppShell>
      <div className="page-head">
        <div><p className="eyebrow">TODAY</p><h1>오늘 관리할 고객</h1><p>재연락과 방문 예정 고객을 먼저 처리하세요.</p></div>
        <Link href="/customers/new" className="button primary">+ 고객 추가</Link>
      </div>

      <section className="stat-grid">
        <div className="stat-card"><span>신규 DB</span><strong>{stats.fresh}</strong></div>
        <div className="stat-card"><span>오늘 재통화</span><strong>{stats.callbacks}</strong></div>
        <div className="stat-card"><span>방문예약</span><strong>{stats.visits}</strong></div>
        <div className="stat-card"><span>3일 이상 미접촉</span><strong>{stats.stale}</strong></div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>오늘 재연락</h2><Link href="/customers">전체 고객 보기</Link></div>
        {loading ? <p>불러오는 중...</p> : todayList.length === 0 ? <div className="empty">오늘 예정된 재연락이 없습니다.</div> : (
          <div className="list-table">
            {todayList.map((c) => (
              <Link href={`/customers/${c.id}`} key={c.id} className="customer-row">
                <div className="time">{new Date(c.next_contact_at!).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</div>
                <div className="grow"><strong>{c.name}</strong><span>{c.phone}</span></div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
