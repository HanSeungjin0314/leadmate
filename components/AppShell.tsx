"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const nav = [
    { href: "/", label: "홈" },
    { href: "/customers", label: "고객" }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-row">
            <div className="brand-mark">LM</div>
            <div>
              <strong>LeadMate</strong>
              <div className="version">{APP_VERSION}</div>
            </div>
          </div>
          <nav className="nav-list">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={active ? "nav-item active" : "nav-item"}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button className="button ghost full" onClick={logout}>로그아웃</button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
