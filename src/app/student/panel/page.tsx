"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Header, Footer } from "../../page-content";

interface StudentInfo {
  id: string; fullName: string; email: string; phone: string;
  department: string; branch: string; status: string; createdAt: string;
}
interface AttRecord {
  lessonId: string; lessonTitle: string; lessonDate: string;
  status: "present" | "absent" | "late"; recordedAt: string; professorId: string;
}
interface WarningRecord {
  id: string; studentId: string; type: string; message: string;
  date: string; isRead: boolean; severity: "high" | "medium" | "low";
}

function mapNavChildren(children: any[], locale: string): any[] {
  return (children || []).map((child: any) => {
    if (typeof child === "string") return { label: child, href: "#" };
    const mapped: any = { label: child.label || "", href: child.href ? `/${locale}${child.href}` : "#" };
    if (child.children) mapped.children = mapNavChildren(child.children, locale);
    return mapped;
  });
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; ar: string; en: string; msgAr: string; msgEn: string }> = {
  pending:  { color: "#d97706", bg: "#fffbeb", icon: "bi-hourglass-split",   ar: "قيد الانتظار", en: "Pending",  msgAr: "طلبك قيد انتظار مراجعة إدارة الكلية.", msgEn: "Your application is under review." },
  approved: { color: "#16a34a", bg: "#f0fdf4", icon: "bi-check-circle-fill", ar: "مقبول",        en: "Approved", msgAr: "مبروك! تم قبول طلبك.", msgEn: "Congratulations! Your registration has been approved." },
  rejected: { color: "#dc2626", bg: "#fef2f2", icon: "bi-x-circle-fill",     ar: "مرفوض",        en: "Rejected", msgAr: "تم رفض طلبك. يرجى التواصل مع الإدارة.", msgEn: "Your request was rejected. Please contact the administration." },
};

const ATT_STYLE: Record<string, { color: string; bg: string; ar: string; en: string; icon: string }> = {
  present: { color: "#16a34a", bg: "#dcfce7", ar: "حاضر",  en: "Present", icon: "bi-check-circle-fill" },
  absent:  { color: "#dc2626", bg: "#fee2e2", ar: "غائب",  en: "Absent",  icon: "bi-x-circle-fill" },
  late:    { color: "#d97706", bg: "#fef3c7", ar: "متأخر", en: "Late",    icon: "bi-clock-fill" },
};

type Tab = "home" | "attendance" | "warnings" | "settings";

