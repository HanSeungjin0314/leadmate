"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { CUSTOMER_STATUSES } from "@/lib/status";
import { createClient } from "@/lib/supabase/client";
import { useBusinessSettings } from "@/lib/useBusinessSettings";
import type { Customer } from "@/lib/types";

export default function AnalyticsPage() {
  const { settings, loading: settingsLoading } = useBusinessSettings();
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(settingsLoading||!settings)return;
    (async()=>{
      const supabase=createClient();
      const {data}=await supabase.from("customers").select("*").order("created_at",{ascending:false});
      setCustomers((data as Customer[])??[]); setLoading(false);
    })();
  },[settings,settingsLoading]);

  const summary=useMemo(()=>{
    const total=customers.length;
    const contracted=customers.filter(c=>c.status==="CONTRACTED").length;
    const active=customers.filter(c=>!["CONTRACTED","REJECTED"].includes(c.status)).length;
    const conversion=total?Math.round(contracted/total*100):0;
    const bySource=new Map<string,number>();
    customers.forEach(c=>bySource.set(c.source||"미지정",(bySource.get(c.source||"미지정")||0)+1));
    return {total,contracted,active,conversion,bySource:[...bySource.entries()].sort((a,b)=>b[1]-a[1])};
  },[customers]);

  if(settingsLoading||!settings)return <AppShell><p>설정을 불러오는 중...</p></AppShell>;
  return <AppShell>
    <div className="page-head"><div><p className="eyebrow">ANALYTICS</p><h1>영업 통계</h1><p>현재 고객 흐름과 계약 전환을 빠르게 확인합니다.</p></div></div>
    <section className="stat-grid">
      <div className="stat-card"><span>전체 고객</span><strong>{summary.total}</strong></div>
      <div className="stat-card"><span>진행중</span><strong>{summary.active}</strong></div>
      <div className="stat-card"><span>계약/완료</span><strong>{summary.contracted}</strong></div>
      <div className="stat-card"><span>단순 전환율</span><strong>{summary.conversion}%</strong></div>
    </section>
    <div className="analytics-grid">
      <section className="panel"><h2>영업 단계별 고객</h2>{loading?<p>불러오는 중...</p>:<div className="metric-list">{CUSTOMER_STATUSES.map(s=>{const count=customers.filter(c=>c.status===s.value).length; const pct=summary.total?Math.round(count/summary.total*100):0; return <div key={s.value} className="metric-row"><div><strong>{settings.pipeline_labels[s.value]}</strong><span>{count}명</span></div><div className="bar"><i style={{width:`${pct}%`}} /></div></div>})}</div>}</section>
      <section className="panel"><h2>유입경로별 고객</h2>{loading?<p>불러오는 중...</p>:summary.bySource.length===0?<div className="empty">아직 고객이 없습니다.</div>:<div className="metric-list">{summary.bySource.map(([source,count])=>{const pct=summary.total?Math.round(count/summary.total*100):0; return <div key={source} className="metric-row"><div><strong>{source}</strong><span>{count}명</span></div><div className="bar"><i style={{width:`${pct}%`}} /></div></div>})}</div>}</section>
    </div>
    <p className="analytics-note">※ 전환율은 현재 전체 고객 중 ‘계약/완료’ 단계 비율을 단순 계산한 값입니다.</p>
  </AppShell>;
}
