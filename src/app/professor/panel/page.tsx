"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Header, Footer } from "../../page-content";

interface ProfessorInfo {
  id: string; fullName: string; email: string; phone: string;
  specialization: string; status: string; createdAt: string;
  position?: string; department?: string;
}
interface Student {
  id: string; fullName: string; email: string; phone: string;
  department: string; branch: string; status: string; createdAt: string;
}
interface Lesson {
  id: string; title: string; description: string; subject: string;
  date: string; time: string; createdAt: string; professorName: string; department: string;
  type?: "lecture" | "exam";
}
interface AttendanceRecord { studentId: string; studentName: string; status: "present" | "absent" | "late"; }
interface SavedAttendance extends AttendanceRecord { lessonId: string; lessonDate: string; lessonTitle?: string; }
interface GradeRecord { id: string; examId: string; studentId: string; studentName: string; result: "pass" | "fail"; professorId: string; recordedAt: string; }

function mapNavChildren(children: any[], locale: string): any[] {
  return (children || []).map((child: any) => {
    if (typeof child === "string") return { label: child, href: "#" };
    const mapped: any = { label: child.label || "", href: child.href ? `/${locale}${child.href}` : "#" };
    if (child.children) mapped.children = mapNavChildren(child.children, locale);
    return mapped;
  });
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; ar: string; en: string; msgAr: string; msgEn: string }> = {
  pending:  { color: "#d97706", bg: "#fffbeb", icon: "bi-hourglass-split",   ar: "قيد الانتظار", en: "Pending",  msgAr: "حسابك قيد انتظار مراجعة إدارة الكلية.", msgEn: "Your account is under review by the administration." },
  approved: { color: "#16a34a", bg: "#f0fdf4", icon: "bi-check-circle-fill", ar: "مفعّل",        en: "Active",   msgAr: "حسابك مفعّل. أهلاً بك في منظومة الكلية.", msgEn: "Your account is active. Welcome to the system." },
  active:   { color: "#16a34a", bg: "#f0fdf4", icon: "bi-check-circle-fill", ar: "مفعّل",        en: "Active",   msgAr: "حسابك مفعّل. أهلاً بك في منظومة الكلية.", msgEn: "Your account is active. Welcome to the system." },
  rejected: { color: "#dc2626", bg: "#fef2f2", icon: "bi-x-circle-fill",     ar: "مرفوض",        en: "Rejected", msgAr: "تم رفض طلبك. يرجى التواصل مع الإدارة.", msgEn: "Your request was rejected. Please contact the administration." },
};

const RANK_LABELS: Record<string, { ar: string; en: string }> = {
  dean:          { ar: "عميد الكلية",         en: "Dean of College" },
  vice_dean:     { ar: "معاون عميد الكلية",   en: "Assistant Dean" },
  head:          { ar: "رئيس قسم",            en: "Head of Department" },
  exam_head:     { ar: "رئيس لجنة امتحانية", en: "Head of Exam Committee" },
  accounts:      { ar: "الحسابات",            en: "Accounts" },
  lecturer:      { ar: "تدريسي",             en: "Lecturer" },
  dept_reporter: { ar: "مقرر قسم",           en: "Department Reporter" },
};

const ATTENDANCE_COLORS: Record<string, { color: string; bg: string; ar: string; en: string; icon: string }> = {
  present: { color: "#16a34a", bg: "#dcfce7", ar: "حاضر",  en: "Present", icon: "bi-check-circle-fill" },
  absent:  { color: "#dc2626", bg: "#fee2e2", ar: "غائب",  en: "Absent",  icon: "bi-x-circle-fill" },
  late:    { color: "#d97706", bg: "#fef3c7", ar: "متأخر", en: "Late",    icon: "bi-clock-fill" },
};

type Tab = "home" | "students" | "attendance" | "lessons" | "reports" | "settings";

