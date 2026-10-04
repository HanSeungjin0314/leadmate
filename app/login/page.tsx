"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION } from "@/lib/version";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) setMessage(error.message);
      else setMessage("회원가입이 완료되었습니다. 로그인 후 내 비즈니스에 맞게 LeadMate를 설정하세요.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand-row center">
          <img className="brand-logo login-logo" src="/leadmate-icon.png" alt="LeadMate" />
          <div>
            <h1><span className="brand-lead">Lead</span><span className="brand-mate">Mate</span> <span className="version-inline">{APP_VERSION}</span></h1>
            <p>모든 리드를 다음 행동으로 연결하는 맞춤형 영업 CRM</p>
          </div>
        </div>

        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>로그인</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>회원가입</button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {mode === "signup" && (
            <label>이름<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          )}
          <label>이메일<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>비밀번호<input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button className="button primary full" disabled={loading}>{loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}</button>
        </form>
        {message && <p className="notice">{message}</p>}
      </div>
    </div>
  );
}
