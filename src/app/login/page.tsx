"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dict, type Lang } from "../admin/translations";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ar");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as Lang | null;
    if (saved) setLang(saved);
  }, []);

  const t = (key: string) => dict[lang]?.[key] || dict.en[key] || key;

  function toggleLang() {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem("admin_lang", next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (r.ok) {
        localStorage.setItem("admin_token", d.token);
        localStorage.setItem("admin_user", d.username);
        router.push("/admin");
      } else {
        setError(d.error === "Invalid credentials" ? t("panel.wrong_pwd") : d.error || t("panel.save_failed"));
      }
    } catch { setError(t("panel.conn_err")); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-cyan-950">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t("panel.login")}</h1>
          <p className="text-white/60 text-sm">{t("panel.signin")}</p>
        </div>
        {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">{t("panel.username")}</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder={t("panel.username")} required />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">{t("panel.password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder={t("panel.password")} required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
            {loading ? t("panel.saving") : t("panel.login_btn")}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between">
          <a href="/" className="text-white/40 hover:text-white/60 text-xs transition-colors">{t("panel.back")}</a>
          <button onClick={toggleLang} className="text-xs text-white/40 hover:text-white/60 transition-colors">
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </div>
    </div>
  );
}