export default function ProfessorPanel() {
  const router = useRouter();
  const [professor, setProfessor] = useState<ProfessorInfo | null>(null);
  const [token, setToken]         = useState("");
  const [lang, setLang]           = useState<"ar" | "en">("ar");
  const [siteData, setSiteData]   = useState<any>(null);
  const [tab, setTab]             = useState<Tab>("home");

  const [students, setStudents]     = useState<Student[]>([]);
  const [stuLoading, setStuLoading] = useState(false);
  const [stuSearch, setStuSearch]   = useState("");

  const [lessons, setLessons]         = useState<Lesson[]>([]);
  const [lesLoading, setLesLoading]   = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonForm, setLessonForm]   = useState({ title: "", description: "", subject: "", date: "", time: "", type: "lecture" as "lecture" | "exam" });
  const [lesSaving, setLesSaving]     = useState(false);
  const [lesError, setLesError]       = useState("");

  const [selectedLesson, setSelectedLesson]       = useState<Lesson | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [allAttendance, setAllAttendance]         = useState<SavedAttendance[]>([]);
  const [attLoading, setAttLoading]   = useState(false);
  const [attSaving, setAttSaving]     = useState(false);
  const [attSaved, setAttSaved]       = useState(false);
  const [dataLoaded, setDataLoaded]   = useState(false);

  const [grades, setGrades]                       = useState<GradeRecord[]>([]);
  const [gradeRecords, setGradeRecords]           = useState<Record<string, "pass" | "fail" | "none">>({});
  const [gradesSaving, setGradesSaving]           = useState(false);
  const [gradesSaved, setGradesSaved]             = useState(false);
  const [avatar, setAvatar]               = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarSaving, setAvatarSaving]   = useState(false);
  const [avatarMsg, setAvatarMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwForm, setPwForm]               = useState({ current: "", newPass: "", confirm: "" });
  const [pwSaving, setPwSaving]           = useState(false);
  const [pwMsg, setPwMsg]                 = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showCurPw, setShowCurPw]         = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const [showConPw, setShowConPw]         = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [modalSubTab, setModalSubTab]             = useState<"attendance" | "exams" | "warnings">("attendance");
  const [studentWarnings, setStudentWarnings]     = useState<any[]>([]);
  const [warnLoading, setWarnLoading]             = useState(false);
  const [warnForm, setWarnForm]                   = useState({ type: "غياب", message: "", severity: "medium" as "high" | "medium" | "low" });
  const [warnSending, setWarnSending]             = useState(false);
  const [warnSent, setWarnSent]                   = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search).get("lang") as "ar" | "en" | null;
    if (urlLang === "ar" || urlLang === "en") {
      setLang(urlLang);
      localStorage.setItem("admin_lang", urlLang);
    } else {
      const saved = localStorage.getItem("admin_lang") as "ar" | "en" | null;
      if (saved) setLang(saved);
    }
    const raw = localStorage.getItem("professor_data");
    const tok = localStorage.getItem("professor_token") || sessionStorage.getItem("professor_token") || "";
    if (!raw || !tok) { router.replace("/login"); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.fullName && parsed.name) parsed.fullName = parsed.name;
      if (!parsed.fullName) parsed.fullName = parsed.email || "?";
      setProfessor(parsed);
      setToken(tok);
      fetch(`/api/professor/avatar?token=${encodeURIComponent(tok)}`)
        .then(r => r.json()).then(d => { if (d.avatar) setAvatar(d.avatar); }).catch(() => {});
    } catch { router.replace("/login"); }
    fetch("/api/site-data").then(r => r.json()).then(d => setSiteData(d)).catch(() => {});
  }, [router]);

  // ── Initial data load for stats ───────────────────────────────────────────
  const loadAll = useCallback(async (tok: string) => {
    if (!tok || dataLoaded) return;
    const [stuRes, lesRes, attRes, graRes] = await Promise.all([
      fetch(`/api/professor/students?token=${encodeURIComponent(tok)}`),
      fetch(`/api/professor/lessons?token=${encodeURIComponent(tok)}`),
      fetch(`/api/professor/attendance?token=${encodeURIComponent(tok)}`),
      fetch(`/api/professor/grades?token=${encodeURIComponent(tok)}`),
    ]);
    const [stuData, lesData, attData, graData] = await Promise.all([stuRes.json(), lesRes.json(), attRes.json(), graRes.json()]);
    if (stuData.students)  setStudents(stuData.students);
    if (lesData.lessons)   setLessons(lesData.lessons);
    if (attData.attendance) setAllAttendance(attData.attendance);
    if (graData.grades)    setGrades(graData.grades);
    setDataLoaded(true);
  }, [dataLoaded]);

  useEffect(() => { if (token) loadAll(token); }, [token, loadAll]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalStu  = students.length;
    const totalLes  = lessons.length;
    const today     = new Date().toISOString().slice(0, 10);
    const upcoming  = lessons.filter(l => l.date >= today).length;
    // Rate = present records / (recorded lessons × all students)
    const recordedLessons  = new Set(allAttendance.map(a => a.lessonId)).size;
    const totalExpected    = recordedLessons * totalStu;
    const totalPresent     = allAttendance.filter(a => a.status === "present").length;
    const rate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;
    return { totalStu, totalLes, rate, upcoming };
  }, [students, lessons, allAttendance]);

  // ── Attendance per student (for students tab) ─────────────────────────────
  // Total = all lessons that have any attendance record (denominator = all students × all recorded lessons)
  const studentAttStats = useMemo(() => {
    const recordedLessons = new Set(allAttendance.map(a => a.lessonId)).size;
    const map: Record<string, { present: number; total: number }> = {};
    // Seed all students with correct total
    for (const s of students) {
      map[s.id] = { present: 0, total: recordedLessons };
    }
    for (const a of allAttendance) {
      if (!map[a.studentId]) map[a.studentId] = { present: 0, total: recordedLessons };
      if (a.status === "present") map[a.studentId].present++;
    }
    return map;
  }, [allAttendance, students]);

  // ── Fetch attendance for a lesson ─────────────────────────────────────────
  // Default = PRESENT for all students; professor marks only the ABSENT/LATE ones
  const fetchAttendance = useCallback(async (tok: string, lessonId: string, sts: Student[]) => {
    if (!tok || !lessonId) return;
    setAttLoading(true);
    try {
      const res  = await fetch(`/api/professor/attendance?token=${encodeURIComponent(tok)}&lessonId=${lessonId}`);
      const data = await res.json();
      // Build a map of saved statuses (if any)
      const savedMap: Record<string, "present" | "absent" | "late"> = {};
      if (data.attendance) {
        for (const a of data.attendance) savedMap[a.studentId] = a.status;
      }
      // All students in list — saved status wins, otherwise default = present
      setAttendanceRecords(sts.map(s => ({
        studentId:   s.id,
        studentName: s.fullName,
        status:      savedMap[s.id] ?? "present",
      })));
    } finally { setAttLoading(false); }
  }, []);

  function handleSelectLesson(lesson: Lesson, switchTab = false) {
    setSelectedLesson(lesson);
    setAttSaved(false);
    setGradesSaved(false);
    fetchAttendance(token, lesson.id, students);
    if (lesson.type === "exam") {
      const gradeMap: Record<string, "pass" | "fail" | "none"> = {};
      for (const s of students) gradeMap[s.id] = "none";
      for (const g of grades) { if (g.examId === lesson.id) gradeMap[g.studentId] = g.result; }
      setGradeRecords(gradeMap);
    }
    if (switchTab) setTab("attendance");
  }

  async function uploadAvatar() {
    if (!avatarFile || !token) return;
    setAvatarSaving(true); setAvatarMsg(null);
    try {
      const fd = new FormData();
      fd.append("image", avatarFile);
      const res  = await fetch(`/api/professor/avatar?token=${encodeURIComponent(token)}`, { method: "POST", body: fd });
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
      await fetch(`/api/professor/avatar?token=${encodeURIComponent(token)}`, { method: "DELETE" });
      setAvatar(null); setAvatarPreview(null); setAvatarFile(null);
      setAvatarMsg({ type: "ok", text: t("تم حذف الصورة","Avatar removed") });
    } finally { setAvatarSaving(false); }
  }

  async function fetchStudentWarnings(studentId: string) {
    setWarnLoading(true);
    try {
      const res  = await fetch(`/api/professor/warnings?token=${encodeURIComponent(token)}&studentId=${studentId}`);
      const data = await res.json();
      if (data.warnings) setStudentWarnings(data.warnings);
    } finally { setWarnLoading(false); }
  }

  async function sendWarning() {
    if (!selectedStudentId || !warnForm.message.trim()) return;
    setWarnSending(true);
    try {
      await fetch(`/api/professor/warnings?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudentId, type: warnForm.type, message: warnForm.message, severity: warnForm.severity }),
      });
      setWarnSent(true);
      setWarnForm({ type: "غياب", message: "", severity: "medium" });
      fetchStudentWarnings(selectedStudentId);
      setTimeout(() => setWarnSent(false), 3000);
    } finally { setWarnSending(false); }
  }

  async function deleteWarning(warningId: string) {
    await fetch(`/api/professor/warnings?token=${encodeURIComponent(token)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warningId }),
    });
    setStudentWarnings(prev => prev.filter(w => w.id !== warningId));
  }

  async function saveGrades() {
    if (!selectedLesson) return;
    setGradesSaving(true);
    try {
      const records = Object.entries(gradeRecords).map(([studentId, result]) => ({
        studentId,
        studentName: students.find(s => s.id === studentId)?.fullName || "",
        result,
      }));
      await fetch(`/api/professor/grades?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: selectedLesson.id, records }),
      });
      setGradesSaved(true);
      const res = await fetch(`/api/professor/grades?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.grades) setGrades(data.grades);
    } finally { setGradesSaving(false); }
  }

  function markAll(status: "present" | "absent" | "late") {
    setAttendanceRecords(prev => prev.map(r => ({ ...r, status })));
  }

  function toggleAttendance(studentId: string, status: "present" | "absent" | "late") {
    setAttendanceRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  }

  async function saveAttendance() {
    if (!selectedLesson) return;
    setAttSaving(true);
    try {
      await fetch(`/api/professor/attendance?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: selectedLesson.id, records: attendanceRecords }),
      });
      setAttSaved(true);
      // Refresh global attendance
      const res = await fetch(`/api/professor/attendance?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.attendance) setAllAttendance(data.attendance);
    } finally { setAttSaving(false); }
  }

  async function addLesson() {
    if (!lessonForm.title || !lessonForm.date) {
      setLesError(lang === "ar" ? "العنوان والتاريخ مطلوبان" : "Title and date are required");
      return;
    }
    setLesSaving(true); setLesError("");
    try {
      const res  = await fetch(`/api/professor/lessons?token=${encodeURIComponent(token)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lessonForm),
      });
      const data = await res.json();
      if (data.lesson) {
        setLessons(prev => [...prev, data.lesson]);
        setLessonForm({ title: "", description: "", subject: "", date: "", time: "", type: "lecture" });
        setShowAddLesson(false);
      } else { setLesError(data.error || "Error"); }
    } finally { setLesSaving(false); }
  }

  async function deleteLesson(id: string) {
    await fetch(`/api/professor/lessons?token=${encodeURIComponent(token)}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    setLessons(prev => prev.filter(l => l.id !== id));
    if (selectedLesson?.id === id) { setSelectedLesson(null); setAttendanceRecords([]); }
  }

  const toggleLang = () => {
    const next: "ar" | "en" = lang === "ar" ? "en" : "ar";
    setLang(next); localStorage.setItem("admin_lang", next);
  };
  function handleLogout() {
    localStorage.removeItem("professor_token"); localStorage.removeItem("professor_data");
    sessionStorage.removeItem("professor_token"); sessionStorage.removeItem("professor_data");
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

  if (!professor) return null;

  const status    = STATUS_CONFIG[professor.status] || STATUS_CONFIG.pending;
  const rankLabel = professor.position ? (RANK_LABELS[professor.position]?.[lang] || professor.position) : t("تدريسي", "Lecturer");
  const initials  = (professor.fullName || "?").trim().split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";

  const filteredStudents = stuSearch.trim()
    ? students.filter(s => s.fullName.toLowerCase().includes(stuSearch.toLowerCase()) || s.email.toLowerCase().includes(stuSearch.toLowerCase()) || (s.department || "").toLowerCase().includes(stuSearch.toLowerCase()))
    : students;

  const sortedLessons = [...lessons].sort((a, b) => b.date.localeCompare(a.date));

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPwMsg(null);
    if (pwForm.newPass !== pwForm.confirm) {
      setPwMsg({ type: "err", text: t("كلمة المرور الجديدة وتأكيدها غير متطابقتين","New passwords do not match") });
      return;
    }
    setPwSaving(true);
    try {
      const r = await fetch("/api/professor/change-password", {
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

  const TABS: { id: Tab; labelAr: string; labelEn: string; icon: string }[] = [
    { id: "home",       labelAr: "الرئيسية",    labelEn: "Home",       icon: "bi-house-fill" },
    { id: "students",   labelAr: "الطلاب",      labelEn: "Students",   icon: "bi-people-fill" },
    { id: "attendance", labelAr: "الحضور",      labelEn: "Attendance", icon: "bi-clipboard-check-fill" },
    { id: "lessons",    labelAr: "الدروس",      labelEn: "Lessons",    icon: "bi-journal-text" },
    { id: "reports",    labelAr: "تقارير الغياب", labelEn: "Reports",   icon: "bi-bar-chart-fill" },
    { id: "settings",   labelAr: "الإعدادات",     labelEn: "Settings",  icon: "bi-gear-fill" },
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
        .info-row span:first-child { min-width: 80px; color: #94a3b8; font-weight: 600; flex-shrink: 0; }
        .info-row:last-child { border-bottom: none; }
        .tab-btn { border: none; background: none; padding: 0.6rem 1rem; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s, color 0.15s; white-space: nowrap; }
        .tab-btn:hover { background: #f1f5f9; color: #0a7d8a; }
        .tab-btn.active { background: #0a7d8a; color: #fff; }
        .stat-card { background: #fff; border-radius: 14px; padding: 1.1rem 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .att-btn { border: 1.5px solid transparent; border-radius: 7px; padding: 0.22rem 0.7rem; cursor: pointer; font-family: inherit; font-size: 0.77rem; font-weight: 700; transition: all 0.15s; opacity: 0.4; }
        .att-btn.active { opacity: 1; }
        .inp { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.6rem 0.9rem; font-family: inherit; font-size: 0.87rem; outline: none; transition: border 0.15s; background: #fff; }
        .inp:focus { border-color: #0a7d8a; box-shadow: 0 0 0 3px rgba(10,125,138,0.08); }
        .tbl-header { display: grid; font-weight: 700; font-size: 0.75rem; color: #94a3b8; background: #f8fafc; padding: 0.55rem 1rem; }
        .tbl-row { display: grid; align-items: center; padding: 0.7rem 1rem; border-bottom: 1px solid #f8fafc; font-size: 0.83rem; transition: background 0.1s; }
        .tbl-row:last-child { border-bottom: none; }
        .tbl-row:hover { background: #fafafa; }
        .badge { display: inline-flex; align-items: center; padding: 0.18rem 0.55rem; border-radius: 6px; font-size: 0.73rem; font-weight: 700; }
        .btn-teal { background: #0a7d8a; color: #fff; border: none; border-radius: 10px; padding: 0.55rem 1.1rem; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: opacity 0.15s; }
        .btn-teal:hover { opacity: 0.88; }
        .btn-teal:disabled { opacity: 0.55; cursor: not-allowed; }
        .lesson-card { border-radius: 12px; border: 1.5px solid #e2e8f0; padding: 1rem 1.1rem; background: #fff; transition: border-color 0.15s, box-shadow 0.15s; }
        .lesson-card:hover { border-color: #0a7d8a; box-shadow: 0 2px 12px rgba(10,125,138,0.1); }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:700px) {
          .home-grid { grid-template-columns: 1fr !important; }
          .att-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="panel-body">
        <div style={{ maxWidth: 1900, margin: "0 auto", width: "100%" }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem", flexWrap: "wrap", gap: "0.6rem" }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", margin: 0 }}>{t("لوحة التدريسي", "Professor Dashboard")}</h1>
              <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.15rem 0 0" }}>{t("مرحباً،", "Welcome,")} {professor.fullName}</p>
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

          {/* ── Tabs ── */}
          <div className="pcard" style={{ display: "flex", gap: "0.25rem", padding: "0.45rem 0.6rem", marginBottom: "1.1rem", flexWrap: "wrap", overflowX: "auto" }}>
            {TABS.map(tb => (
              <button key={tb.id} className={`tab-btn${tab === tb.id ? " active" : ""}`} onClick={() => setTab(tb.id)}>
                <i className={`bi ${tb.icon}`} style={{ fontSize: "0.9rem" }}></i>
                {lang === "ar" ? tb.labelAr : tb.labelEn}
                {tb.id === "students"   && students.length  > 0 && <span style={{ background: tab === "students"   ? "rgba(255,255,255,0.25)" : "#e2e8f0", borderRadius: 20, padding: "0.05rem 0.45rem", fontSize: "0.7rem" }}>{students.length}</span>}
                {tb.id === "lessons"    && lessons.length   > 0 && <span style={{ background: tab === "lessons"    ? "rgba(255,255,255,0.25)" : "#e2e8f0", borderRadius: 20, padding: "0.05rem 0.45rem", fontSize: "0.7rem" }}>{lessons.length}</span>}
              </button>
            ))}
          </div>

          {/* ═══════════════ HOME TAB ═══════════════ */}
          {tab === "home" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

              {/* Status banner */}
              <div className="pcard" style={{ padding: "1rem 1.25rem", borderInlineStart: `4px solid ${status.color}`, background: status.bg, display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <i className={`bi ${status.icon}`} style={{ fontSize: "1.4rem", color: status.color, flexShrink: 0 }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{t("حالة الحساب:", "Account Status:")}</span>
                    <span style={{ fontWeight: 700, color: status.color, fontSize: "0.82rem", background: "#fff", padding: "0.1rem 0.5rem", borderRadius: 5, border: `1px solid ${status.color}` }}>
                      {lang === "ar" ? status.ar : status.en}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>{lang === "ar" ? status.msgAr : status.msgEn}</p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.85rem" }}>
                {[
                  { icon: "bi-people-fill",         color: "#0a7d8a", bg: "#e6f7f8", value: stats.totalStu,  labelAr: "إجمالي الطلاب",  labelEn: "Total Students"  },
                  { icon: "bi-journal-text",         color: "#7c3aed", bg: "#f5f3ff", value: stats.totalLes,  labelAr: "الدروس المسجّلة", labelEn: "Lessons Logged"  },
                  { icon: "bi-clipboard-check-fill", color: stats.rate >= 75 ? "#16a34a" : stats.rate >= 50 ? "#d97706" : "#dc2626", bg: stats.rate >= 75 ? "#dcfce7" : stats.rate >= 50 ? "#fef3c7" : "#fee2e2", value: `${stats.rate}%`, labelAr: "نسبة الحضور الكلية", labelEn: "Overall Attend. Rate" },
                  { icon: "bi-calendar-event-fill",  color: "#d97706", bg: "#fef3c7", value: stats.upcoming,  labelAr: "دروس قادمة",     labelEn: "Upcoming Lessons"},
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: "1.15rem", color: s.color }}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "0.2rem" }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile + Info */}
              <div className="home-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1rem" }}>
                <div className="pcard" style={{ padding: "1.5rem 1.25rem", textAlign: "center" }}>
                  <div style={{ position: "relative", width: 68, height: 68, margin: "0 auto 0.85rem", cursor: "pointer" }} onClick={() => setTab("settings")} title={t("تغيير الصورة","Change photo")}>
                    {avatar ? (
                      <img src={avatar} alt="avatar" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "3px solid #e2e8f0" }} />
                    ) : (
                      <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#e07b00,#f5a623)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                        {initials}
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, insetInlineEnd: 0, width: 22, height: 22, background: "#0a7d8a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                      <i className="bi bi-camera-fill" style={{ fontSize: "0.6rem", color: "#fff" }}></i>
                    </div>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", margin: "0 0 0.15rem" }}>{professor.fullName}</h3>
                  <p style={{ color: "#e07b00", fontSize: "0.78rem", fontWeight: 600, margin: "0 0 0.15rem" }}>{rankLabel}</p>
                  <p style={{ color: "#94a3b8", fontSize: "0.73rem", margin: "0 0 0.9rem" }}>{professor.email}</p>
                  <div style={{ background: "#f8fafc", borderRadius: 8, padding: "0.45rem 0.75rem", fontSize: "0.74rem", color: "#64748b" }}>
                    <i className="bi bi-calendar3" style={{ marginInlineEnd: "0.35rem", color: "#0a7d8a" }}></i>
                    {t("انضم:", "Joined:")} {new Date(professor.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>

                <div className="pcard" style={{ padding: "1.25rem" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.9rem", paddingBottom: "0.6rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <i className="bi bi-person-lines-fill" style={{ color: "#0a7d8a" }}></i>
                    {t("المعلومات الشخصية", "Personal Information")}
                  </h4>
                  <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("الاسم", "Name")}</span><span style={{ fontWeight: 600, color: "#1e293b" }}>{professor.fullName}</span></div>
                  <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("البريد", "Email")}</span><span style={{ color: "#475569" }}>{professor.email}</span></div>
                  {professor.phone && <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("الهاتف", "Phone")}</span><span style={{ color: "#475569" }}>{professor.phone}</span></div>}
                  {(professor.specialization || (professor as any).department) && (
                    <div className="info-row">
                      <span style={{ color: "#94a3b8" }}>{t("القسم / التخصص", "Dept. / Spec.")}</span>
                      <span style={{ color: "#475569" }}>{(professor as any).department || professor.specialization}</span>
                    </div>
                  )}
                  <div className="info-row"><span style={{ color: "#94a3b8" }}>{t("الرتبة", "Rank")}</span><span style={{ color: "#e07b00", fontWeight: 700 }}>{rankLabel}</span></div>

                </div>
              </div>

              {/* Last lessons preview */}
              {lessons.length > 0 && (
                <div className="pcard" style={{ padding: "1.1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <i className="bi bi-journal-text" style={{ color: "#7c3aed" }}></i>
                      {t("آخر الدروس", "Recent Lessons")}
                    </h4>
                    <button onClick={() => setTab("lessons")} style={{ background: "none", border: "none", color: "#0a7d8a", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t("عرض الكل", "View all")} <i className="bi bi-arrow-left-short"></i>
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.65rem" }}>
                    {sortedLessons.slice(0, 4).map(l => (
                      <div key={l.id} className="lesson-card" style={{ cursor: "pointer" }} onClick={() => handleSelectLesson(l, true)}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.2rem" }}>{l.title}</div>
                        {l.subject && <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600, marginBottom: "0.25rem" }}>{l.subject}</div>}
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                          <i className="bi bi-calendar3" style={{ marginInlineEnd: "0.25rem" }}></i>{l.date}
                          {l.time && <span style={{ marginInlineStart: "0.5rem" }}><i className="bi bi-clock" style={{ marginInlineEnd: "0.25rem" }}></i>{l.time}</span>}
                        </div>
                        <div style={{ marginTop: "0.5rem", fontSize: "0.73rem", color: "#0a7d8a", fontWeight: 600 }}>
                          <i className="bi bi-clipboard-check" style={{ marginInlineEnd: "0.25rem" }}></i>{t("تسجيل الحضور", "Record attendance")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ STUDENTS TAB ═══════════════ */}
          {tab === "students" && (
            <div className="pcard" style={{ overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
                <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <i className="bi bi-people-fill" style={{ color: "#0a7d8a" }}></i>
                  {t("طلاب القسم", "Department Students")}
                  <span style={{ background: "#e6f7f8", color: "#0a7d8a", borderRadius: 20, padding: "0.05rem 0.55rem", fontSize: "0.75rem", fontWeight: 700 }}>{students.length}</span>
                </h4>
                <div style={{ position: "relative", minWidth: 220 }}>
                  <i className="bi bi-search" style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineStart: "0.75rem", color: "#94a3b8", fontSize: "0.85rem", pointerEvents: "none" }}></i>
                  <input
                    className="inp"
                    style={{ paddingInlineStart: "2.1rem", paddingTop: "0.45rem", paddingBottom: "0.45rem" }}
                    placeholder={t("بحث بالاسم أو البريد...", "Search by name or email...")}
                    value={stuSearch}
                    onChange={e => setStuSearch(e.target.value)}
                  />
                </div>
              </div>

              {stuLoading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                  <i className="bi bi-arrow-repeat spinner" style={{ fontSize: "1.6rem" }}></i>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                  <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                  <p style={{ fontSize: "0.88rem", margin: 0 }}>
                    {stuSearch ? t("لا توجد نتائج", "No results found") : t("لا يوجد طلاب في قسمك حالياً", "No students found in your department")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="tbl-header" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr" }}>
                    <span>{t("الاسم", "Name")}</span>
                    <span>{t("البريد", "Email")}</span>
                    <span>{t("القسم", "Department")}</span>
                    <span>{t("الفرع", "Branch")}</span>
                    <span>{t("الحضور", "Attend.")}</span>
                    <span>{t("الحالة", "Status")}</span>
                  </div>
                  {filteredStudents.map(s => {
                    const ats = studentAttStats[s.id];
                    const rate = ats && ats.total > 0 ? Math.round((ats.present / ats.total) * 100) : null;
                    const rateColor = rate === null ? "#94a3b8" : rate >= 75 ? "#16a34a" : rate >= 50 ? "#d97706" : "#dc2626";
                    return (
                      <div key={s.id} className="tbl-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0a7d8a,#0eb5c5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {(s.fullName || "?").trim().split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{s.fullName}</span>
                        </div>
                        <span style={{ color: "#64748b", fontSize: "0.79rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</span>
                        <span style={{ color: "#64748b" }}>{s.department || "—"}</span>
                        <span style={{ color: "#64748b" }}>{s.branch || "—"}</span>
                        <span style={{ fontWeight: 700, color: rateColor, fontSize: "0.82rem" }}>
                          {rate !== null ? `${rate}%` : "—"}
                        </span>
                        <span>
                          <span className="badge" style={{ background: s.status === "approved" || s.status === "active" ? "#dcfce7" : s.status === "pending" ? "#fef3c7" : "#fee2e2", color: s.status === "approved" || s.status === "active" ? "#16a34a" : s.status === "pending" ? "#d97706" : "#dc2626" }}>
                            {s.status === "approved" || s.status === "active" ? t("مفعّل", "Active") : s.status === "pending" ? t("معلق", "Pending") : t("مرفوض", "Rejected")}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                  {stuSearch && filteredStudents.length !== students.length && (
                    <div style={{ padding: "0.55rem 1rem", background: "#f8fafc", fontSize: "0.77rem", color: "#94a3b8", textAlign: "center" }}>
                      {t(`يعرض ${filteredStudents.length} من ${students.length}`, `Showing ${filteredStudents.length} of ${students.length}`)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════════════ LESSONS TAB ═══════════════ */}
          {tab === "lessons" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-teal" onClick={() => { setShowAddLesson(s => !s); setLesError(""); }}>
                  <i className={`bi ${showAddLesson ? "bi-x-lg" : "bi-plus-lg"}`}></i>
                  {showAddLesson ? t("إلغاء", "Cancel") : t("إضافة درس جديد", "Add New Lesson")}
                </button>
              </div>

              {showAddLesson && (
                <div className="pcard" style={{ padding: "1.25rem" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <i className="bi bi-journal-plus" style={{ color: "#0a7d8a" }}></i>{t("درس جديد", "New Lesson")}
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>{t("عنوان الدرس *", "Lesson Title *")}</label>
                      <input className="inp" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} placeholder={t("مثال: مقدمة في الجبر", "e.g. Introduction to Algebra")} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>{t("المادة", "Subject")}</label>
                      <input className="inp" value={lessonForm.subject} onChange={e => setLessonForm(f => ({ ...f, subject: e.target.value }))} placeholder={t("اسم المادة", "Subject name")} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>{t("نوع الدرس", "Type")}</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {([{ v: "lecture", ar: "محاضرة", en: "Lecture", icon: "bi-journal-text" }, { v: "exam", ar: "امتحان", en: "Exam", icon: "bi-pen-fill" }] as const).map(opt => (
                          <button key={opt.v} type="button" onClick={() => setLessonForm(f => ({ ...f, type: opt.v }))}
                            style={{ flex: 1, border: `2px solid ${lessonForm.type === opt.v ? "#0a7d8a" : "#e2e8f0"}`, borderRadius: 10, padding: "0.55rem 0.5rem", fontFamily: "inherit", fontSize: "0.83rem", fontWeight: 600, cursor: "pointer", background: lessonForm.type === opt.v ? "#e6f7f8" : "#fff", color: lessonForm.type === opt.v ? "#0a7d8a" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                            <i className={`bi ${opt.icon}`}></i>
                            {lang === "ar" ? opt.ar : opt.en}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>{t("التاريخ *", "Date *")}</label>
                      <input className="inp" type="date" value={lessonForm.date} onChange={e => setLessonForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>{t("الوقت", "Time")}</label>
                      <input className="inp" type="time" value={lessonForm.time} onChange={e => setLessonForm(f => ({ ...f, time: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>{t("ملاحظات", "Notes")}</label>
                      <textarea className="inp" rows={2} value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} placeholder={t("ملاحظات اختيارية عن الدرس...", "Optional notes about this lesson...")} style={{ resize: "vertical" }} />
                    </div>
                  </div>
                  {lesError && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0.5rem 0 0" }}>{lesError}</p>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem", gap: "0.5rem" }}>
                    <button onClick={() => setShowAddLesson(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "0.55rem 1rem", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                      {t("إلغاء", "Cancel")}
                    </button>
                    <button className="btn-teal" onClick={addLesson} disabled={lesSaving}>
                      {lesSaving ? <><i className="bi bi-arrow-repeat spinner"></i>{t("حفظ...", "Saving...")}</> : <><i className="bi bi-floppy"></i>{t("حفظ الدرس", "Save Lesson")}</>}
                    </button>
                  </div>
                </div>
              )}

              <div className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <i className="bi bi-journal-text" style={{ color: "#7c3aed" }}></i>
                    {t("الدروس المسجّلة", "Registered Lessons")}
                    <span style={{ background: "#f5f3ff", color: "#7c3aed", borderRadius: 20, padding: "0.05rem 0.55rem", fontSize: "0.75rem", fontWeight: 700 }}>{lessons.length}</span>
                  </h4>
                </div>

                {lesLoading ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}><i className="bi bi-arrow-repeat spinner" style={{ fontSize: "1.6rem" }}></i></div>
                ) : lessons.length === 0 ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                    <i className="bi bi-journal-x" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                    <p style={{ fontSize: "0.88rem", margin: 0 }}>{t("لا توجد دروس بعد. أضف درسك الأول!", "No lessons yet. Add your first lesson!")}</p>
                  </div>
                ) : (
                  <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {sortedLessons.map(l => {
                      const lesAtt = allAttendance.filter(a => a.lessonId === l.id);
                      const lesPresent = lesAtt.filter(a => a.status === "present").length;
                      const hasAtt = lesAtt.length > 0;
                      return (
                        <div key={l.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "0.85rem 1rem", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{l.title}</span>
                              {l.subject && <span className="badge" style={{ background: "#f5f3ff", color: "#7c3aed" }}>{l.subject}</span>}
                              {l.type === "exam" && <span className="badge" style={{ background: "#fef3c7", color: "#b45309" }}><i className="bi bi-pen-fill" style={{ marginInlineEnd: "0.2rem" }}></i>{t("امتحان", "Exam")}</span>}
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#94a3b8", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                              <span><i className="bi bi-calendar3" style={{ marginInlineEnd: "0.25rem" }}></i>{l.date}</span>
                              {l.time && <span><i className="bi bi-clock" style={{ marginInlineEnd: "0.25rem" }}></i>{l.time}</span>}
                              {hasAtt && <span style={{ color: "#16a34a" }}><i className="bi bi-clipboard-check-fill" style={{ marginInlineEnd: "0.25rem" }}></i>{t(`${lesPresent}/${lesAtt.length} حاضر`, `${lesPresent}/${lesAtt.length} present`)}</span>}
                            </div>
                            {l.description && <p style={{ fontSize: "0.77rem", color: "#64748b", margin: "0.4rem 0 0", lineHeight: 1.5 }}>{l.description}</p>}
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                            <button onClick={() => handleSelectLesson(l, true)}
                              style={{ background: "#e6f7f8", border: "none", borderRadius: 8, padding: "0.35rem 0.75rem", cursor: "pointer", color: "#0a7d8a", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <i className="bi bi-clipboard-check"></i>{t("حضور", "Attend.")}
                            </button>
                            <button onClick={() => deleteLesson(l.id)}
                              style={{ background: "#fef2f2", border: "none", borderRadius: 8, padding: "0.35rem 0.6rem", cursor: "pointer", color: "#dc2626", fontSize: "0.82rem" }}>
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ ATTENDANCE TAB ═══════════════ */}
          {tab === "attendance" && (
            <div className="att-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1rem", alignItems: "start" }}>
              {/* Left: lesson list */}
              <div className="pcard" style={{ overflow: "hidden" }}>
                <div style={{ padding: "0.85rem 1rem", borderBottom: "2px solid #f1f5f9" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <i className="bi bi-journal-text" style={{ color: "#0a7d8a" }}></i>{t("اختر درساً", "Select a Lesson")}
                  </h4>
                </div>
                {lessons.length === 0 ? (
                  <div style={{ padding: "1.25rem 1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>{t("أضف دروساً أولاً", "Add lessons first")}</p>
                    <button className="btn-teal" style={{ marginTop: "0.65rem", fontSize: "0.78rem", padding: "0.4rem 0.85rem" }} onClick={() => setTab("lessons")}>
                      <i className="bi bi-plus-lg"></i>{t("إضافة درس", "Add Lesson")}
                    </button>
                  </div>
                ) : (
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {sortedLessons.map(l => {
                      const lesAtt = allAttendance.filter(a => a.lessonId === l.id);
                      const isSelected = selectedLesson?.id === l.id;
                      return (
                        <div key={l.id} onClick={() => handleSelectLesson(l)}
                          style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f8fafc", cursor: "pointer", background: isSelected ? "#e6f7f8" : "#fff", transition: "background 0.15s", borderInlineStart: isSelected ? "3px solid #0a7d8a" : "3px solid transparent" }}>
                          <div style={{ fontWeight: 600, fontSize: "0.83rem", color: isSelected ? "#0a7d8a" : "#1e293b", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            {l.title}
                            {l.type === "exam" && <span style={{ fontSize: "0.68rem", background: "#fef3c7", color: "#b45309", borderRadius: 4, padding: "0.05rem 0.35rem", fontWeight: 700 }}><i className="bi bi-pen-fill" style={{ marginInlineEnd: "0.15rem" }}></i>{t("امتحان", "Exam")}</span>}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                            {l.date}{l.time ? ` · ${l.time}` : ""}
                          </div>
                          {lesAtt.length > 0 && (
                            <div style={{ fontSize: "0.7rem", color: "#16a34a", marginTop: "0.15rem", fontWeight: 600 }}>
                              <i className="bi bi-check-circle-fill" style={{ marginInlineEnd: "0.2rem" }}></i>
                              {t(`${lesAtt.filter(a=>a.status==="present").length}/${lesAtt.length} حاضر`, `${lesAtt.filter(a=>a.status==="present").length}/${lesAtt.length} present`)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: attendance sheet */}
              <div className="pcard" style={{ overflow: "hidden" }}>
                {!selectedLesson ? (
                  <div style={{ padding: "3.5rem 2rem", textAlign: "center", color: "#94a3b8" }}>
                    <i className="bi bi-clipboard-check" style={{ fontSize: "2.8rem", display: "block", marginBottom: "0.75rem", color: "#cbd5e1" }}></i>
                    <p style={{ fontSize: "0.88rem", margin: 0 }}>{t("اختر درساً من القائمة لتسجيل الحضور", "Select a lesson from the list to record attendance")}</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div style={{ padding: "0.9rem 1.1rem", borderBottom: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem", background: "#fafafa" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>{selectedLesson.title}</div>
                        <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                          <i className="bi bi-calendar3" style={{ marginInlineEnd: "0.25rem" }}></i>{selectedLesson.date}
                          {selectedLesson.time && <span style={{ marginInlineStart: "0.6rem" }}><i className="bi bi-clock" style={{ marginInlineEnd: "0.25rem" }}></i>{selectedLesson.time}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                        {attSaved && <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}><i className="bi bi-check-circle-fill"></i>{t("تم الحفظ", "Saved")}</span>}
                        <button className="btn-teal" onClick={saveAttendance} disabled={attSaving || attLoading} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                          {attSaving ? <><i className="bi bi-arrow-repeat spinner"></i>{t("حفظ...", "Saving...")}</> : <><i className="bi bi-floppy"></i>{t("حفظ", "Save")}</>}
                        </button>
                      </div>
                    </div>

                    {/* Mark all row */}
                    {attendanceRecords.length > 0 && !attLoading && (
                      <div style={{ padding: "0.55rem 1.1rem", background: "#fffbeb", borderBottom: "1px solid #fef3c7", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.77rem", color: "#92400e", fontWeight: 700, marginInlineEnd: "0.3rem" }}>
                          <i className="bi bi-info-circle-fill" style={{ marginInlineEnd: "0.3rem" }}></i>
                          {t("الكل حاضر افتراضياً — اضغط على اسم الغائب لتغييره:", "All present by default — click absent student to change:")}
                        </span>
                        <div style={{ display: "flex", gap: "0.4rem", marginInlineStart: "auto" }}>
                          {(["present","absent","late"] as const).map(s => (
                            <button key={s} className="att-btn active" onClick={() => markAll(s)}
                              style={{ background: ATTENDANCE_COLORS[s].bg, color: ATTENDANCE_COLORS[s].color, borderColor: ATTENDANCE_COLORS[s].color, fontSize: "0.74rem" }}>
                              <i className={`bi ${ATTENDANCE_COLORS[s].icon}`} style={{ marginInlineEnd: "0.2rem" }}></i>
                              {t("الكل", "All")} {lang === "ar" ? ATTENDANCE_COLORS[s].ar : ATTENDANCE_COLORS[s].en}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {attLoading ? (
                      <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}><i className="bi bi-arrow-repeat spinner" style={{ fontSize: "1.6rem" }}></i></div>
                    ) : attendanceRecords.length === 0 ? (
                      <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                        {t("لا توجد بيانات طلاب في قسمك", "No students found in your department")}
                      </div>
                    ) : (
                      <>
                        {attendanceRecords.map((r, idx) => (
                          <div key={r.studentId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 1.1rem", borderBottom: "1px solid #f8fafc", fontSize: "0.85rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700, minWidth: 20 }}>{idx + 1}</span>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: ATTENDANCE_COLORS[r.status].bg, border: `2px solid ${ATTENDANCE_COLORS[r.status].color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: ATTENDANCE_COLORS[r.status].color, flexShrink: 0 }}>
                                {(r.studentName || "?").trim().split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?"}
                              </div>
                              <span style={{ fontWeight: 600, color: "#1e293b" }}>{r.studentName}</span>
                            </div>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                              {(["present","absent","late"] as const).map(s => (
                                <button key={s} className={`att-btn${r.status === s ? " active" : ""}`}
                                  onClick={() => toggleAttendance(r.studentId, s)}
                                  style={{ background: ATTENDANCE_COLORS[s].bg, color: ATTENDANCE_COLORS[s].color, borderColor: r.status === s ? ATTENDANCE_COLORS[s].color : "transparent" }}>
                                  <i className={`bi ${ATTENDANCE_COLORS[s].icon}`} style={{ marginInlineEnd: "0.2rem" }}></i>
                                  {lang === "ar" ? ATTENDANCE_COLORS[s].ar : ATTENDANCE_COLORS[s].en}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Summary footer */}
                        <div style={{ padding: "0.65rem 1.1rem", background: "#f8fafc", display: "flex", gap: "1.5rem", flexWrap: "wrap", borderTop: "2px solid #f1f5f9" }}>
                          {(["present","absent","late"] as const).map(s => (
                            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <i className={`bi ${ATTENDANCE_COLORS[s].icon}`} style={{ color: ATTENDANCE_COLORS[s].color, fontSize: "0.85rem" }}></i>
                              <span style={{ fontSize: "0.8rem", color: ATTENDANCE_COLORS[s].color, fontWeight: 700 }}>
                                {lang === "ar" ? ATTENDANCE_COLORS[s].ar : ATTENDANCE_COLORS[s].en}: {attendanceRecords.filter(r => r.status === s).length}
                              </span>
                            </div>
                          ))}
                          <span style={{ marginInlineStart: "auto", fontSize: "0.78rem", color: "#94a3b8" }}>
                            {t("نسبة الحضور:", "Rate:")} <strong style={{ color: "#0f172a" }}>{Math.round((attendanceRecords.filter(r=>r.status==="present").length / attendanceRecords.length)*100)}%</strong>
                          </span>
                        </div>
                      </>
                    )}

                    {/* ── Exam Grades Section ── */}
                    {selectedLesson?.type === "exam" && attendanceRecords.length > 0 && (
                      <div style={{ borderTop: "3px solid #fef3c7" }}>
                        <div style={{ padding: "0.85rem 1.1rem", background: "#fffbeb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <i className="bi bi-pen-fill" style={{ color: "#b45309", fontSize: "1rem" }}></i>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#92400e" }}>{t("نتائج الامتحان", "Exam Results")}</span>
                            <span style={{ fontSize: "0.75rem", color: "#b45309", background: "#fde68a", borderRadius: 20, padding: "0.05rem 0.5rem" }}>
                              {t(`ناجح: ${Object.values(gradeRecords).filter(v=>v==="pass").length}`, `Pass: ${Object.values(gradeRecords).filter(v=>v==="pass").length}`)}
                              {" · "}
                              {t(`راسب: ${Object.values(gradeRecords).filter(v=>v==="fail").length}`, `Fail: ${Object.values(gradeRecords).filter(v=>v==="fail").length}`)}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                            {gradesSaved && <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}><i className="bi bi-check-circle-fill"></i>{t("تم الحفظ", "Saved")}</span>}
                            <button className="btn-teal" onClick={saveGrades} disabled={gradesSaving} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem", background: "#b45309" }}>
                              {gradesSaving ? <><i className="bi bi-arrow-repeat spinner"></i>{t("حفظ...", "Saving...")}</> : <><i className="bi bi-floppy"></i>{t("حفظ النتائج", "Save Results")}</>}
                            </button>
                          </div>
                        </div>
                        {attendanceRecords.map((r, idx) => {
                          const gr = gradeRecords[r.studentId] ?? "none";
                          return (
                            <div key={r.studentId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.55rem 1.1rem", borderBottom: "1px solid #f8fafc", fontSize: "0.84rem", background: gr === "pass" ? "#f0fdf4" : gr === "fail" ? "#fff8f8" : "#fff" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700, minWidth: 20 }}>{idx + 1}</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>{r.studentName}</span>
                              </div>
                              <div style={{ display: "flex", gap: "0.35rem" }}>
                                {([{ v: "pass", arLabel: "ناجح", enLabel: "Pass", color: "#16a34a", bg: "#dcfce7" }, { v: "fail", arLabel: "راسب", enLabel: "Fail", color: "#dc2626", bg: "#fee2e2" }, { v: "none", arLabel: "—", enLabel: "—", color: "#94a3b8", bg: "#f1f5f9" }] as const).map(opt => (
                                  <button key={opt.v} onClick={() => setGradeRecords(prev => ({ ...prev, [r.studentId]: opt.v }))}
                                    style={{ border: `2px solid ${gr === opt.v ? opt.color : "transparent"}`, borderRadius: 7, padding: "0.2rem 0.65rem", cursor: "pointer", fontFamily: "inherit", fontSize: "0.77rem", fontWeight: 700, background: gr === opt.v ? opt.bg : "#f8fafc", color: gr === opt.v ? opt.color : "#94a3b8", opacity: gr === opt.v ? 1 : 0.5, transition: "all 0.15s" }}>
                                    {lang === "ar" ? opt.arLabel : opt.enLabel}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ REPORTS TAB ═══════════════ */}
          {tab === "reports" && (() => {
            // Total denominator = lessons that have ANY attendance record saved
            const recordedLessonIds = [...new Set(allAttendance.map(a => a.lessonId))];
            const totalRecorded     = recordedLessonIds.length;

            // Build per-student stats — seed all students with total = totalRecorded
            const statsMap: Record<string, { name: string; present: number; absent: number; late: number; total: number }> = {};
            for (const s of students) {
              statsMap[s.id] = { name: s.fullName, present: 0, absent: 0, late: 0, total: totalRecorded };
            }
            for (const a of allAttendance) {
              if (!statsMap[a.studentId]) statsMap[a.studentId] = { name: a.studentName, present: 0, absent: 0, late: 0, total: totalRecorded };
              if (a.status === "present") statsMap[a.studentId].present++;
              else if (a.status === "late") statsMap[a.studentId].late++;
            }
            // absent = total - present - late  (includes lessons with no record for this student)
            for (const id in statsMap) {
              const s = statsMap[id];
              s.absent = Math.max(0, s.total - s.present - s.late);
            }
            const rows = Object.entries(statsMap)
              .map(([id, s]) => ({ id, ...s, rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : null }))
              .sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101)); // worst first

            const totalLessonsCount = lessons.length;
            const atRisk  = rows.filter(r => r.rate !== null && r.rate < 75).length;
            const perfect = rows.filter(r => r.rate !== null && r.rate === 100).length;

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Summary cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.85rem" }}>
                  {[
                    { icon: "bi-journal-text",         color: "#7c3aed", bg: "#f5f3ff", value: totalLessonsCount, labelAr: "إجمالي الدروس",        labelEn: "Total Lessons" },
                    { icon: "bi-people-fill",           color: "#0a7d8a", bg: "#e6f7f8", value: students.length,  labelAr: "إجمالي الطلاب",        labelEn: "Total Students" },
                    { icon: "bi-exclamation-triangle-fill", color: "#dc2626", bg: "#fee2e2", value: atRisk,        labelAr: "طلاب في خطر (<75%)",   labelEn: "At Risk (<75%)" },
                    { icon: "bi-star-fill",             color: "#16a34a", bg: "#dcfce7", value: perfect,          labelAr: "حضور كامل (100%)",     labelEn: "Perfect (100%)" },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`bi ${s.icon}`} style={{ fontSize: "1.1rem", color: s.color }}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.2rem" }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="pcard" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <i className="bi bi-bar-chart-fill" style={{ color: "#7c3aed" }}></i>
                      {t("تفصيل الغياب لكل طالب", "Per-Student Absence Detail")}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {t("مرتّب: الأعلى غياباً أولاً", "Sorted: most absent first")}
                    </span>
                  </div>

                  {rows.length === 0 ? (
                    <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                      <i className="bi bi-bar-chart" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                      <p style={{ fontSize: "0.88rem", margin: 0 }}>{t("لا توجد بيانات حضور بعد. ابدأ بتسجيل الحضور في تبويب الحضور.", "No attendance data yet. Start recording in the Attendance tab.")}</p>
                    </div>
                  ) : (
                    <>
                      <div className="tbl-header" style={{ gridTemplateColumns: "2.5fr 2fr 1fr 1fr 1.8fr" }}>
                        <span>{t("الطالب", "Student")}</span>
                        <span style={{ textAlign: "center" }}>{t("المحاضرات (حضر / الكل)", "Lectures (Attended / Total)")}</span>
                        <span style={{ textAlign: "center", color: "#dc2626" }}>{t("غائب", "Absent")}</span>
                        <span style={{ textAlign: "center", color: "#d97706" }}>{t("متأخر", "Late")}</span>
                        <span style={{ textAlign: "center" }}>{t("نسبة الحضور", "Rate")}</span>
                      </div>

                      {rows.map(r => {
                        const rate      = r.rate;
                        const rateColor = rate === null ? "#94a3b8" : rate >= 75 ? "#16a34a" : rate >= 50 ? "#d97706" : "#dc2626";
                        const rateBg    = rate === null ? "#f8fafc" : rate >= 75 ? "#dcfce7" : rate >= 50 ? "#fef3c7" : "#fee2e2";

                        return (
                          <div key={r.id} className="tbl-row" onClick={() => { setSelectedStudentId(r.id); setModalSubTab("attendance"); setStudentWarnings([]); }} style={{ gridTemplateColumns: "2.5fr 2fr 1fr 1fr 1.8fr", cursor: "pointer" }}>

                            {/* Student name */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: rateBg, border: `2px solid ${rateColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: rateColor, flexShrink: 0 }}>
                                {(r.name || "?").trim().split(" ").slice(0, 2).map((w: string) => w[0] || "").join("").toUpperCase() || "?"}
                              </div>
                              <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{r.name}</span>
                            </div>

                            {/* Attended / Total  ← الجديد */}
                            <div style={{ textAlign: "center" }}>
                              {r.total === 0 ? (
                                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>—</span>
                              ) : (
                                <div>
                                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#16a34a" }}>{r.present}</span>
                                  <span style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0.3rem" }}>/</span>
                                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{r.total}</span>
                                  <span style={{ fontSize: "0.73rem", color: "#94a3b8", marginInlineStart: "0.3rem" }}>{t("محاضرة", "lec.")}</span>
                                </div>
                              )}
                            </div>

                            <span style={{ textAlign: "center", color: "#dc2626", fontWeight: 700 }}>{r.absent}</span>
                            <span style={{ textAlign: "center", color: "#d97706", fontWeight: 700 }}>{r.late}</span>

                            {/* Rate bar */}
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              {rate === null ? (
                                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>—</span>
                              ) : (
                                <div style={{ width: "100%", maxWidth: 110 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: rateColor }}>{rate}%</span>
                                  </div>
                                  <div style={{ height: 6, borderRadius: 3, background: "#e2e8f0" }}>
                                    <div style={{ height: "100%", width: `${rate}%`, borderRadius: 3, background: rateColor, transition: "width 0.4s" }}></div>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}

                      {/* Summary footer */}
                      <div style={{ padding: "0.8rem 1.25rem", background: "#f8fafc", borderTop: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                          <i className="bi bi-journal-text" style={{ color: "#7c3aed", marginInlineEnd: "0.35rem" }}></i>
                          {t("إجمالي المحاضرات في السنة:", "Total lectures this year:")}
                          <strong style={{ color: "#0f172a", fontSize: "0.95rem", marginInlineStart: "0.4rem" }}>{totalRecorded}</strong>
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                          <i className="bi bi-people-fill" style={{ color: "#0a7d8a", marginInlineEnd: "0.35rem" }}></i>
                          {t("إجمالي الطلاب:", "Total students:")}
                          <strong style={{ color: "#0f172a", fontSize: "0.95rem", marginInlineStart: "0.4rem" }}>{students.length}</strong>
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginInlineStart: "auto" }}>
                          {t("متوسط الحضور الكلي:", "Overall avg.:")}
                          <strong style={{ color: stats.rate >= 75 ? "#16a34a" : stats.rate >= 50 ? "#d97706" : "#dc2626", fontSize: "1rem", marginInlineStart: "0.4rem" }}>{stats.rate}%</strong>
                        </span>
                      </div>

                    </>
                  )}
                </div>

                {/* Per-lesson breakdown */}
                {lessons.length > 0 && (
                  <div className="pcard" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9" }}>
                      <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <i className="bi bi-calendar3" style={{ color: "#0a7d8a" }}></i>
                        {t("ملخص الدروس", "Lessons Summary")}
                      </h4>
                    </div>
                    <div style={{ padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "0.65rem" }}>
                      {sortedLessons.map(l => {
                        const lesAtt    = allAttendance.filter(a => a.lessonId === l.id);
                        const present   = lesAtt.filter(a => a.status === "present").length;
                        const absent    = lesAtt.filter(a => a.status === "absent").length;
                        const late      = lesAtt.filter(a => a.status === "late").length;
                        const total     = lesAtt.length;
                        const rate      = total > 0 ? Math.round((present / total) * 100) : null;
                        const rateColor = rate === null ? "#94a3b8" : rate >= 75 ? "#16a34a" : rate >= 50 ? "#d97706" : "#dc2626";
                        return (
                          <div key={l.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "0.85rem 1rem", background: "#fff" }}>
                            <div style={{ fontWeight: 700, fontSize: "0.83rem", color: "#0f172a", marginBottom: "0.15rem" }}>{l.title}</div>
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.55rem" }}>{l.date}{l.time ? ` · ${l.time}` : ""}</div>
                            {total === 0 ? (
                              <span style={{ fontSize: "0.73rem", color: "#94a3b8" }}>{t("لم يُسجَّل حضور بعد", "Attendance not recorded")}</span>
                            ) : (
                              <>
                                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.73rem", color: "#16a34a", fontWeight: 700 }}><i className="bi bi-check-circle-fill" style={{ marginInlineEnd: "0.2rem" }}></i>{present}</span>
                                  <span style={{ fontSize: "0.73rem", color: "#dc2626", fontWeight: 700 }}><i className="bi bi-x-circle-fill" style={{ marginInlineEnd: "0.2rem" }}></i>{absent}</span>
                                  {late > 0 && <span style={{ fontSize: "0.73rem", color: "#d97706", fontWeight: 700 }}><i className="bi bi-clock-fill" style={{ marginInlineEnd: "0.2rem" }}></i>{late}</span>}
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: "#e2e8f0" }}>
                                  <div style={{ height: "100%", width: `${rate}%`, borderRadius: 3, background: rateColor }}></div>
                                </div>
                                <div style={{ fontSize: "0.72rem", color: rateColor, fontWeight: 700, marginTop: "0.25rem" }}>{rate}% {t("حضور", "attendance")}</div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* ═══════════════ SETTINGS TAB ═══════════════ */}
          {tab === "settings" && (() => {
            const profInitials = (professor.fullName || "?").trim().split(" ").slice(0, 2).map((w: string) => w[0] || "").join("").toUpperCase() || "?";
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 600 }}>
                <div className="pcard" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="bi bi-person-badge-fill" style={{ color: "#0a7d8a", fontSize: "1rem" }}></i>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0 }}>{t("الصورة الشخصية","Profile Picture")}</h4>
                  </div>
                  <div style={{ padding: "1.5rem 1.25rem" }}>
                    {/* Avatar display */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {avatarPreview || avatar ? (
                          <img src={avatarPreview || avatar!} alt="avatar" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid #e2e8f0", display: "block" }} />
                        ) : (
                          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#e07b00,#f5a623)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                            {profInitials}
                          </div>
                        )}
                        {avatarPreview && (
                          <div style={{ position: "absolute", top: -4, insetInlineEnd: -4, background: "#d97706", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", border: "2px solid #fff" }}>
                            <i className="bi bi-pencil-fill"></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b", margin: "0 0 0.25rem" }}>{professor.fullName}</p>
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
                    {/* Save/Cancel */}
                    {avatarPreview && (
                      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", padding: "0.85rem 1rem", background: "#fffbeb", borderRadius: 10, border: "1px solid #fcd34d" }}>
                        <i className="bi bi-info-circle-fill" style={{ color: "#d97706", flexShrink: 0 }}></i>
                        <span style={{ flex: 1, fontSize: "0.82rem", color: "#92400e" }}>{t("لم تُحفَظ الصورة بعد. اضغط حفظ لتطبيق التغيير.","Photo not saved yet. Press save to apply.")}</span>
                        <button onClick={uploadAvatar} disabled={avatarSaving}
                          style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: 700, cursor: avatarSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                          {avatarSaving ? <i className="bi bi-arrow-repeat" style={{ animation: "spin 0.8s linear infinite" }}></i> : <i className="bi bi-check-lg"></i>}
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

                  <div style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>{t("كلمة المرور الحالية","Current Password")}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showCurPw ? "text" : "password"} value={pwForm.current}
                        onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required
                        style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 10, padding: `0.75rem ${isRtl ? "1rem" : "2.75rem"} 0.75rem ${isRtl ? "2.75rem" : "1rem"}`, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                      <button type="button" onClick={() => setShowCurPw(p => !p)}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "0.75rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: 0 }}>
                        <i className={`bi bi-eye${showCurPw ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>{t("كلمة المرور الجديدة","New Password")}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showNewPw ? "text" : "password"} value={pwForm.newPass}
                        onChange={e => setPwForm(p => ({ ...p, newPass: e.target.value }))} required minLength={4}
                        style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 10, padding: `0.75rem ${isRtl ? "1rem" : "2.75rem"} 0.75rem ${isRtl ? "2.75rem" : "1rem"}`, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                      <button type="button" onClick={() => setShowNewPw(p => !p)}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "0.75rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: 0 }}>
                        <i className={`bi bi-eye${showNewPw ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>{t("تأكيد كلمة المرور","Confirm New Password")}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showConPw ? "text" : "password"} value={pwForm.confirm}
                        onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required minLength={4}
                        style={{ width: "100%", border: "1.5px solid #cbd5e1", borderRadius: 10, padding: `0.75rem ${isRtl ? "1rem" : "2.75rem"} 0.75rem ${isRtl ? "2.75rem" : "1rem"}`, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                      <button type="button" onClick={() => setShowConPw(p => !p)}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "0.75rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: 0 }}>
                        <i className={`bi bi-eye${showConPw ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>

                  {pwMsg && (
                    <div style={{ padding: "0.6rem 0.9rem", borderRadius: 8, background: pwMsg.type === "ok" ? "#f0fdf4" : "#fef2f2", color: pwMsg.type === "ok" ? "#16a34a" : "#dc2626", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <i className={`bi ${pwMsg.type === "ok" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                      {pwMsg.text}
                    </div>
                  )}

                  <button type="submit" disabled={pwSaving}
                    style={{ alignSelf: "flex-start", background: "linear-gradient(135deg,#0a7d8a,#0ea5b5)", color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontSize: "0.88rem", fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem", opacity: pwSaving ? 0.7 : 1 }}>
                    {pwSaving ? <i className="bi bi-arrow-repeat" style={{ animation: "spin 0.8s linear infinite" }}></i> : <i className="bi bi-shield-check"></i>}
                    {t("حفظ كلمة المرور","Save Password")}
                  </button>
                </form>
              </div>

              </div>
            );
          })()}

        </div>
      </div>

      {/* ═══════════════ STUDENT PROFILE MODAL ═══════════════ */}
      {selectedStudentId && (() => {
        const stu        = students.find(s => s.id === selectedStudentId);
        if (!stu) return null;
        const stuAtt     = allAttendance.filter(a => a.studentId === selectedStudentId);
        const stuGrades  = grades.filter(g => g.studentId === selectedStudentId);

        // Attendance stats — denominator = all recorded lessons
        const recordedLessonIds = [...new Set(allAttendance.map(a => a.lessonId))];
        const totalLec   = recordedLessonIds.length;
        const present    = stuAtt.filter(a => a.status === "present").length;
        const absent     = Math.max(0, totalLec - present - stuAtt.filter(a => a.status === "late").length);
        const late       = stuAtt.filter(a => a.status === "late").length;
        const rate       = totalLec > 0 ? Math.round((present / totalLec) * 100) : null;
        const rateColor  = rate === null ? "#94a3b8" : rate >= 75 ? "#16a34a" : rate >= 50 ? "#d97706" : "#dc2626";
        const rateBg     = rate === null ? "#f8fafc" : rate >= 75 ? "#f0fdf4" : rate >= 50 ? "#fffbeb" : "#fef2f2";

        const stuInitials = (stu.fullName || "?").trim().split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";
        const stuStatus   = STATUS_CONFIG[stu.status] || STATUS_CONFIG.pending;

        // Sorted attendance records enriched with lesson info
        const sortedAtt = [...stuAtt].sort((a, b) => (b.lessonDate || "").localeCompare(a.lessonDate || ""));

        // Exams: lessons with type === "exam" from professor's lessons
        const examLessons = lessons.filter(l => l.type === "exam");

        const passCount  = stuGrades.filter(g => g.result === "pass").length;
        const failCount  = stuGrades.filter(g => g.result === "fail").length;

        return (
          <>
            {/* Backdrop */}
            <div onClick={() => setSelectedStudentId(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 900, backdropFilter: "blur(3px)" }} />

            {/* Modal card */}
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: "min(780px, 96vw)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: "'IBM Plex Sans Arabic','Segoe UI',sans-serif" }}>

              {/* Modal header */}
              <div style={{ padding: "1.1rem 1.4rem", borderBottom: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#0a7d8a 0%,#2e7d32 100%)", borderRadius: "20px 20px 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {stuInitials}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", margin: 0 }}>{stu.fullName}</h3>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem", margin: "0.1rem 0 0" }}>{stu.email}</p>
                  </div>
                  <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "0.15rem 0.65rem", fontSize: "0.73rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}>
                    {lang === "ar" ? stuStatus.ar : stuStatus.en}
                  </span>
                </div>
                <button onClick={() => setSelectedStudentId(null)}
                  style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "0.4rem 0.65rem", cursor: "pointer", color: "#fff", fontSize: "1.1rem" }}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div style={{ padding: "1.1rem 1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Info row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "0.65rem" }}>
                  {[
                    { icon: "bi-mortarboard-fill",   color: "#7c3aed", label: t("القسم",    "Department"), value: stu.department || "—" },
                    { icon: "bi-diagram-3-fill",      color: "#0a7d8a", label: t("الفرع",    "Branch"),     value: stu.branch || "—" },
                    { icon: "bi-phone-fill",          color: "#16a34a", label: t("الهاتف",   "Phone"),      value: stu.phone || "—" },
                    { icon: "bi-calendar3",           color: "#d97706", label: t("التسجيل",  "Joined"),     value: new Date(stu.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" }) },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "0.75rem 0.9rem", display: "flex", alignItems: "flex-start", gap: "0.55rem" }}>
                      <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: "1rem", marginTop: "0.1rem", flexShrink: 0 }}></i>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: "0.83rem", color: "#1e293b", fontWeight: 600, wordBreak: "break-word" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.65rem" }}>
                  {[
                    { icon: "bi-journal-text",      color: "#7c3aed", bg: "#f5f3ff", value: totalLec,  labelAr: "كل المحاضرات",  labelEn: "Total Lectures" },
                    { icon: "bi-check-circle-fill", color: "#16a34a", bg: "#dcfce7", value: present,   labelAr: "حاضر",          labelEn: "Present" },
                    { icon: "bi-x-circle-fill",     color: "#dc2626", bg: "#fee2e2", value: absent,    labelAr: "غائب",          labelEn: "Absent" },
                    { icon: "bi-clock-fill",        color: "#d97706", bg: "#fef3c7", value: late,      labelAr: "متأخر",         labelEn: "Late" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "0.85rem 0.9rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: "1.1rem", color: s.color, flexShrink: 0 }}></i>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "0.15rem" }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rate bar */}
                <div style={{ background: rateBg, borderRadius: 12, padding: "0.9rem 1.1rem", borderInlineStart: `4px solid ${rateColor}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 900, fontSize: "1.35rem", color: rateColor }}>{rate !== null ? `${rate}%` : "—"}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{t("نسبة الحضور", "Attendance Rate")}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "#e2e8f0" }}>
                    <div style={{ height: "100%", width: `${rate ?? 0}%`, borderRadius: 4, background: rateColor, transition: "width 0.4s" }}></div>
                  </div>
                  <div style={{ fontSize: "0.77rem", color: "#64748b", marginTop: "0.4rem" }}>
                    {t(`حضر ${present} من أصل ${totalLec} محاضرة`, `Attended ${present} out of ${totalLec} lectures`)}
                    {examLessons.length > 0 && ` · ${t(`امتحانات: ناجح ${passCount} / راسب ${failCount}`, `Exams: ${passCount} pass / ${failCount} fail`)}`}
                  </div>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: "flex", gap: "0.3rem", background: "#f1f5f9", borderRadius: 12, padding: "0.3rem" }}>
                  {([
                    { id: "attendance" as const, arLabel: "سجل الحضور", enLabel: "Attendance Log",  icon: "bi-clipboard-check-fill" },
                    { id: "exams"      as const, arLabel: "الامتحانات",  enLabel: "Exams",           icon: "bi-pen-fill" },
                    { id: "warnings"   as const, arLabel: "الإنذارات",   enLabel: "Warnings",        icon: "bi-exclamation-triangle-fill" },
                  ]).map(st => (
                    <button key={st.id} onClick={() => { setModalSubTab(st.id); if (st.id === "warnings") fetchStudentWarnings(selectedStudentId!); }}
                      style={{ flex: 1, border: "none", borderRadius: 9, padding: "0.5rem 0.75rem", fontFamily: "inherit", fontSize: "0.83rem", fontWeight: 700, cursor: "pointer", background: modalSubTab === st.id ? "#fff" : "transparent", color: modalSubTab === st.id ? (st.id === "warnings" ? "#dc2626" : "#0a7d8a") : "#64748b", boxShadow: modalSubTab === st.id ? "0 1px 6px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                      <i className={`bi ${st.icon}`}></i>
                      {lang === "ar" ? st.arLabel : st.enLabel}
                      {st.id === "warnings" && studentWarnings.filter(w => !w.isRead).length > 0 && (
                        <span style={{ background: "#dc2626", color: "#fff", borderRadius: 20, padding: "0.05rem 0.4rem", fontSize: "0.68rem" }}>{studentWarnings.filter(w => !w.isRead).length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── Attendance log ── */}
                {modalSubTab === "attendance" && (
                  <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.2fr 1fr", fontWeight: 700, fontSize: "0.74rem", color: "#94a3b8", background: "#f8fafc", padding: "0.55rem 1rem" }}>
                      <span style={{ minWidth: 28 }}>#</span>
                      <span>{t("عنوان المحاضرة", "Lecture Title")}</span>
                      <span>{t("التاريخ", "Date")}</span>
                      <span style={{ textAlign: "center" }}>{t("الحالة", "Status")}</span>
                    </div>
                    {sortedAtt.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                        <i className="bi bi-clipboard" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.4rem" }}></i>
                        {t("لا توجد سجلات حضور بعد", "No attendance records yet")}
                      </div>
                    ) : (
                      sortedAtt.map((a, idx) => {
                        const ac = ATTENDANCE_COLORS[a.status] || ATTENDANCE_COLORS.absent;
                        return (
                          <div key={`${a.lessonId}-${idx}`} style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.2fr 1fr", alignItems: "center", padding: "0.6rem 1rem", borderTop: "1px solid #f8fafc", fontSize: "0.83rem", background: a.status === "absent" ? "#fff8f8" : "#fff" }}>
                            <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700, minWidth: 28 }}>{sortedAtt.length - idx}</span>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>{a.lessonTitle || t("محاضرة", "Lecture")}</span>
                            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{a.lessonDate || "—"}</span>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <span style={{ background: ac.bg, color: ac.color, display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.18rem 0.55rem", borderRadius: 6, fontSize: "0.73rem", fontWeight: 700 }}>
                                <i className={`bi ${ac.icon}`} style={{ fontSize: "0.7rem" }}></i>
                                {lang === "ar" ? ac.ar : ac.en}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ── Exams ── */}
                {modalSubTab === "exams" && (
                  <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.2fr 1fr", fontWeight: 700, fontSize: "0.74rem", color: "#94a3b8", background: "#f8fafc", padding: "0.55rem 1rem" }}>
                      <span style={{ minWidth: 28 }}>#</span>
                      <span>{t("الامتحان", "Exam")}</span>
                      <span>{t("التاريخ", "Date")}</span>
                      <span style={{ textAlign: "center" }}>{t("النتيجة", "Result")}</span>
                    </div>
                    {examLessons.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                        <i className="bi bi-pen" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.4rem" }}></i>
                        {t("لا توجد امتحانات مسجّلة بعد", "No exams recorded yet")}
                      </div>
                    ) : (
                      examLessons.map((exam, idx) => {
                        const gr = stuGrades.find(g => g.examId === exam.id);
                        const isPass = gr?.result === "pass";
                        const isFail = gr?.result === "fail";
                        return (
                          <div key={exam.id} style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.2fr 1fr", alignItems: "center", padding: "0.6rem 1rem", borderTop: "1px solid #f8fafc", fontSize: "0.83rem", background: isPass ? "#f0fdf4" : isFail ? "#fff8f8" : "#fff" }}>
                            <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700, minWidth: 28 }}>{idx + 1}</span>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>{exam.title}{exam.subject ? <span style={{ fontSize: "0.73rem", color: "#94a3b8", marginInlineStart: "0.4rem" }}>({exam.subject})</span> : null}</span>
                            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{exam.date}</span>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              {!gr ? (
                                <span style={{ background: "#f1f5f9", color: "#94a3b8", padding: "0.18rem 0.55rem", borderRadius: 6, fontSize: "0.73rem", fontWeight: 700 }}>{t("لم تُسجَّل", "Not set")}</span>
                              ) : isPass ? (
                                <span style={{ background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.18rem 0.65rem", borderRadius: 6, fontSize: "0.8rem", fontWeight: 800 }}>
                                  <i className="bi bi-check-circle-fill" style={{ fontSize: "0.75rem" }}></i>{t("ناجح", "Pass")}
                                </span>
                              ) : (
                                <span style={{ background: "#fee2e2", color: "#dc2626", display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.18rem 0.65rem", borderRadius: 6, fontSize: "0.8rem", fontWeight: 800 }}>
                                  <i className="bi bi-x-circle-fill" style={{ fontSize: "0.75rem" }}></i>{t("راسب", "Fail")}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {examLessons.length > 0 && (
                      <div style={{ padding: "0.65rem 1rem", background: "#f8fafc", borderTop: "2px solid #f1f5f9", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <i className="bi bi-check-circle-fill"></i>{t("ناجح:", "Pass:")} {passCount}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <i className="bi bi-x-circle-fill"></i>{t("راسب:", "Fail:")} {failCount}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
                          {t("إجمالي الامتحانات:", "Total exams:")} {examLessons.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Warnings tab ── */}
                {modalSubTab === "warnings" && (() => {
                  const WARN_SEV: Record<string, { color: string; bg: string; icon: string; ar: string }> = {
                    high:   { color: "#dc2626", bg: "#fef2f2", icon: "bi-exclamation-triangle-fill", ar: "عالي" },
                    medium: { color: "#d97706", bg: "#fffbeb", icon: "bi-exclamation-circle-fill",   ar: "متوسط" },
                    low:    { color: "#0a7d8a", bg: "#f0fdfa", icon: "bi-info-circle-fill",           ar: "منخفض" },
                  };
                  const WARN_TYPES = ["غياب","أكاديمي","سلوك","تأخر","أقساط","عام"];
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      {/* Send warning form */}
                      <div style={{ background: "#fef2f2", borderRadius: 14, padding: "1rem 1.15rem", border: "1.5px solid #fca5a5" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#dc2626", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <i className="bi bi-bell-fill"></i>
                          {t("إرسال إنذار جديد", "Send New Warning")}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.65rem" }}>
                          <div>
                            <label style={{ fontSize: "0.73rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>{t("نوع الإنذار", "Type")}</label>
                            <select value={warnForm.type} onChange={e => setWarnForm(f => ({ ...f, type: e.target.value }))}
                              style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: "0.82rem", background: "#fff" }}>
                              {WARN_TYPES.map(wt => <option key={wt} value={wt}>{wt}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.73rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>{t("درجة الخطورة", "Severity")}</label>
                            <select value={warnForm.severity} onChange={e => setWarnForm(f => ({ ...f, severity: e.target.value as "high" | "medium" | "low" }))}
                              style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: "0.82rem", background: "#fff" }}>
                              <option value="high">{t("عالي","High")}</option>
                              <option value="medium">{t("متوسط","Medium")}</option>
                              <option value="low">{t("منخفض","Low")}</option>
                            </select>
                          </div>
                        </div>
                        <textarea value={warnForm.message} onChange={e => setWarnForm(f => ({ ...f, message: e.target.value }))}
                          placeholder={t("اكتب نص الإنذار...","Write warning message...")}
                          rows={3}
                          style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: "0.83rem", resize: "vertical", marginBottom: "0.6rem", display: "block" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <button onClick={sendWarning} disabled={warnSending || !warnForm.message.trim()}
                            style={{ background: warnSending ? "#e2e8f0" : "#dc2626", color: warnSending ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, padding: "0.45rem 1.1rem", fontFamily: "inherit", fontSize: "0.83rem", fontWeight: 700, cursor: warnSending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {warnSending ? <i className="bi bi-arrow-repeat" style={{ animation: "spin 0.8s linear infinite" }}></i> : <i className="bi bi-send-fill"></i>}
                            {t("إرسال الإنذار", "Send Warning")}
                          </button>
                          {warnSent && <span style={{ color: "#16a34a", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}><i className="bi bi-check-circle-fill"></i>{t("تم الإرسال","Sent!")}</span>}
                        </div>
                      </div>
                      {/* Warning history */}
                      <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ padding: "0.65rem 1rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: "0.82rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <i className="bi bi-clock-history" style={{ color: "#0a7d8a" }}></i>
                          {t("سجل الإنذارات","Warnings History")}
                          {studentWarnings.length > 0 && <span style={{ background: "#e2e8f0", color: "#64748b", borderRadius: 20, padding: "0.05rem 0.45rem", fontSize: "0.72rem" }}>{studentWarnings.length}</span>}
                        </div>
                        {warnLoading ? (
                          <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}><i className="bi bi-arrow-repeat" style={{ animation: "spin 0.8s linear infinite", fontSize: "1.4rem" }}></i></div>
                        ) : studentWarnings.length === 0 ? (
                          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                            <i className="bi bi-check-circle" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.4rem", color: "#86efac" }}></i>
                            <span style={{ fontSize: "0.85rem" }}>{t("لا توجد إنذارات مسجّلة","No warnings recorded")}</span>
                          </div>
                        ) : (
                          [...studentWarnings].sort((a: any, b: any) => b.date.localeCompare(a.date)).map((w: any, idx: number) => {
                            const sev = WARN_SEV[w.severity] || WARN_SEV.medium;
                            return (
                              <div key={w.id} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem 1rem", borderBottom: idx < studentWarnings.length - 1 ? "1px solid #f8fafc" : "none", background: !w.isRead ? sev.bg : "#fff", alignItems: "flex-start" }}>
                                <i className={`bi ${sev.icon}`} style={{ color: sev.color, fontSize: "0.95rem", marginTop: "0.2rem", flexShrink: 0 }}></i>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#1e293b" }}>{w.type}</span>
                                    <span style={{ background: sev.bg, color: sev.color, fontSize: "0.68rem", padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 600 }}>{sev.ar}</span>
                                    {!w.isRead && <span style={{ background: "#dc2626", color: "#fff", fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>{t("جديد","New")}</span>}
                                  </div>
                                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.82rem", color: "#475569" }}>{w.message}</p>
                                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{w.date}</span>
                                </div>
                                <button onClick={() => deleteWarning(w.id)}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "0.2rem 0.35rem", borderRadius: 6, flexShrink: 0, opacity: 0.6 }}>
                                  <i className="bi bi-trash3"></i>
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          </>
        );
      })()}

      {siteData && <Footer footerData={footerData} locale={locale} />}
    </div>
  );
}
