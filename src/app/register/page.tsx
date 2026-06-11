"use client";
import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Header, Footer } from "../page-content";

const dict: Record<string, Record<string, string>> = {
  en: {
    title: "Create Account",
    who: "WHO DO YOU WANT TO REGISTER AS?",
    teacher_label: "Professor",  teacher_sub: "Register now",
    student_label: "Student",   student_sub: "Apply now",
    name: "Full Name",
    phone: "Phone Number",
    phone_opt: "optional",
    email: "Email Address",
    department: "Desired Department",
    dept_opt: "optional",
    branch: "Branch",
    branch_opt: "optional",
    specialization: "Specialization",
    spec_opt: "optional",
    password: "Password",
    confirm: "Confirm Password",
    send_code: "Send Verification Code",
    verify_title: "Check your email",
    verify_sub: "We sent a 6-digit code to",
    code_label: "Verification Code",
    code_placeholder: "000000",
    verify_btn: "Verify & Complete",
    back_form: "← Go back",
    resend: "Resend code",
    resend_in: "Resend in {s}s",
    done_msg: "Your registration has been submitted! Awaiting approval from the college administration.",
    back_login: "← Back to Login",
    saving: "Please wait...",
    pass_mismatch: "Passwords do not match",
    pass_short: "Password must be at least 4 characters",
    fill_required: "Please fill all required fields",
    conn_err: "Connection error",
    verify_err: "Please enter the verification code",
    already: "Already have an account?",
    sign_in: "Sign In",
    soon: "Coming soon",
    back: "Back to website",
  },
  ar: {
    title: "إنشاء حساب جديد",
    who: "من أنت؟",
    teacher_label: "أستاذ",    teacher_sub: "سجّل الآن",
    student_label: "طالب",     student_sub: "سجّل الآن",
    name: "الاسم الكامل",
    phone: "رقم الهاتف",
    phone_opt: "اختياري",
    email: "البريد الإلكتروني",
    department: "القسم المطلوب",
    dept_opt: "اختياري",
    branch: "الفرع",
    branch_opt: "اختياري",
    specialization: "التخصص",
    spec_opt: "اختياري",
    password: "كلمة المرور",
    confirm: "تأكيد كلمة المرور",
    send_code: "إرسال رمز التحقق",
    verify_title: "تحقق من بريدك الإلكتروني",
    verify_sub: "أرسلنا رمز مكون من 6 أرقام إلى",
    code_label: "رمز التحقق",
    code_placeholder: "000000",
    verify_btn: "تحقق وأكمل التسجيل",
    back_form: "← رجوع",
    resend: "إعادة إرسال الرمز",
    resend_in: "أعد المحاولة بعد {s}ث",
    done_msg: "تم إرسال طلب التسجيل بنجاح! في انتظار موافقة إدارة الكلية.",
    back_login: "← العودة لتسجيل الدخول",
    saving: "جارٍ...",
    pass_mismatch: "كلمة المرور غير متطابقة",
    pass_short: "كلمة المرور يجب أن تكون 4 أحرف على الأقل",
    fill_required: "يرجى ملء جميع الحقول المطلوبة",
    conn_err: "خطأ في الاتصال",
    verify_err: "يرجى إدخال رمز التحقق",
    already: "لديك حساب بالفعل؟",
    sign_in: "تسجيل الدخول",
    soon: "قريباً",
    back: "العودة للموقع",
  },
};

const PRIMARY = "#0a7d8a";
const ACCENT  = "#f5a623";