export default function StudentPanel() {
  const router = useRouter();
  const [student, setStudent]       = useState<StudentInfo | null>(null);
  const [token, setToken]           = useState("");
  const [lang, setLang]             = useState<"ar" | "en">("ar");
  const [siteData, setSiteData]     = useState<any>(null);
  const [tab, setTab]               = useState<Tab>("home");
  const [attRecords, setAttRecords] = useState<AttRecord[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [payment, setPayment]       = useState<any>(null);
  const [warnings, setWarnings]       = useState<WarningRecord[]>([]);
  const [warnLoading, setWarnLoading] = useState(false);
  const [avatar, setAvatar]           = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMsg, setAvatarMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwForm, setPwForm]           = useState({ current: "", newPass: "", confirm: "" });
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwMsg, setPwMsg]             = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showCurPw, setShowCurPw]     = useState(false);
  const [showNewPw, setShowNewPw]     = useState(false);
  const [showConPw, setShowConPw]     = useState(false);

  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search).get("lang") as "ar" | "en" | null;
    if (urlLang === "ar" || urlLang === "en") {
      setLang(urlLang);
      localStorage.setItem("admin_lang", urlLang);
    } else {
      const saved = localStorage.getItem("admin_lang") as "ar" | "en" | null;
      if (saved) setLang(saved);
    }
    const raw = localStorage.getItem("student_data");
    const tok = localStorage.getItem("student_token") || sessionStorage.getItem("student_token") || "";
    if (!raw) { router.replace("/login"); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.fullName && parsed.name) parsed.fullName = parsed.name;
      setStudent(parsed);
      setToken(tok);
      if (tok) {
        fetch(`/api/student/payments?token=${encodeURIComponent(tok)}`)
          .then(r => r.json()).then(d => { if (d.payment) setPayment(d.payment); }).catch(() => {});
        fetch(`/api/student/warnings?token=${encodeURIComponent(tok)}`)
          .then(r => r.json()).then(d => { if (d.warnings) setWarnings(d.warnings); }).catch(() => {});
        fetch(`/api/student/avatar?token=${encodeURIComponent(tok)}`)
          .then(r => r.json()).then(d => { if (d.avatar) setAvatar(d.avatar); }).catch(() => {});
      }
    } catch { router.replace("/login"); }
    fetch("/api/site-data").then(r => r.json()).then(d => setSiteData(d)).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (tab === "attendance" && token && attRecords.length === 0) {
      setAttLoading(true);
      fetch(`/api/student/attendance?token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(d => { if (d.attendance) setAttRecords(d.attendance); })
        .finally(() => setAttLoading(false));
    }
    if (tab === "warnings" && token && warnings.length === 0) {
      setWarnLoading(true);
      fetch(`/api/student/warnings?token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(d => { if (d.warnings) setWarnings(d.warnings); })
        .finally(() => setWarnLoading(false));
    }
  }, [tab, token, attRecords.length, warnings.length]);

  const toggleLang = () => {
    const next: "ar" | "en" = lang === "ar" ? "en" : "ar";
    setLang(next); localStorage.setItem("admin_lang", next);
  };
  function handleLogout() {
    localStorage.removeItem("student_token"); localStorage.removeItem("student_data");
    sessionStorage.removeItem("student_token"); sessionStorage.removeItem("student_data");
    window.location.href = "/login";
  }

  const isRtl    = lang === "ar";
  const locale   = lang;
  const messages = siteData?.[locale] || {};
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const nav = (messages.nav || [])
    .filter((item: any) => item.label !== "اتصل بنا" && item.label !== "Contact Us")
    .map((item: any) => ({ label: item.label, href: item.href ? `/${locale}${item.href}` : "#", children: mapNavChildren(item.children || [], locale) }));

  const topbar     = { english: messages.topbar?.english || "English", arabic: messages.topbar?.arabic || "عربي", login: messages.topbar?.login || (lang === "ar" ? "تسجيل الدخول" : "Login") };
  const logoSettings = messages.logo || {};
  const footerData   = messages.footer || { quicklinks: { title: "", items: [] }, certificates: { title: "", items: [] }, contact: { title: "", address: "", phone: "", hours: "" }, social_title: "", copyright: "", social: {} };

  if (!student) return null;

  const status   = STATUS_CONFIG[student.status] || STATUS_CONFIG.pending;
  const initials = (student.fullName || "?").trim().split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";

  const sorted    = [...attRecords].sort((a, b) => b.lessonDate.localeCompare(a.lessonDate));
  const present   = attRecords.filter(r => r.status === "present").length;
  const absent    = attRecords.filter(r => r.status === "absent").length;
  const late      = attRecords.filter(r => r.status === "late").length;
  const total     = attRecords.length;
  const rate      = total > 0 ? Math.round((present / total) * 100) : null;
  const rateColor = rate === null ? "#94a3b8" : rate >= 75 ? "#16a34a" : rate >= 50 ? "#d97706" : "#dc2626";

  const unreadWarnings = warnings.filter(w => !w.isRead).length;

  async function uploadAvatar() {
    if (!avatarFile || !token) return;
    setAvatarSaving(true); setAvatarMsg(null);
    try {
      const fd = new FormData();
      fd.append("image", avatarFile);
      const res  = await fetch(`/api/student/avatar?token=${encodeURIComponent(token)}`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        setAvatar(data.avatar + "?v=" + Date.now());
        setAvatarPreview(null); setAvatarFile(null);
        setAvatarMsg({ type: "ok", text: t("تم رفع الصورة بنجاح!","Avatar uploaded successfully!") });
      } else {
        setAvatarMsg({ type: "err", text: data.error || t("حدث خطأ","Error") });
      }
    } catch {
      setAvatarMsg({ type: "err", text: t("فشل الاتصال بالخادم","Connection failed") });
    } finally { setAvatarSaving(false); }
  }

  async function removeAvatar() {
    if (!token) return;
    setAvatarSaving(true); setAvatarMsg(null);
    try {
      await fetch(`/api/student/avatar?token=${encodeURIComponent(token)}`, { method: "DELETE" });
      setAvatar(null); setAvatarPreview(null); setAvatarFile(null);
      setAvatarMsg({ type: "ok", text: t("تم حذف الصورة","Avatar removed") });
    } finally { setAvatarSaving(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPwMsg(null);
    if (pwForm.newPass !== pwForm.confirm) {
      setPwMsg({ type: "err", text: t("كلمة المرور الجديدة وتأكيدها غير متطابقتين","New passwords do not match") });
      return;
    }
    setPwSaving(true);
    try {
      const r = await fetch("/api/student/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, currentPassword: pwForm.current, newPassword: pwForm.newPass }),
      });
      const d = await r.json();
      if (r.ok) {
        setPwMsg({ type: "ok", text: t("تم تغيير كلمة المرور بنجاح","Password changed successfully") });
        setPwForm({ current: "", newPass: "", confirm: "" });
      } else {
        setPwMsg({ type: "err", text: d.error || t("حدث خطأ","An error occurred") });
      }
    } catch { setPwMsg({ type: "err", text: t("خطأ في الاتصال","Connection error") }); }
    setPwSaving(false);
  }

  const TABS = [
    { id: "home" as Tab,       labelAr: "الرئيسية",  labelEn: "Home",       icon: "bi-house-fill" },
    { id: "attendance" as Tab, labelAr: "حضوري",     labelEn: "Attendance", icon: "bi-clipboard-check-fill" },
    { id: "warnings" as Tab,   labelAr: "الإنذارات", labelEn: "Warnings",   icon: "bi-exclamation-triangle-fill" },
    { id: "settings" as Tab,   labelAr: "الإعدادات", labelEn: "Settings",   icon: "bi-gear-fill" },
  ];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>

      {siteData ? (
        <Header nav={nav} topbar={topbar} searchLabel={t("بحث", "Search")} locale={locale} logoSettings={logoSettings} />
      ) : (
        <header style={{ background: "#0a7d8a" }}><div style={{ height: 36 }} /><div style={{ height: 80 }} /></header>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .panel-body { font-family: 'IBM Plex Sans Arabic','Segoe UI',sans-serif; flex: 1; padding: 4rem 2rem 16rem; }
        .pcard { background: #fff; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
        .info-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem; }
        .info-row span:first-child { min-width: 70px; color: #94a3b8; font-weight: 600; flex-shrink: 0; }
        .info-row:last-child { border-bottom: none; }
        .tab-btn { border: none; background: none; padding: 0.6rem 1rem; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s, color 0.15s; }
        .tab-btn:hover { background: #f1f5f9; color: #0a7d8a; }
        .tab-btn.active { background: #0a7d8a; color: #fff; }
        .tbl-header { display: grid; font-weight: 700; font-size: 0.74rem; color: #94a3b8; background: #f8fafc; padding: 0.5rem 1rem; }
        .tbl-row { display: grid; align-items: center; padding: 0.65rem 1rem; border-bottom: 1px solid #f8fafc; font-size: 0.83rem; }
        .tbl-row:last-child { border-bottom: none; }
        .badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.18rem 0.55rem; border-radius: 6px; font-size: 0.73rem; font-weight: 700; }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="panel-body">
        <div style={{ maxWidth: 1900, margin: "0 auto", width: "100%" }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem", flexWrap: "wrap", gap: "0.6rem" }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", margin: 0 }}>{t("لوحة الطالب", "Student Dashboard")}</h1>
              <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.15rem 0 0" }}>{t("مرحباً،", "Welcome,")} {student.fullName}</p>
            </div>
            <div style={{ display: "flex", gap: "0.45rem" }}>
              <button onClick={toggleLang} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.78rem", cursor: "pointer", color: "#475569", fontFamily: "inherit", fontWeight: 600 }}>
                {lang === "ar" ? "EN" : "ع"}
              </button>
              <button onClick={handleLogout} style={{ background: "#fef2f2", border: "none", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.78rem", cursor: "pointer", color: "#dc2626", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}>
                <i className="bi bi-box-arrow-right"></i>{t("خروج", "Logout")}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="pcard" style={{ display: "flex", gap: "0.25rem", padding: "0.45rem 0.6rem", marginBottom: "1.1rem" }}>
            {TABS.map(tb => (
              <button key={tb.id} className={`tab-btn${tab === tb.id ? " active" : ""}`} onClick={() => setTab(tb.id)}>
                <i className={`bi ${tb.icon}`} style={{ fontSize: "0.9rem" }}></i>
                {lang === "ar" ? tb.labelAr : tb.labelEn}
                {tb.id === "attendance" && total > 0 && (
                  <span style={{ background: tab === "attendance" ? "rgba(255,255,255,0.25)" : "#e2e8f0", borderRadius: 20, padding: "0.05rem 0.45rem", fontSize: "0.7rem" }}>{total}</span>
                )}
                {tb.id === "warnings" && warnings.length > 0 && (
                  <span style={{ background: unreadWarnings > 0 ? (tab === "warnings" ? "rgba(255,255,255,0.3)" : "#fee2e2") : (tab === "warnings" ? "rgba(255,255,255,0.25)" : "#e2e8f0"), color: unreadWarnings > 0 && tab !== "warnings" ? "#dc2626" : "inherit", borderRadius: 20, padding: "0.05rem 0.45rem", fontSize: "0.7rem", fontWeight: 700 }}>{warnings.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ═══ HOME TAB ═══ */}
          {tab === "home" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Warnings alert banner */}
              {unreadWarnings > 0 && (
                <div className="pcard" style={{ padding: "0.85rem 1.25rem", borderInlineStart: "4px solid #dc2626", background: "#fef2f2", display: "flex", alignItems: "center", gap: "0.9rem", cursor: "pointer" }} onClick={() => setTab("warnings")}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "1.3rem", color: "#dc2626", flexShrink: 0 }}></i>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#dc2626", fontSize: "0.88rem", marginBottom: "0.1rem" }}>
                      {t(`لديك ${unreadWarnings} إنذار${unreadWarnings > 1 ? "ات" : ""} غير مقروء${unreadWarnings > 1 ? "ة" : ""}`, `You have ${unreadWarnings} unread warning${unreadWarnings > 1 ? "s" : ""}`)}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#b91c1c" }}>{t("انقر هنا لعرض التفاصيل", "Click here to view details")}</div>
                  </div>
                  <i className="bi bi-chevron-left" style={{ color: "#dc2626", fontSize: "0.85rem" }}></i>
                </div>
              )}

              {/* Status banner */}
              <div className="pcard" style={{ padding: "1rem 1.25rem", borderInlineStart: `4px solid ${status.color}`, background: status.bg, display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <i className={`bi ${status.icon}`} style={{ fontSize: "1.4rem", color: status.color, flexShrink: 0 }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{t("حالة التسجيل:", "Registration Status:")}</span>
                    <span style={{ fontWeight: 700, color: status.color, fontSize: "0.82rem", background: "#fff", padding: "0.1rem 0.5rem", borderRadius: 5, border: `1px solid ${status.color}` }}>
                      {lang === "ar" ? status.ar : status.en}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>{lang === "ar" ? status.msgAr : status.msgEn}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1rem" }}>
                {/* Profile */}
                <div className="pcard" style={{ padding: "1.5rem 1.25rem", textAlign: "center" }}>
                  <div style={{ position: "relative", width: 68, height: 68, margin: "0 auto 0.85rem", cursor: "pointer" }} onClick={() => setTab("settings")} title={t("تغيير الصورة الشخصية","Change profile picture")}>
                    {avatar ? (
                      <img src={avatar} alt="avatar" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "3px solid #e2e8f0" }} />
                    ) : (
                      <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d32,#43a047)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                        {initials}
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, insetInlineEnd: 0, width: 22, height: 22, background: "#0a7d8a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                      <i className="bi bi-camera-fill" style={{ fontSize: "0.6rem", color: "#fff" }}></i>
                    </div>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", margin: "0 0 0.2rem" }}>{student.fullName}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.74rem", margin: "0 0 0.9rem" }}>{student.email}</p>
                  <div style={{ background: "#f8fafc", borderRadius: 8, padding: "0.45rem 0.75rem", fontSize: "0.74rem", color: "#64748b" }}>
                    <i className="bi bi-calendar3" style={{ marginInlineEnd: "0.35rem", color: "#2e7d32" }}></i>
                    {t("التسجيل:", "Joined:")} {new Date(student.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>

                {/* Info */}
                <div className="pcard" style={{ padding: "1.25rem" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.9rem", paddingBottom: "0.6rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <i className="bi bi-person-lines-fill" style={{ color: "#0a7d8a" }}></i>
                    {t("المعلومات الشخصية", "Personal Information")}
                  </h4>
                  <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("الاسم", "Name")}</span><span style={{ fontWeight: 600, color: "#1e293b" }}>{student.fullName}</span></div>
                  <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("البريد", "Email")}</span><span style={{ color: "#475569" }}>{student.email}</span></div>
                  {student.phone && <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("الهاتف", "Phone")}</span><span style={{ color: "#475569" }}>{student.phone}</span></div>}
                  {student.department && <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("القسم", "Department")}</span><span style={{ color: "#475569", fontSize: "0.82rem" }}>{student.department}</span></div>}
                  {student.branch && <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("الدراسة", "Study")}</span><span style={{ color: "#475569" }}>{student.branch}</span></div>}

                  {/* Quick attendance preview */}
                  {total > 0 && (
                    <div style={{ marginTop: "1rem", padding: "0.75rem 0.9rem", background: "#f8fafc", borderRadius: 10, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{t("نسبة حضوري:", "My Attendance:")}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem", color: rateColor }}>{rate}%</span>
                        <button onClick={() => setTab("attendance")} style={{ background: "#0a7d8a", color: "#fff", border: "none", borderRadius: 7, padding: "0.25rem 0.7rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                          {t("التفاصيل", "Details")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Payments section ── */}
              <div className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="bi bi-cash-coin" style={{ color: "#16a34a", fontSize: "1rem" }}></i>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0 }}>{t("معلومات الأقساط", "Tuition Installments")}</h4>
                </div>

                {!payment ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                    <i className="bi bi-cash-coin" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.4rem", color: "#cbd5e1" }}></i>
                    {t("لم يتم إدخال بيانات الأقساط بعد", "No payment data entered yet")}
                  </div>
                ) : (() => {
                  const total  = payment.totalFee as number;
                  const paid   = payment.installments.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);
                  const remaining = total - paid;
                  const pct    = total > 0 ? Math.round((paid / total) * 100) : 0;
                  const fmt    = (n: number) => n.toLocaleString("en-US") + " " + (payment.currency || "IQD");
                  const INST_STYLE: Record<string, { color: string; bg: string; icon: string; ar: string; en: string }> = {
                    paid:    { color: "#16a34a", bg: "#dcfce7", icon: "bi-check-circle-fill", ar: "مدفوع",   en: "Paid" },
                    pending: { color: "#d97706", bg: "#fef3c7", icon: "bi-hourglass-split",   ar: "متبقي",   en: "Pending" },
                    overdue: { color: "#dc2626", bg: "#fee2e2", icon: "bi-exclamation-circle-fill", ar: "متأخر", en: "Overdue" },
                  };
                  return (
                    <>
                      {/* Summary cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", padding: "1rem 1.25rem" }}>
                        {[
                          { icon: "bi-receipt",           color: "#7c3aed", bg: "#f5f3ff", value: fmt(total),     labelAr: "إجمالي القسط",    labelEn: "Total Fee" },
                          { icon: "bi-check-circle-fill", color: "#16a34a", bg: "#dcfce7", value: fmt(paid),      labelAr: "المدفوع",         labelEn: "Paid" },
                          { icon: "bi-clock-history",     color: remaining > 0 ? "#dc2626" : "#16a34a", bg: remaining > 0 ? "#fee2e2" : "#dcfce7", value: fmt(remaining), labelAr: "المتبقي", labelEn: "Remaining" },
                        ].map((s, i) => (
                          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
                            <i className={`bi ${s.icon}`} style={{ fontSize: "1.1rem", color: s.color, flexShrink: 0 }}></i>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a", lineHeight: 1.2 }}>{s.value}</div>
                              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.15rem" }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div style={{ padding: "0 1.25rem 0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                          <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>{t("نسبة السداد:", "Payment progress:")}</span>
                          <span style={{ fontWeight: 800, color: pct === 100 ? "#16a34a" : "#d97706", fontSize: "0.9rem" }}>{pct}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "#e2e8f0" }}>
                          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: pct === 100 ? "#16a34a" : "#d97706", transition: "width 0.4s" }}></div>
                        </div>
                      </div>

                      {/* Installments table */}
                      <div style={{ borderTop: "1px solid #f1f5f9" }}>
                        {payment.installments.map((inst: any, idx: number) => {
                          const st = INST_STYLE[inst.status] || INST_STYLE.pending;
                          return (
                            <div key={inst.id || idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.25rem", borderBottom: "1px solid #f8fafc", background: inst.status === "overdue" ? "#fff8f8" : "#fff" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <i className={`bi ${st.icon}`} style={{ fontSize: "0.75rem", color: st.color }}></i>
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{inst.label}</span>
                                {inst.dueDate && <span style={{ fontSize: "0.73rem", color: "#94a3b8", marginInlineStart: "0.5rem" }}>{t("الاستحقاق:", "Due:")} {inst.dueDate}</span>}
                              </div>
                              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.87rem" }}>{fmt(inst.amount)}</span>
                              <span style={{ background: st.bg, color: st.color, padding: "0.15rem 0.6rem", borderRadius: 6, fontSize: "0.73rem", fontWeight: 700, flexShrink: 0 }}>
                                {lang === "ar" ? st.ar : st.en}
                                {inst.paidDate && inst.status === "paid" && <span style={{ fontWeight: 400, marginInlineStart: "0.3rem" }}>({inst.paidDate})</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>
          )}

          {/* ═══ WARNINGS TAB ═══ */}
          {tab === "warnings" && (() => {
            const WARN_SEV: Record<string, { color: string; bg: string; border: string; icon: string; ar: string }> = {
              high:   { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: "bi-exclamation-triangle-fill", ar: "عالي" },
              medium: { color: "#d97706", bg: "#fffbeb", border: "#fcd34d", icon: "bi-exclamation-circle-fill",   ar: "متوسط" },
              low:    { color: "#0a7d8a", bg: "#f0fdfa", border: "#99f6e4", icon: "bi-info-circle-fill",           ar: "منخفض" },
            };
            const WARN_TYPE: Record<string, { color: string; bg: string }> = {
              "غياب":    { color: "#dc2626", bg: "#fee2e2" },
              "أكاديمي": { color: "#7c3aed", bg: "#f5f3ff" },
              "سلوك":    { color: "#d97706", bg: "#fef3c7" },
              "تأخر":    { color: "#0369a1", bg: "#e0f2fe" },
              "أقساط":   { color: "#16a34a", bg: "#dcfce7" },
            };
            const highCount   = warnings.filter(w => w.severity === "high").length;
            const medCount    = warnings.filter(w => w.severity === "medium").length;
            const unread      = warnings.filter(w => !w.isRead).length;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Summary cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.85rem" }}>
                  {[
                    { icon: "bi-bell-fill",                  color: "#7c3aed", bg: "#f5f3ff", value: warnings.length, labelAr: "إجمالي الإنذارات", labelEn: "Total Warnings" },
                    { icon: "bi-exclamation-triangle-fill",  color: "#dc2626", bg: "#fee2e2", value: highCount,        labelAr: "عالية الخطورة",     labelEn: "High Severity" },
                    { icon: "bi-exclamation-circle-fill",    color: "#d97706", bg: "#fef3c7", value: medCount,         labelAr: "متوسطة الخطورة",    labelEn: "Medium Severity" },
                    { icon: "bi-envelope-fill",              color: "#0a7d8a", bg: "#e6f7f8", value: unread,           labelAr: "غير مقروءة",         labelEn: "Unread" },
                  ].map((s, i) => (
                    <div key={i} className="pcard" style={{ padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`bi ${s.icon}`} style={{ fontSize: "1rem", color: s.color }}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.15rem" }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warnings list */}
                <div className="pcard" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <i className="bi bi-bell-fill" style={{ color: "#d97706" }}></i>
                      {t("قائمة الإنذارات", "Warnings List")}
                      {warnings.length > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 20, padding: "0.05rem 0.55rem", fontSize: "0.74rem" }}>{warnings.length}</span>}
                    </h4>
                    {unread > 0 && (
                      <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700, background: "#fee2e2", padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                        {unread} {t("غير مقروء", "unread")}
                      </span>
                    )}
                  </div>

                  {warnLoading ? (
                    <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                      <i className="bi bi-arrow-repeat spinner" style={{ fontSize: "1.6rem" }}></i>
                    </div>
                  ) : warnings.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                      <i className="bi bi-check-circle-fill" style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.6rem", color: "#86efac" }}></i>
                      <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#16a34a", margin: "0 0 0.25rem" }}>{t("لا توجد إنذارات", "No Warnings")}</p>
                      <p style={{ fontSize: "0.8rem", margin: 0 }}>{t("سجلك نظيف، واصل الأداء الجيد!", "Your record is clean, keep up the good work!")}</p>
                    </div>
                  ) : (
                    <div>
                      {warnings.map((w, idx) => {
                        const sev  = WARN_SEV[w.severity] || WARN_SEV.low;
                        const type = WARN_TYPE[w.type] || { color: "#64748b", bg: "#f1f5f9" };
                        return (
                          <div key={w.id} style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", borderBottom: idx < warnings.length - 1 ? "1px solid #f1f5f9" : "none", background: !w.isRead ? sev.bg : "#fff", borderInlineStart: !w.isRead ? `3px solid ${sev.color}` : "3px solid transparent", alignItems: "flex-start" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: sev.bg, border: `1px solid ${sev.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "0.1rem" }}>
                              <i className={`bi ${sev.icon}`} style={{ fontSize: "0.9rem", color: sev.color }}></i>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                                <span style={{ background: type.bg, color: type.color, padding: "0.15rem 0.55rem", borderRadius: 5, fontSize: "0.72rem", fontWeight: 700 }}>{w.type}</span>
                                <span style={{ background: sev.bg, color: sev.color, padding: "0.15rem 0.55rem", borderRadius: 5, fontSize: "0.7rem", fontWeight: 600, border: `1px solid ${sev.border}` }}>{sev.ar}</span>
                                {!w.isRead && <span style={{ background: "#dc2626", color: "#fff", padding: "0.1rem 0.45rem", borderRadius: 5, fontSize: "0.67rem", fontWeight: 700 }}>{t("جديد", "New")}</span>}
                              </div>
                              <p style={{ margin: "0 0 0.3rem", fontSize: "0.86rem", color: "#1e293b", fontWeight: w.isRead ? 400 : 600, lineHeight: 1.5 }}>{w.message}</p>
                              <span style={{ fontSize: "0.73rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <i className="bi bi-calendar3"></i> {w.date}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ═══ ATTENDANCE TAB ═══ */}
          {tab === "attendance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Stats cards */}
              {total > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.85rem" }}>
                  {[
                    { icon: "bi-journal-text",         color: "#7c3aed", bg: "#f5f3ff", value: total,   labelAr: "إجمالي الدروس",  labelEn: "Total Lessons" },
                    { icon: "bi-check-circle-fill",    color: "#16a34a", bg: "#dcfce7", value: present,  labelAr: "حضرت",           labelEn: "Present" },
                    { icon: "bi-x-circle-fill",        color: "#dc2626", bg: "#fee2e2", value: absent,   labelAr: "غبت",            labelEn: "Absent" },
                    { icon: "bi-clock-fill",           color: "#d97706", bg: "#fef3c7", value: late,     labelAr: "تأخرت",          labelEn: "Late" },
                  ].map((s, i) => (
                    <div key={i} className="pcard" style={{ padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`bi ${s.icon}`} style={{ fontSize: "1rem", color: s.color }}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.15rem" }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rate banner */}
              {rate !== null && (
                <div className="pcard" style={{ padding: "1rem 1.25rem", borderInlineStart: `4px solid ${rateColor}`, background: rate >= 75 ? "#f0fdf4" : rate >= 50 ? "#fffbeb" : "#fef2f2" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: "2rem", color: rateColor, lineHeight: 1 }}>{rate}%</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{t("نسبة الحضور", "Attendance Rate")}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.15rem" }}>
                        {rate >= 75
                          ? t("نسبة حضورك ممتازة، استمر!", "Great attendance rate, keep it up!")
                          : rate >= 50
                            ? t("نسبة حضورك متوسطة، تحتاج للتحسين.", "Your attendance rate is average, needs improvement.")
                            : t("⚠️ نسبة حضورك منخفضة جداً، خطر الرسوب!", "⚠️ Your attendance is very low, at risk of failing!")}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                        {t(`حضرت ${present} من أصل ${total} درس`, `Attended ${present} out of ${total} lessons`)}
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 8, borderRadius: 4, background: "#e2e8f0", marginTop: "0.75rem" }}>
                    <div style={{ height: "100%", width: `${rate}%`, borderRadius: 4, background: rateColor, transition: "width 0.4s" }}></div>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <i className="bi bi-clipboard-check-fill" style={{ color: "#0a7d8a" }}></i>
                    {t("سجل حضوري التفصيلي", "My Detailed Attendance")}
                    {total > 0 && <span style={{ background: "#e6f7f8", color: "#0a7d8a", borderRadius: 20, padding: "0.05rem 0.55rem", fontSize: "0.74rem" }}>{total}</span>}
                  </h4>
                </div>

                {attLoading ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                    <i className="bi bi-arrow-repeat spinner" style={{ fontSize: "1.6rem" }}></i>
                  </div>
                ) : sorted.length === 0 ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                    <i className="bi bi-clipboard" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                    <p style={{ fontSize: "0.88rem", margin: 0 }}>{t("لم يتم تسجيل أي حضور بعد.", "No attendance records yet.")}</p>
                    <p style={{ fontSize: "0.78rem", color: "#cbd5e1", margin: "0.25rem 0 0" }}>{t("سيظهر هنا حضورك وغيابك بعد أن يسجّله التدريسي.", "Your attendance will appear here after your professor records it.")}</p>
                  </div>
                ) : (
                  <>
                    <div className="tbl-header" style={{ gridTemplateColumns: "auto 2fr 1fr 1fr" }}>
                      <span style={{ minWidth: 28 }}>#</span>
                      <span>{t("الدرس", "Lesson")}</span>
                      <span>{t("التاريخ", "Date")}</span>
                      <span style={{ textAlign: "center" }}>{t("الحالة", "Status")}</span>
                    </div>
                    {sorted.map((r, idx) => {
                      const s = ATT_STYLE[r.status] || ATT_STYLE.absent;
                      return (
                        <div key={`${r.lessonId}-${idx}`} className="tbl-row" style={{ gridTemplateColumns: "auto 2fr 1fr 1fr", background: r.status === "absent" ? "#fff8f8" : "#fff" }}>
                          <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700, minWidth: 28 }}>{sorted.length - idx}</span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{r.lessonTitle || t("درس", "Lesson")}</span>
                          <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{r.lessonDate}</span>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <span className="badge" style={{ background: s.bg, color: s.color }}>
                              <i className={`bi ${s.icon}`} style={{ fontSize: "0.7rem" }}></i>
                              {lang === "ar" ? s.ar : s.en}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer summary */}
                    <div style={{ padding: "0.65rem 1.25rem", background: "#f8fafc", borderTop: "2px solid #f1f5f9", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                      {[
                        { key: "present", value: present },
                        { key: "absent",  value: absent },
                        { key: "late",    value: late },
                      ].map(s => {
                        const st = ATT_STYLE[s.key];
                        return (
                          <span key={s.key} style={{ fontSize: "0.8rem", color: st.color, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <i className={`bi ${st.icon}`}></i>
                            {lang === "ar" ? st.ar : st.en}: {s.value}
                          </span>
                        );
                      })}
                      <span style={{ marginInlineStart: "auto", fontWeight: 800, color: rateColor, fontSize: "0.9rem" }}>
                        {rate}% {t("حضور", "rate")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {tab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 600 }}>

              {/* Profile picture card */}
              <div className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="bi bi-person-badge-fill" style={{ color: "#0a7d8a", fontSize: "1rem" }}></i>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0 }}>{t("الصورة الشخصية","Profile Picture")}</h4>
                </div>
                <div style={{ padding: "1.5rem 1.25rem" }}>

                  {/* Current avatar display */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {avatarPreview || avatar ? (
                        <img src={avatarPreview || avatar!} alt="avatar" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid #e2e8f0", display: "block" }} />
                      ) : (
                        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d32,#43a047)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                          {initials}
                        </div>
                      )}
                      {avatarPreview && (
                        <div style={{ position: "absolute", top: -4, insetInlineEnd: -4, background: "#d97706", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", border: "2px solid #fff" }}>
                          <i className="bi bi-pencil-fill"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b", margin: "0 0 0.25rem" }}>{student.fullName}</p>
                      <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "0 0 0.65rem" }}>{t("JPG أو PNG أو WebP — بحد أقصى 5 ميغابايت","JPG, PNG or WebP — max 5 MB")}</p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <label style={{ background: "#0a7d8a", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <i className="bi bi-upload"></i>
                          {t("اختر صورة","Choose photo")}
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }}
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              setAvatarFile(f);
                              const reader = new FileReader();
                              reader.onload = ev => setAvatarPreview(ev.target?.result as string);
                              reader.readAsDataURL(f);
                              setAvatarMsg(null);
                              e.target.value = "";
                            }} />
                        </label>
                        {avatar && !avatarPreview && (
                          <button onClick={removeAvatar} disabled={avatarSaving}
                            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <i className="bi bi-trash3"></i>{t("حذف الصورة","Remove")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save / Cancel for new upload */}
                  {avatarPreview && (
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", padding: "0.85rem 1rem", background: "#fffbeb", borderRadius: 10, border: "1px solid #fcd34d" }}>
                      <i className="bi bi-info-circle-fill" style={{ color: "#d97706", flexShrink: 0 }}></i>
                      <span style={{ flex: 1, fontSize: "0.82rem", color: "#92400e" }}>{t("لم تُحفَظ الصورة بعد. اضغط حفظ لتطبيق التغيير.","Photo not saved yet. Press save to apply.")}</span>
                      <button onClick={uploadAvatar} disabled={avatarSaving}
                        style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: 700, cursor: avatarSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                        {avatarSaving ? <i className="bi bi-arrow-repeat spinner"></i> : <i className="bi bi-check-lg"></i>}
                        {t("حفظ","Save")}
                      </button>
                      <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); setAvatarMsg(null); }}
                        style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, padding: "0.4rem 0.8rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                        {t("إلغاء","Cancel")}
                      </button>
                    </div>
                  )}

                  {/* Status message */}
                  {avatarMsg && (
                    <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.9rem", borderRadius: 8, background: avatarMsg.type === "ok" ? "#f0fdf4" : "#fef2f2", color: avatarMsg.type === "ok" ? "#16a34a" : "#dc2626", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <i className={`bi ${avatarMsg.type === "ok" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                      {avatarMsg.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Change password card */}
              <div className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="bi bi-shield-lock-fill" style={{ color: "#0a7d8a", fontSize: "1rem" }}></i>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0 }}>{t("تغيير كلمة المرور","Change Password")}</h4>
                </div>
                <form onSubmit={changePassword} style={{ padding: "1.5rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

                  {/* Current password */}
                  <div style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>{t("كلمة المرور الحالية","Current Password")}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurPw ? "text" : "password"}
                        value={pwForm.current}
                        onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                        required
                        style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 10, padding: `0.75rem ${isRtl ? "1rem" : "2.75rem"} 0.75rem ${isRtl ? "2.75rem" : "1rem"}`, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                      <button type="button" onClick={() => setShowCurPw(p => !p)}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "0.75rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: 0 }}>
                        <i className={`bi bi-eye${showCurPw ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>{t("كلمة المرور الجديدة","New Password")}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={pwForm.newPass}
                        onChange={e => setPwForm(p => ({ ...p, newPass: e.target.value }))}
                        required minLength={4}
                        style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 10, padding: `0.75rem ${isRtl ? "1rem" : "2.75rem"} 0.75rem ${isRtl ? "2.75rem" : "1rem"}`, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                      <button type="button" onClick={() => setShowNewPw(p => !p)}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "0.75rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: 0 }}>
                        <i className={`bi bi-eye${showNewPw ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>{t("تأكيد كلمة المرور","Confirm New Password")}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConPw ? "text" : "password"}
                        value={pwForm.confirm}
                        onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                        required minLength={4}
                        style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 10, padding: `0.75rem ${isRtl ? "1rem" : "2.75rem"} 0.75rem ${isRtl ? "2.75rem" : "1rem"}`, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                      <button type="button" onClick={() => setShowConPw(p => !p)}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "0.75rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: 0 }}>
                        <i className={`bi bi-eye${showConPw ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Status message */}
                  {pwMsg && (
                    <div style={{ padding: "0.6rem 0.9rem", borderRadius: 8, background: pwMsg.type === "ok" ? "#f0fdf4" : "#fef2f2", color: pwMsg.type === "ok" ? "#16a34a" : "#dc2626", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <i className={`bi ${pwMsg.type === "ok" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                      {pwMsg.text}
                    </div>
                  )}

                  <button type="submit" disabled={pwSaving}
                    style={{ alignSelf: "flex-start", background: "linear-gradient(135deg,#0a7d8a,#0ea5b5)", color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontSize: "0.88rem", fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem", opacity: pwSaving ? 0.7 : 1 }}>
                    {pwSaving ? <i className="bi bi-arrow-repeat spinner"></i> : <i className="bi bi-shield-check"></i>}
                    {t("حفظ كلمة المرور","Save Password")}
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>

      {siteData && <Footer footerData={footerData} locale={locale} />}
    </div>
  );
}
