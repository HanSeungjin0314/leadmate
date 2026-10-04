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
      else setMessage("회원가입이 완료되었습니다. 이메일 확인이 켜져 있다면 인증 후 로그인하세요.");
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
          <div className="brand-mark">LM</div>
          <div>
            <h1>LeadMate <span className="version-inline">{APP_VERSION}</span></h1>
            <p>광고 DB부터 재연락·방문·계약까지 놓치지 않게 관리하세요.</p>
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