const DEPARTMENTS: { ar: string; en: string }[] = [
  { ar: "قسم هندسة تقنيات الأمن السيبراني و الحوسبة السحابية", en: "Cybersecurity & Cloud Computing" },
  { ar: "قسم تقنيات البصريات",                                  en: "Optics Techniques" },
  { ar: "قسم هندسة تقنيات الفيزياء الصحية",                    en: "Health Physics & Radiotherapy" },
  { ar: "قسم تقنيات التخدير",                                   en: "Anesthesia Techniques" },
  { ar: "قسم طب الطوارئ والإسعافات الأولية",                   en: "Emergency & First Aid" },
  { ar: "قسم تقنيات صحة المجتمع",                               en: "Community Health Techniques" },
  { ar: "قسم هندسة تقنيات النفط والغاز",                       en: "Oil & Gas Engineering" },
  { ar: "قسم تقنيات صناعة الأسنان",                             en: "Dental Prosthetics" },
  { ar: "قسم هندسة تقنيات البناء والإنشاءات",                  en: "Construction Engineering" },
  { ar: "قسم تقنيات الاشعة والسونار",                          en: "Radiology & Sonar Techniques" },
];

const ROLES = [
  { key: "teacher", iconClass: "bi-person-video3", bg: "#fff3e0", color: "#e07b00",  selectedBorder: ACCENT,    selectedBg: "#fff8ee", checkBg: ACCENT    },
  { key: "student", iconClass: "bi-mortarboard",   bg: "#e8f5e9", color: "#2e7d32",  selectedBorder: "#43a047", selectedBg: "#e8f5e9", checkBg: "#43a047" },
] as const;

type Lang = "ar" | "en";
type Role = "teacher" | "student";
type Step = "form" | "verify" | "done";

function mapNavChildren(children: any[], locale: string): any[] {
  return (children || []).map((child: any) => {
    if (typeof child === "string") return { label: child, href: "#" };
    const mapped: any = { label: child.label || "", href: child.href ? `/${locale}${child.href}` : "#" };
    if (child.children) mapped.children = mapNavChildren(child.children, locale);
    return mapped;
  });
}

