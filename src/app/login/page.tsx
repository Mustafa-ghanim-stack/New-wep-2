"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Header, Footer } from "../page-content";

const dict: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome back!",
    subtitle: "Sign in to your account",
    email: "Email Address", password: "Password",
    login_btn: "Sign In", saving: "Signing in...",
    wrong_pwd: "Incorrect email or password",
    conn_err: "Connection error",
    no_account: "Need an account?", register: "Sign Up",
    back: "Back to website",
    forgot: "Forgot Password?",
    admin_username: "Username", admin_password: "Password",
    admin_btn: "Admin Sign In",
  },
  ar: {
    welcome: "مرحباً بعودتك!",
    subtitle: "سجّل دخولك إلى حسابك",
    email: "البريد الإلكتروني", password: "كلمة المرور",
    login_btn: "تسجيل الدخول", saving: "جارٍ...",
    wrong_pwd: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    conn_err: "خطأ في الاتصال",
    no_account: "ليس لديك حساب؟", register: "سجّل هنا",
    back: "العودة للموقع",
    forgot: "نسيت كلمة المرور؟",
    admin_username: "اسم المستخدم", admin_password: "كلمة المرور",
    admin_btn: "دخول المشرف",
  },
};

type Lang = "ar" | "en";

function mapNavChildren(children: any[], locale: string): any[] {
  return (children || []).map((child: any) => {
    if (typeof child === "string") return { label: child, href: "#" };
    const mapped: any = { label: child.label || "", href: child.href ? `/${locale}${child.href}` : "#" };
    if (child.children) mapped.children = mapNavChildren(child.children, locale);
    return mapped;
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang]       = useState<Lang>("ar");
  const [siteData, setSiteData] = useState<any>(null);

  // Main form
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Hidden admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [tapCount, setTapCount]   = useState(0);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Forgot password
  const [forgotStep, setForgotStep]       = useState<"idle"|"email"|"code"|"done">("idle");
  const [forgotEmail, setForgotEmail]     = useState("");
  const [forgotCode, setForgotCode]       = useState("");
  const [forgotNew, setForgotNew]         = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]     = useState("");
  const [showForgotNew, setShowForgotNew] = useState(false);
  const [showForgotCon, setShowForgotCon] = useState(false);

  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search).get("lang") as Lang | null;
    if (urlLang === "ar" || urlLang === "en") {
      setLang(urlLang); localStorage.setItem("admin_lang", urlLang);
    } else {
      const saved = localStorage.getItem("admin_lang") as Lang | null;
      if (saved) setLang(saved);
    }
    fetch("/api/site-data").then(r => r.json()).then(d => setSiteData(d)).catch(() => {});
  }, []);

  const t = (k: string) => dict[lang]?.[k] || dict.en[k] || k;
  const isRtl = lang === "ar";

  const toggleLang = () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next); localStorage.setItem("admin_lang", next);
  };

  const handleSecretTap = () => {
    const next = tapCount + 1;
    if (next >= 5) { setShowAdmin(true); setTapCount(0); }
    else setTapCount(next);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/auto-login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const d = await r.json();
      if (r.ok) {
        if (d.role === "student") {
          localStorage.setItem("student_token", d.token);
          localStorage.setItem("student_data", JSON.stringify(d.data));
          router.push("/student/panel");
        } else if (d.role === "professor") {
          localStorage.setItem("professor_token", d.token);
          localStorage.setItem("professor_data", JSON.stringify(d.data));
          router.push("/professor/panel");
        }
      } else {
        setError(d.error || t("wrong_pwd"));
      }
    } catch { setError(t("conn_err")); }
    setLoading(false);
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault(); setAdminError(""); setAdminLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });
      const d = await r.json();
      if (r.ok) {
        localStorage.setItem("admin_token", d.token);
        localStorage.setItem("admin_user", d.username);
        localStorage.setItem("admin_permissions", JSON.stringify(d.permissions || []));
        router.push("/admin");
      } else setAdminError(t("wrong_pwd"));
    } catch { setAdminError(t("conn_err")); }
    setAdminLoading(false);
  }

  async function sendForgotCode(e: React.FormEvent) {
    e.preventDefault(); setForgotError(""); setForgotLoading(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const d = await r.json();
      if (r.ok) setForgotStep("code");
      else setForgotError(d.error || t("conn_err"));
    } catch { setForgotError(t("conn_err")); }
    setForgotLoading(false);
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault(); setForgotError("");
    if (forgotNew !== forgotConfirm) {
      setForgotError(lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    setForgotLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword: forgotNew }),
      });
      const d = await r.json();
      if (r.ok) setForgotStep("done");
      else setForgotError(d.error || t("conn_err"));
    } catch { setForgotError(t("conn_err")); }
    setForgotLoading(false);
  }

  const locale   = lang;
  const messages = siteData?.[locale] || {};
  const nav = (messages.nav || [])
    .filter((item: any) => item.label !== "اتصل بنا" && item.label !== "Contact Us")
    .map((item: any) => ({
      label: item.label,
      href: item.href ? `/${locale}${item.href}` : "#",
      children: mapNavChildren(item.children || [], locale),
    }));
  const topbar = {
    english: messages.topbar?.english || "English",
    arabic:  messages.topbar?.arabic  || "عربي",
    login:   messages.topbar?.login   || (lang === "ar" ? "تسجيل الدخول" : "Login"),
  };
  const logoSettings = messages.logo || {};
  const searchLabel  = lang === "ar" ? "بحث" : "Search";
  const footerData   = messages.footer || {
    quicklinks: { title: "", items: [] }, certificates: { title: "", items: [] },
    contact: { title: "", address: "", phone: "", hours: "" },
    social_title: "", copyright: "", social: {},
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {siteData ? (
        <Header nav={nav} topbar={topbar} searchLabel={searchLabel} locale={locale} logoSettings={logoSettings} />
      ) : (
        <header style={{ background:"#0a7d8a" }}>
          <div style={{ height:36 }} /><div style={{ height:80 }} />
        </header>
      )}

      <div style={{ flex:1, background:"#f0f4f8", display:"flex", alignItems:"center", justifyContent:"center", padding:"8rem 1.5rem" }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
          @keyframes spinner-border { to { transform: rotate(360deg); } }
          .spinner-border { display:inline-block;width:2rem;height:2rem;vertical-align:-0.125em;border:.25em solid currentColor;border-right-color:transparent;border-radius:50%;animation:spinner-border .75s linear infinite; }
          .spinner-border-sm { width:1rem;height:1rem;border-width:.2em; }
          .lcard{background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.10);padding:2.25rem 2rem;width:100%;max-width:440px;font-family:'IBM Plex Sans Arabic','Segoe UI',sans-serif}
          .fl{position:relative;margin-bottom:1rem}
          .fl label{position:absolute;top:-0.52rem;${isRtl?"right:0.9rem":"left:0.9rem"};background:#fff;padding:0 0.3rem;font-size:0.75rem;color:#64748b;font-weight:600;z-index:1}
          .fi{width:100%;border:1.5px solid #cbd5e1;border-radius:10px;padding:0.8rem ${isRtl?"1rem":"2.75rem"} 0.8rem ${isRtl?"2.75rem":"1rem"};font-size:0.9rem;outline:none;transition:border .18s;font-family:inherit;background:#fff;box-sizing:border-box}
          .fi:focus{border-color:#0a7d8a;box-shadow:0 0 0 3px rgba(10,125,138,0.08)}
          .ie{position:absolute;top:50%;transform:translateY(-50%);${isRtl?"left:0.9rem":"right:0.9rem"};background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1rem;padding:0;line-height:1}
          .sbtn{width:100%;padding:0.85rem;background:linear-gradient(135deg,#0a7d8a,#0ea5b5);color:#fff;border:none;border-radius:50px;font-size:0.97rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:filter .18s,transform .1s}
          .sbtn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
          .sbtn:disabled{opacity:0.7;cursor:not-allowed}
          .err-box{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:0.6rem 0.9rem;margin-bottom:1rem;color:#dc2626;font-size:0.83rem;display:flex;align-items:center;gap:0.5rem}
        `}</style>

        <div className="lcard">

          {/* Back + lang */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <a href="/" style={{ color:"#94a3b8", fontSize:"0.8rem", textDecoration:"none", display:"flex", alignItems:"center", gap:"0.35rem" }}>
              <i className={`bi bi-arrow-${isRtl?"right":"left"}`}></i>{t("back")}
            </a>
            <button onClick={toggleLang}
              style={{ background:"none", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"0.25rem 0.6rem", fontSize:"0.78rem", cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
          </div>

          {/* Title */}
          <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#e6f0f0,#cde8eb)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.9rem", fontSize:"1.5rem", color:"#0a7d8a" }}>
              <i className="bi bi-person-fill"></i>
            </div>
            <h2 onClick={handleSecretTap} style={{ fontWeight:800, fontSize:"1.6rem", color:"#0f172a", marginBottom:"0.3rem", cursor:"default", userSelect:"none" }}>{t("welcome")}</h2>
            <p style={{ color:"#94a3b8", fontSize:"0.85rem", margin:0 }}>{t("subtitle")}</p>
          </div>

          {/* ── FORGOT PASSWORD FLOW ── */}
          {forgotStep !== "idle" ? (
            <div>
              <button type="button" onClick={() => { setForgotStep("idle"); setForgotError(""); }}
                style={{ background:"none", border:"none", color:"#64748b", fontSize:"0.82rem", cursor:"pointer", padding:"0 0 1rem", display:"flex", alignItems:"center", gap:"0.3rem", fontFamily:"inherit" }}>
                <i className={`bi bi-arrow-${isRtl?"right":"left"}`}></i>
                {lang==="ar"?"العودة لتسجيل الدخول":"Back to Login"}
              </button>

              {forgotStep === "email" && (
                <form onSubmit={sendForgotCode}>
                  <div style={{ textAlign:"center", marginBottom:"1.2rem" }}>
                    <div style={{ width:52, height:52, borderRadius:"50%", background:"#e6f0f0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.75rem", fontSize:"1.4rem", color:"#0a7d8a" }}>
                      <i className="bi bi-envelope-open-fill"></i>
                    </div>
                    <h3 style={{ fontWeight:800, fontSize:"1.05rem", color:"#0f172a", margin:"0 0 0.25rem" }}>{t("forgot")}</h3>
                    <p style={{ color:"#94a3b8", fontSize:"0.8rem", margin:0 }}>
                      {lang==="ar"?"أدخل بريدك وسنرسل لك رمز التحقق":"Enter your email and we'll send a code"}
                    </p>
                  </div>
                  <div className="fl">
                    <label>{t("email")} *</label>
                    <input className="fi" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="example@gmail.com" required />
                    <button type="button" className="ie" tabIndex={-1} style={{ cursor:"default" }}><i className="bi bi-envelope"></i></button>
                  </div>
                  {forgotError && <div className="err-box"><i className="bi bi-exclamation-circle-fill"></i>{forgotError}</div>}
                  <button type="submit" className="sbtn" disabled={forgotLoading} style={{ marginTop:"0.3rem" }}>
                    {forgotLoading ? <><span className="spinner-border spinner-border-sm"></span>{lang==="ar"?"جارٍ الإرسال...":"Sending..."}</> : <><i className="bi bi-send-fill"></i>{lang==="ar"?"إرسال الرمز":"Send Code"}</>}
                  </button>
                </form>
              )}

              {forgotStep === "code" && (
                <form onSubmit={submitReset}>
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"0.65rem 0.85rem", marginBottom:"1rem", fontSize:"0.8rem", color:"#15803d", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                    <i className="bi bi-check-circle-fill"></i>
                    {lang==="ar" ? `تم إرسال الرمز إلى ${forgotEmail}` : `Code sent to ${forgotEmail}`}
                  </div>
                  <div className="fl">
                    <label>{lang==="ar"?"رمز التحقق (6 أرقام)":"Verification Code (6 digits)"} *</label>
                    <input className="fi" type="text" inputMode="numeric" maxLength={6} value={forgotCode}
                      onChange={e => setForgotCode(e.target.value.replace(/\D/g,""))} required
                      style={{ textAlign:"center", letterSpacing:"0.5rem", fontSize:"1.2rem", fontWeight:700 }} />
                  </div>
                  <div className="fl" style={{ position:"relative" }}>
                    <label>{lang==="ar"?"كلمة المرور الجديدة":"New Password"} *</label>
                    <input className="fi" type={showForgotNew?"text":"password"} value={forgotNew} onChange={e => setForgotNew(e.target.value)} required minLength={4} />
                    <button type="button" className="ie" onClick={() => setShowForgotNew(p=>!p)}><i className={`bi bi-eye${showForgotNew?"-slash":""}`}></i></button>
                  </div>
                  <div className="fl" style={{ position:"relative" }}>
                    <label>{lang==="ar"?"تأكيد كلمة المرور":"Confirm Password"} *</label>
                    <input className="fi" type={showForgotCon?"text":"password"} value={forgotConfirm} onChange={e => setForgotConfirm(e.target.value)} required minLength={4} />
                    <button type="button" className="ie" onClick={() => setShowForgotCon(p=>!p)}><i className={`bi bi-eye${showForgotCon?"-slash":""}`}></i></button>
                  </div>
                  {forgotError && <div className="err-box"><i className="bi bi-exclamation-circle-fill"></i>{forgotError}</div>}
                  <button type="submit" className="sbtn" disabled={forgotLoading}>
                    {forgotLoading ? <><span className="spinner-border spinner-border-sm"></span>{lang==="ar"?"جارٍ...":"Processing..."}</> : <><i className="bi bi-shield-check"></i>{lang==="ar"?"تغيير كلمة المرور":"Reset Password"}</>}
                  </button>
                  <div style={{ textAlign:"center", marginTop:"0.75rem" }}>
                    <button type="button" onClick={() => { setForgotStep("email"); setForgotError(""); }}
                      style={{ background:"none", border:"none", color:"#0a7d8a", fontSize:"0.79rem", cursor:"pointer", fontFamily:"inherit" }}>
                      {lang==="ar"?"لم يصلني الرمز، أعد الإرسال":"Didn't receive? Resend"}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === "done" && (
                <div style={{ textAlign:"center", padding:"1rem 0" }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", fontSize:"1.8rem", color:"#16a34a" }}>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h3 style={{ fontWeight:800, fontSize:"1.05rem", color:"#0f172a", margin:"0 0 0.5rem" }}>
                    {lang==="ar"?"تم تغيير كلمة المرور!":"Password Changed!"}
                  </h3>
                  <p style={{ color:"#64748b", fontSize:"0.83rem", marginBottom:"1.5rem" }}>
                    {lang==="ar"?"يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة":"You can now sign in with your new password"}
                  </p>
                  <button type="button" className="sbtn" onClick={() => { setForgotStep("idle"); setForgotError(""); }}>
                    <i className="bi bi-box-arrow-in-right"></i>
                    {lang==="ar"?"تسجيل الدخول":"Sign In"}
                  </button>
                </div>
              )}
            </div>

          ) : showAdmin ? (
            /* ── HIDDEN ADMIN FORM ── */
            <div>
              <div style={{ background:"#fff8ee", border:"1px solid #fcd34d", borderRadius:10, padding:"0.6rem 0.9rem", marginBottom:"1rem", fontSize:"0.8rem", color:"#92400e", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <i className="bi bi-shield-lock-fill"></i>
                {lang==="ar"?"وضع المشرف":"Admin Mode"}
              </div>
              {adminError && <div className="err-box"><i className="bi bi-exclamation-circle-fill"></i>{adminError}</div>}
              <form onSubmit={handleAdminLogin}>
                <div className="fl">
                  <label>{t("admin_username")} *</label>
                  <input className="fi" type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} required />
                  <button type="button" className="ie" tabIndex={-1} style={{ cursor:"default" }}><i className="bi bi-person"></i></button>
                </div>
                <div className="fl">
                  <label>{t("admin_password")} *</label>
                  <input className="fi" type={showAdminPass?"text":"password"} value={adminPass} onChange={e => setAdminPass(e.target.value)} required />
                  <button type="button" className="ie" onClick={() => setShowAdminPass(p=>!p)}><i className={`bi bi-eye${showAdminPass?"-slash":""}`}></i></button>
                </div>
                <button type="submit" className="sbtn" style={{ background:"linear-gradient(135deg,#d97706,#f59e0b)" }} disabled={adminLoading}>
                  {adminLoading ? <><span className="spinner-border spinner-border-sm"></span>{lang==="ar"?"جارٍ...":"..."}</> : <><i className="bi bi-shield-check"></i>{t("admin_btn")}</>}
                </button>
              </form>
              <div style={{ textAlign:"center", marginTop:"0.9rem" }}>
                <button type="button" onClick={() => { setShowAdmin(false); setAdminError(""); }}
                  style={{ background:"none", border:"none", color:"#94a3b8", fontSize:"0.79rem", cursor:"pointer", fontFamily:"inherit" }}>
                  {lang==="ar"?"العودة لتسجيل الدخول العادي":"Back to normal login"}
                </button>
              </div>
            </div>

          ) : (
            /* ── MAIN UNIFIED FORM ── */
            <form onSubmit={handleLogin}>
              {error && <div className="err-box"><i className="bi bi-exclamation-circle-fill"></i>{error}</div>}
              <div className="fl">
                <label>{t("email")} *</label>
                <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" required autoComplete="email" />
                <button type="button" className="ie" tabIndex={-1} style={{ cursor:"default" }}><i className="bi bi-envelope"></i></button>
              </div>
              <div className="fl" style={{ marginBottom:"0.6rem" }}>
                <label>{t("password")} *</label>
                <input className="fi" type={showPass?"text":"password"} value={pass} onChange={e => setPass(e.target.value)} required autoComplete="current-password" />
                <button type="button" className="ie" onClick={() => setShowPass(p=>!p)}><i className={`bi bi-eye${showPass?"-slash":""}`}></i></button>
              </div>
              <div style={{ textAlign: isRtl?"left":"right", marginBottom:"1.3rem" }}>
                <button type="button" onClick={() => { setForgotEmail(email); setForgotStep("email"); setForgotError(""); }}
                  style={{ background:"none", border:"none", color:"#0a7d8a", fontSize:"0.82rem", fontWeight:500, cursor:"pointer", padding:0, fontFamily:"inherit" }}>
                  {t("forgot")}
                </button>
              </div>
              <button type="submit" className="sbtn" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm"></span>{t("saving")}</>
                  : <>{t("login_btn")} <i className={`bi bi-arrow-${isRtl?"left":"right"}`}></i></>}
              </button>
              <p style={{ textAlign:"center", fontSize:"0.84rem", color:"#94a3b8", marginTop:"1.25rem", marginBottom:0 }}>
                {t("no_account")}{" "}
                <a href="/register" style={{ color:"#0a7d8a", fontWeight:600, textDecoration:"none" }}>{t("register")}</a>
              </p>
            </form>
          )}

        </div>
      </div>

      {siteData && <Footer footerData={footerData} locale={locale} />}
    </div>
  );
}