export default function RegisterPage() {
  const [lang, setLang]             = useState<Lang>("ar");
  const [role, setRole]             = useState<Role>("teacher");
  const [step, setStep]             = useState<Step>("form");
  const [fullName, setFullName]         = useState("");
  const [phone, setPhone]               = useState("");
  const [email, setEmail]               = useState("");
  const [department, setDepartment]     = useState("");
  const [branch, setBranch]             = useState("");
  const [specialization, setSpecializ]  = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPass, setConfirmPass]   = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [code, setCode]                 = useState("");
  const [timer, setTimer]           = useState(0);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [siteData, setSiteData]     = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as Lang | null;
    if (saved) setLang(saved);
    fetch("/api/site-data").then(r => r.json()).then(d => setSiteData(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const t = (k: string) => dict[lang]?.[k] || dict.en[k] || k;
  const isRtl = lang === "ar";
  const locale = lang;

  const toggleLang = () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem("admin_lang", next);
  };

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password) { setError(t("fill_required")); return; }
    if (password !== confirmPass)          { setError(t("pass_mismatch")); return; }
    if (password.length < 4)              { setError(t("pass_short"));    return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/send-verification-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, phone }),
      });
      const d = await r.json();
      if (r.ok) { setStep("verify"); setTimer(60); }
      else       setError(d.error || "Failed to send code");
    } catch { setError(t("conn_err")); }
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code || code.length < 4) { setError(t("verify_err")); return; }
    setLoading(true);
    try {
      const endpoint = role === "teacher"
        ? "/api/auth/verify-and-register-professor"
        : "/api/auth/verify-and-register";
      const body = role === "teacher"
        ? { email, code, fullName, phone, specialization, password }
        : { email, code, fullName, phone, department, branch, password };
      const r = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) setStep("done");
      else      setError(d.error || "Verification failed");
    } catch { setError(t("conn_err")); }
    setLoading(false);
  }

  async function handleResend() {
    setError(""); setTimer(60); setLoading(true);
    try {
      await fetch("/api/auth/send-verification-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, phone }),
      });
    } catch {}
    setLoading(false);
  }

  const selectedRole = ROLES.find(r => r.key === role)!;
  const messages     = siteData?.[locale] || {};

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
    <div dir={isRtl ? "rtl" : "ltr"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {siteData ? (
        <Header nav={nav} topbar={topbar} searchLabel={searchLabel} locale={locale} logoSettings={logoSettings} />
      ) : (
        <header style={{ background: "#1d494e" }}>
          <div style={{ height: 36 }} /><div style={{ height: 80 }} />
        </header>
      )}

      <div style={{ flex: 1, background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "8rem 1.5rem" }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
          @keyframes spinner-border { to { transform: rotate(360deg); } }
          .spinner-border { display:inline-block;width:2rem;height:2rem;vertical-align:-0.125em;border:.25em solid currentColor;border-right-color:transparent;border-radius:50%;animation:spinner-border .75s linear infinite; }
          .spinner-border-sm { width:1rem;height:1rem;border-width:.2em; }
          .lcard{background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.10);padding:2.25rem 2rem;width:100%;max-width:500px;font-family:'IBM Plex Sans Arabic','Segoe UI',sans-serif}
          .role-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;margin-bottom:1.75rem}
          .role-card{width:100px;border:2px solid #e8edf2;border-radius:14px;padding:0.85rem 0.4rem;cursor:pointer;text-align:center;transition:all .18s;background:#fafbfc;position:relative;flex-shrink:0}
          .role-card:hover{border-color:#a8c5c7;background:#e6f0f0}
          .check-dot{position:absolute;top:-9px;right:-9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center}
          .role-icon-wrap{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 0.45rem;font-size:1.3rem}
          .float-label{position:relative;margin-bottom:1rem}
          .float-label label{position:absolute;top:-0.52rem;${isRtl ? "right:0.9rem" : "left:0.9rem"};background:#fff;padding:0 0.3rem;font-size:0.75rem;color:#64748b;font-weight:600;z-index:1}
          .float-input{width:100%;border:1.5px solid #cbd5e1;border-radius:10px;padding:0.8rem ${isRtl ? "1rem" : "2.75rem"} 0.8rem ${isRtl ? "2.75rem" : "1rem"};font-size:0.9rem;outline:none;transition:border .18s;font-family:inherit;background:#fff}
          .float-input-bare{width:100%;border:1.5px solid #cbd5e1;border-radius:10px;padding:0.8rem 1rem;font-size:0.9rem;outline:none;transition:border .18s;font-family:inherit;background:#fff}
          .float-input:focus,.float-input-bare:focus{border-color:#0a7d8a;box-shadow:0 0 0 3px rgba(10,125,138,0.08)}
          .input-icon-end{position:absolute;top:50%;transform:translateY(-50%);${isRtl ? "left:0.9rem" : "right:0.9rem"};background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1rem;padding:0;line-height:1}
          .signin-btn{width:100%;padding:0.85rem;background:linear-gradient(135deg,#0a7d8a,#0ea5b5);color:#fff;border:none;border-radius:50px;font-size:0.97rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:filter .18s,transform .1s}
          .signin-btn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
          .signin-btn:disabled{opacity:0.7;cursor:not-allowed}
          .soon-badge{background:#f1f5f9;color:#94a3b8;font-size:0.62rem;border-radius:4px;padding:1px 5px;display:inline-block;margin-top:1px}
          .code-input{width:100%;border:1.5px solid #cbd5e1;border-radius:10px;padding:0.9rem 1rem;font-size:1.6rem;font-weight:700;letter-spacing:0.5rem;text-align:center;font-family:monospace;outline:none;transition:border .18s;background:#fff}
          .code-input:focus{border-color:#43a047;box-shadow:0 0 0 3px rgba(67,160,71,0.1)}
        `}</style>

        <div className="lcard">

          {/* Back to website */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <a href="/" style={{ color: "#94a3b8", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <i className={`bi bi-arrow-${isRtl ? "right" : "left"}`}></i>{t("back")}
            </a>
          </div>

          {/* Language toggle */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
            <button onClick={toggleLang}
              style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "0.28rem 0.65rem", fontSize: "0.78rem", cursor: "pointer", color: "#64748b", fontFamily: "inherit", transition: "all .18s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0a7d8a"; (e.currentTarget as HTMLButtonElement).style.color = "#1d494e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; }}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#0f172a", marginBottom: "0.3rem" }}>{t("title")}</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              {t("already")}{" "}
              <a href="/login" style={{ color: "#0a7d8a", fontWeight: 600, textDecoration: "none" }}>{t("sign_in")}</a>
            </p>
          </div>

          {step === "done" ? (
            /* ===== DONE ===== */
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: "2.2rem", color: "#43a047" }}></i>
              </div>
              <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                {isRtl ? "تم التسجيل بنجاح!" : "Registration Submitted!"}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "2rem", lineHeight: 1.6 }}>{t("done_msg")}</p>
              <a href="/login" style={{ color: "#0a7d8a", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600 }}>{t("back_login")}</a>
            </div>

          ) : step === "verify" ? (
            /* ===== VERIFY CODE ===== */
            <form onSubmit={handleVerify}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                  <i className="bi bi-envelope-check" style={{ fontSize: "1.5rem", color: "#43a047" }}></i>
                </div>
                <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>{t("verify_title")}</p>
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>{t("verify_sub")} <strong>{email}</strong></p>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.6rem 0.9rem", marginBottom: "1rem", color: "#dc2626", fontSize: "0.83rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="bi bi-exclamation-circle-fill"></i>{error}
                </div>
              )}

              <div className="float-label" style={{ marginBottom: "1.25rem" }}>
                <label>{t("code_label")}</label>
                <input className="code-input" type="text" value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t("code_placeholder")} maxLength={6} autoFocus />
              </div>

              <button type="submit" className="signin-btn" style={{ background: selectedRole.checkBg }} disabled={loading || code.length < 4}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm"></span>{t("saving")}</>
                  : <>{t("verify_btn")} <i className={`bi bi-arrow-${isRtl ? "left" : "right"}`}></i></>}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <button type="button" onClick={() => { setStep("form"); setCode(""); setError(""); }}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" }}>
                  {t("back_form")}
                </button>
                {timer > 0 ? (
                  <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{t("resend_in").replace("{s}", timer.toString())}</span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={loading}
                    style={{ background: "none", border: "none", color: "#0a7d8a", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
                    {t("resend")}
                  </button>
                )}
              </div>
            </form>

          ) : (
            /* ===== MAIN FORM ===== */
            <>
              {/* Role grid */}
              <div className="role-grid">
                {ROLES.map(r => {
                  const selected = role === r.key;
                  return (
                    <div key={r.key} className="role-card"
                      style={selected ? { borderColor: r.selectedBorder, background: r.selectedBg } : {}}
                      onClick={() => { setRole(r.key as Role); setError(""); }}>
                      {selected && (
                        <div className="check-dot" style={{ background: r.checkBg }}>
                          <i className="bi bi-check-lg" style={{ color: "#fff", fontSize: "0.7rem" }}></i>
                        </div>
                      )}
                      <div className="role-icon-wrap" style={{ background: r.bg }}>
                        <i className={`bi ${r.iconClass}`} style={{ color: r.color }}></i>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", lineHeight: 1.2 }}>
                        {t(`${r.key}_label`)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.6rem 0.9rem", marginBottom: "1rem", color: "#dc2626", fontSize: "0.83rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="bi bi-exclamation-circle-fill"></i>{error}
                </div>
              )}

              {/* Student form */}
              {role === "student" && (
                <form onSubmit={handleSendCode}>
                  <div className="float-label">
                    <label>{t("name")} *</label>
                    <input className="float-input-bare" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="float-label">
                    <label>{t("email")} *</label>
                    <div style={{ position: "relative" }}>
                      <input className="float-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" required />
                      <span className="input-icon-end" style={{ cursor: "default" }}>
                        <i className="bi bi-envelope"></i>
                      </span>
                    </div>
                  </div>
                  <div className="float-label">
                    <label>{t("phone")} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({t("phone_opt")})</span></label>
                    <input className="float-input-bare" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="float-label">
                    <label>{t("department")} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({t("dept_opt")})</span></label>
                    <select className="float-input-bare" value={department} onChange={e => setDepartment(e.target.value)}
                      style={{ appearance: "none", WebkitAppearance: "none", cursor: "pointer", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%2394a3b8' d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: isRtl ? "0.75rem center" : "calc(100% - 0.75rem) center" }}>
                      <option value="">{lang === "ar" ? "— اختر القسم —" : "— Select Department —"}</option>
                      {DEPARTMENTS.map((d, i) => (
                        <option key={i} value={d.ar}>{lang === "ar" ? d.ar : d.en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="float-label">
                    <label>{t("branch")} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({t("branch_opt")})</span></label>
                    <select className="float-input-bare" value={branch} onChange={e => setBranch(e.target.value)}
                      style={{ appearance: "none", WebkitAppearance: "none", cursor: "pointer", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%2394a3b8' d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: isRtl ? "0.75rem center" : "calc(100% - 0.75rem) center" }}>
                      <option value="">{lang === "ar" ? "— اختر الدراسة —" : "— Select Study —"}</option>
                      <option value="الصباحي">{lang === "ar" ? "الصباحي" : "Morning"}</option>
                      <option value="المسائي">{lang === "ar" ? "المسائي" : "Evening"}</option>
                    </select>
                  </div>
                  <div className="float-label">
                    <label>{t("password")} *</label>
                    <div style={{ position: "relative" }}>
                      <input className="float-input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="input-icon-end" onClick={() => setShowPass(p => !p)}>
                        <i className={`bi bi-eye${showPass ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="float-label" style={{ marginBottom: "1.4rem" }}>
                    <label>{t("confirm")} *</label>
                    <div style={{ position: "relative" }}>
                      <input className="float-input" type={showConfirm ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                      <button type="button" className="input-icon-end" onClick={() => setShowConfirm(p => !p)}>
                        <i className={`bi bi-eye${showConfirm ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="signin-btn" style={{ background: selectedRole.checkBg }} disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm"></span>{t("saving")}</>
                      : <>{t("send_code")} <i className={`bi bi-arrow-${isRtl ? "left" : "right"}`}></i></>}
                  </button>
                </form>
              )}

              {/* Professor form */}
              {role === "teacher" && (
                <form onSubmit={handleSendCode}>
                  <div className="float-label">
                    <label>{t("name")} *</label>
                    <input className="float-input-bare" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="float-label">
                    <label>{t("email")} *</label>
                    <div style={{ position: "relative" }}>
                      <input className="float-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" required />
                      <span className="input-icon-end" style={{ cursor: "default" }}>
                        <i className="bi bi-envelope"></i>
                      </span>
                    </div>
                  </div>
                  <div className="float-label">
                    <label>{t("phone")} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({t("phone_opt")})</span></label>
                    <input className="float-input-bare" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="float-label">
                    <label>{t("specialization")} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({t("spec_opt")})</span></label>
                    <input className="float-input-bare" type="text" value={specialization} onChange={e => setSpecializ(e.target.value)} />
                  </div>
                  <div className="float-label">
                    <label>{t("password")} *</label>
                    <div style={{ position: "relative" }}>
                      <input className="float-input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="input-icon-end" onClick={() => setShowPass(p => !p)}>
                        <i className={`bi bi-eye${showPass ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="float-label" style={{ marginBottom: "1.4rem" }}>
                    <label>{t("confirm")} *</label>
                    <div style={{ position: "relative" }}>
                      <input className="float-input" type={showConfirm ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                      <button type="button" className="input-icon-end" onClick={() => setShowConfirm(p => !p)}>
                        <i className={`bi bi-eye${showConfirm ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="signin-btn" style={{ background: selectedRole.checkBg }} disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm"></span>{t("saving")}</>
                      : <>{t("send_code")} <i className={`bi bi-arrow-${isRtl ? "left" : "right"}`}></i></>}
                  </button>
                </form>
              )}

            </>
          )}

        </div>
      </div>

      {siteData && <Footer footerData={footerData} locale={locale} />}

    </div>
  );
}
