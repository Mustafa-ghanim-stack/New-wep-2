"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { dict, type Lang } from "./translations";

type Msg = Record<string, any>;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

function getAPIBase(): string {
  return `/api/content?token=${getToken()}`;
}

const tabIcons: Record<string, string> = {
  dashboard: "📊",
  site: "🌐",
  topbar: "📋",
  nav: "📑",
  hero: "🎬",
  quicklinks: "🔗",
  features: "⭐",
  sidecards: "🃏",
  highlight: "💡",
  news: "📰",
  footer: "📌",
  chat: "🤖",
  theme: "🎨",
  admins: "👥",
};

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block mb-3">
      <span className="text-xs font-semibold text-gray-600 block mb-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block mb-3">
      <span className="text-xs font-semibold text-gray-600 block mb-1">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-y transition-all" />
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block mb-3">
      <span className="text-xs font-semibold text-gray-600 block mb-1">{label}</span>
      <div className="flex gap-2 items-center">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
      </div>
    </label>
  );
}

function SectionCard({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <span className="font-bold text-sm text-gray-800">{title}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-5 border-t border-gray-200">{children}</div>}
    </div>
  );
}

function toastColors(type: "success" | "error" | "info") {
  return type === "success" ? "bg-green-700"
    : type === "error" ? "bg-red-700"
    : "bg-blue-700";
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`${toastColors(type)} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[250px]`}>
        <span className="text-sm font-medium flex-1">{msg}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">×</button>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">إلغاء</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">حذف</button>
        </div>
      </div>
    </div>
  );
}

function ImgInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  const isUrl = value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
  return (
    <label className="block mb-3">
      <span className="text-xs font-semibold text-gray-600 block mb-1">{label}</span>
      <div className="flex gap-2 items-center">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-xs" />
        {isUrl && (
          <button type="button" onClick={() => setPreview(!preview)} className="text-xs px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            {preview ? "✕" : "👁"}
          </button>
        )}
      </div>
      {isUrl && preview && (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-50">
          <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
    </label>
  );
}

function FieldEditor({ items, setItems, fields, t: _t }: { items: Record<string, any>[]; setItems: (v: any[]) => void; fields: { key: string; label: string }[]; t?: (k: string) => string }) {
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const moveUp = (i: number) => { if (i <= 0) return; const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setItems(n); };
  const moveDown = (i: number) => { if (i >= items.length - 1) return; const n = [...items]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setItems(n); };
  const tr = _t || ((s: string) => s);
  const hasImg = fields.some((f) => f.key === "img");
  return (
    <div className="space-y-3">
      {confirmIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmIdx(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{tr("confirm_title")}</h3>
            <p className="text-sm text-gray-600 mb-6">{tr("confirm_delete")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmIdx(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">{tr("cancel")}</button>
              <button onClick={() => { setItems(items.filter((_, j) => j !== confirmIdx)); setConfirmIdx(null); }} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">{tr("confirm_btn")}</button>
            </div>
          </div>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 relative bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              <button onClick={() => moveUp(i)} disabled={i === 0} className="px-1.5 py-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded text-xs font-bold transition-colors">▲</button>
              <button onClick={() => moveDown(i)} disabled={i >= items.length - 1} className="px-1.5 py-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded text-xs font-bold transition-colors">▼</button>
            </div>
            <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
            <button onClick={() => setConfirmIdx(i)} className="px-2 py-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded text-sm transition-colors">✕</button>
          </div>
          {fields.map(({ key, label }) =>
            key === "img" ? (
              <ImgInput key={key} label={label} value={item[key] || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], [key]: v }; setItems(next); }} />
            ) : key.includes("desc") ? (
              <Textarea key={key} label={label} value={item[key] || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], [key]: v }; setItems(next); }} />
            ) : (
              <Input key={key} label={label} value={item[key] || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], [key]: v }; setItems(next); }} />
            )
          )}
        </div>
      ))}
      <button onClick={() => { const obj: Record<string, string> = {}; fields.forEach(({ key }) => (obj[key] = "")); setItems([...items, obj]); }} className="w-full border-2 border-dashed border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 rounded-lg py-3 text-xs text-gray-500 hover:text-cyan-700 font-medium transition-all">+ Add Item</button>
    </div>
  );
}

function NavEditor({ nav, setNav, t }: { nav: any[]; setNav: (v: any[]) => void; t: (k: string) => string }) {
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const moveUp = (i: number) => { if (i <= 0) return; const n = [...nav]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setNav(n); };
  const moveDown = (i: number) => { if (i >= nav.length - 1) return; const n = [...nav]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setNav(n); };
  return (
    <div className="space-y-4">
      {confirmIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmIdx(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("confirm_title")}</h3>
            <p className="text-sm text-gray-600 mb-6">{t("confirm_delete")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmIdx(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">{t("cancel")}</button>
              <button onClick={() => { setNav(nav.filter((_, j) => j !== confirmIdx)); setConfirmIdx(null); }} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">{t("confirm_btn")}</button>
            </div>
          </div>
        </div>
      )}
      <span className="text-xs font-semibold text-gray-600 block">{t("nav.label")}</span>
      {nav.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center gap-1 mb-2">
            <button onClick={() => moveUp(i)} disabled={i === 0} className="px-1.5 py-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded text-xs font-bold transition-colors">▲</button>
            <button onClick={() => moveDown(i)} disabled={i >= nav.length - 1} className="px-1.5 py-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded text-xs font-bold transition-colors">▼</button>
            <input type="text" value={item.label} onChange={(e) => { const next = [...nav]; next[i] = { ...next[i], label: e.target.value }; setNav(next); }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" placeholder={t("nav.menu_label")} />
            <button onClick={() => setConfirmIdx(i)} className="px-2 py-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded text-sm transition-colors">✕</button>
          </div>
          <Input label={t("nav.href")} value={item.href || ""} onChange={(v) => { const next = [...nav]; next[i] = { ...next[i], href: v }; setNav(next); }} />
          {item.children && (
            <div className="space-y-2 mb-2 mt-3 bg-gray-50 rounded-lg p-3">
              <span className="text-xs font-semibold text-gray-600 block">{t("nav.dropdown_items")}</span>
              {item.children.map((child: any, j: number) => (
                <div key={j} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <input type="text" value={typeof child === "string" ? child : child.label || ""}
                      onChange={(e) => { const next = [...nav]; const ch = [...next[i].children]; ch[j] = typeof child === "string" ? e.target.value : { ...ch[j], label: e.target.value }; next[i] = { ...next[i], children: ch }; setNav(next); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                      placeholder={t("nav.menu_label")} />
                    {typeof child !== "string" && (
                      <input type="text" value={child.href || ""}
                        onChange={(e) => { const next = [...nav]; const ch = [...next[i].children]; ch[j] = { ...ch[j], href: e.target.value }; next[i] = { ...next[i], children: ch }; setNav(next); }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                        placeholder={t("nav.href")} />
                    )}
                  </div>
                  <button onClick={() => { const next = [...nav]; next[i] = { ...next[i], children: next[i].children.filter((_: any, k: number) => k !== j) }; setNav(next); }}
                    className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm mt-1 transition-colors">✕</button>
                </div>
              ))}
              <button onClick={() => { const next = [...nav]; next[i] = { ...next[i], children: [...next[i].children, { label: "", href: "" }] }; setNav(next); }}
                className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">{t("add_item")}</button>
            </div>
          )}
          <div className="flex gap-2 mt-1">
            {!item.children ? (
              <button onClick={() => { const next = [...nav]; next[i] = { ...next[i], children: [] }; setNav(next); }} className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">{t("nav.add_dropdown")}</button>
            ) : (
              <button onClick={() => { const next = [...nav]; const { children, ...rest } = next[i]; next[i] = rest; setNav(next); }} className="text-xs text-orange-600 hover:text-orange-800 font-medium">{t("nav.remove_dropdown")}</button>
            )}
          </div>
        </div>
      ))}
      <button onClick={() => setNav([...nav, { label: "", href: "", children: [] }])} className="w-full border-2 border-dashed border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 rounded-lg py-3 text-xs text-gray-500 hover:text-cyan-700 font-medium transition-all">{t("nav.add_menu")}</button>
    </div>
  );
}

function DashboardCard({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ ar, en, t }: { ar: Msg; en: Msg; t: (k: string) => string }) {
  const cards = [
    { icon: "📑", label: t("dashboard.nav_items"), count: Math.max(ar.nav?.length || 0, en.nav?.length || 0) },
    { icon: "🎬", label: t("dashboard.hero_slides"), count: Math.max(ar.hero?.length || 0, en.hero?.length || 0) },
    { icon: "⭐", label: t("dashboard.features"), count: Math.max(ar.features?.length || 0, en.features?.length || 0) },
    { icon: "🃏", label: t("dashboard.sidecards"), count: Math.max(ar.sidecards?.length || 0, en.sidecards?.length || 0) },
    { icon: "📰", label: t("dashboard.news_items"), count: Math.max(ar.news?.items?.length || 0, en.news?.items?.length || 0) },
    { icon: "📅", label: t("dashboard.event_items"), count: Math.max(ar.events?.items?.length || 0, en.events?.items?.length || 0) },
    { icon: "🔗", label: t("dashboard.footer_links"), count: Math.max(ar.footer?.quicklinks?.items?.length || 0, en.footer?.quicklinks?.items?.length || 0) },
    { icon: "🤖", label: t("dashboard.chat_responses"), count: Math.max(ar.chat?.responses?.length || 0, en.chat?.responses?.length || 0) },
  ];
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.welcome")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("dashboard.desc")}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => <DashboardCard key={c.label} {...c} />)}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>("ar");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("dashboard");

  const [ar, setAr] = useState<Msg>({});
  const [en, setEn] = useState<Msg>({});
  const [theme, setTheme] = useState<Record<string, string>>({});

  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [adminMsg, setAdminMsg] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [lastSaved, setLastSaved] = useState<string>("");

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg(msg); setToastType(type);
  }, []);

  const t = useCallback((key: string) => dict[lang]?.[key] || dict.en[key] || key, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as Lang | null;
    if (saved) setLang(saved);
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(getAPIBase());
      if (!r.ok) { router.replace("/login"); return; }
      const d = await r.json();
      setAr(d.ar);
      setEn(d.en);
      setTheme(d.theme);
    } catch { router.replace("/login"); }
    setLoading(false);
  }, [router]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  function toggleLang() {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem("admin_lang", next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const r = await fetch(getAPIBase(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ar, en, theme }) });
      if (r.ok) {
        showToast(t("panel.saved"), "success");
        setLastSaved(new Date().toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } else {
        showToast(t("panel.save_failed"), "error");
      }
    } catch { showToast(t("panel.save_failed"), "error"); }
    setSaving(false);
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault(); setAdminMsg("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ username: newAdminUser, password: newAdminPass }),
      });
      const d = await r.json();
      if (r.ok) { showToast(t("admins.created"), "success"); setNewAdminUser(""); setNewAdminPass(""); }
      else setAdminMsg(d.error || t("panel.save_failed"));
    } catch { setAdminMsg(t("panel.conn_err")); }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token"); localStorage.removeItem("admin_user");
    router.replace("/login");
  }

  if (!ready) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" /><p className="text-gray-500 text-sm">{t("panel.loading")}</p></div></div>;

  const tabs = [
    { id: "dashboard", label: t("dashboard") },
    { id: "site", label: t("tab.site") },
    { id: "topbar", label: t("tab.topbar") },
    { id: "nav", label: t("tab.nav") },
    { id: "hero", label: t("tab.hero") },
    { id: "quicklinks", label: t("tab.quicklinks") },
    { id: "features", label: t("tab.features") },
    { id: "sidecards", label: t("tab.sidecards") },
    { id: "highlight", label: t("tab.highlight") },
    { id: "news", label: t("tab.news") },
    { id: "footer", label: t("tab.footer") },
    { id: "chat", label: t("tab.chat") },
    { id: "theme", label: t("tab.theme") },
    { id: "admins", label: t("tab.admins") },
  ];

  const username = typeof window !== "undefined" ? localStorage.getItem("admin_user") : "";

  return (
    <div className={`min-h-screen bg-gray-100 ${lang === "ar" ? "text-right" : ""}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {toastMsg && <Toast msg={toastMsg} type={toastType} onClose={() => setToastMsg("")} />}

      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800">{t("panel.title")}</h1>
            {lastSaved && (
              <span className="text-xs text-gray-400 hidden sm:inline">{t("saved_at")} {lastSaved}</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <a href="/" target="_blank" className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
              {t("panel.open_site")}
            </a>
            <button onClick={toggleLang} className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
              {lang === "ar" ? "English" : "العربية"}
            </button>
            {username && <span className="text-xs text-gray-500">{t("panel.login_as")} <strong>{username}</strong></span>}
            <button onClick={handleSave} disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? t("panel.saving") : t("panel.save")}
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">{t("panel.logout")}</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border p-2 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {tabs.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  tab === id ? "bg-cyan-100 text-cyan-800 shadow-sm" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <span className="text-base">{tabIcons[id] || "•"}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {tab === "dashboard" && (
            <Dashboard ar={ar} en={en} t={t} />
          )}

          {tab === "site" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("site.title")}</h2>
              <SectionCard title={t("label.ar")} defaultOpen>
                <Input label={t("site.title_label")} value={ar.site?.title || ""} onChange={(v) => setAr({ ...ar, site: { ...ar.site, title: v } })} />
                <Textarea label={t("site.desc_label")} value={ar.site?.desc || ""} onChange={(v) => setAr({ ...ar, site: { ...ar.site, desc: v } })} />
                <Input label={t("site.name_label")} value={ar.site?.name || ""} onChange={(v) => setAr({ ...ar, site: { ...ar.site, name: v } })} />
              </SectionCard>
              <SectionCard title={t("label.en")} defaultOpen>
                <Input label={t("site.title_label")} value={en.site?.title || ""} onChange={(v) => setEn({ ...en, site: { ...en.site, title: v } })} />
                <Textarea label={t("site.desc_label")} value={en.site?.desc || ""} onChange={(v) => setEn({ ...en, site: { ...en.site, desc: v } })} />
                <Input label={t("site.name_label")} value={en.site?.name || ""} onChange={(v) => setEn({ ...en, site: { ...en.site, name: v } })} />
              </SectionCard>
            </div>
          )}

          {tab === "topbar" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("topbar.section")}</h2>
              <SectionCard title={t("label.ar")} defaultOpen>
                {["english", "arabic", "login", "students", "employees", "applicants"].map((f) => (
                  <Input key={f} label={t("topbar." + f)} value={ar.topbar?.[f] || ""} onChange={(v) => setAr({ ...ar, topbar: { ...ar.topbar, [f]: v } })} />
                ))}
              </SectionCard>
              <SectionCard title={t("label.en")} defaultOpen>
                {["english", "arabic", "login", "students", "employees", "applicants"].map((f) => (
                  <Input key={f} label={t("topbar." + f)} value={en.topbar?.[f] || ""} onChange={(v) => setEn({ ...en, topbar: { ...en.topbar, [f]: v } })} />
                ))}
              </SectionCard>
            </div>
          )}

          {tab === "nav" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("tab.nav")}</h2>
              <SectionCard title={t("label.ar_nav")} defaultOpen>
                <NavEditor nav={convertChildren(ar.nav)} setNav={(v) => setAr({ ...ar, nav: v })} t={t} />
              </SectionCard>
              <SectionCard title={t("label.en_nav")} defaultOpen>
                <NavEditor nav={convertChildren(en.nav)} setNav={(v) => setEn({ ...en, nav: v })} t={t} />
              </SectionCard>
            </div>
          )}

          {tab === "hero" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("hero.section")}</h2>
              <SectionCard title={t("label.ar_slides")} defaultOpen>
                <FieldEditor items={ar.hero || []} setItems={(v) => setAr({ ...ar, hero: v })} fields={[{key:"title",label:t("hero.title")},{key:"desc",label:t("hero.desc")},{key:"img",label:t("hero.img")}]} t={t} />
              </SectionCard>
              <SectionCard title={t("label.en_slides")} defaultOpen>
                <FieldEditor items={en.hero || []} setItems={(v) => setEn({ ...en, hero: v })} fields={[{key:"title",label:t("hero.title")},{key:"desc",label:t("hero.desc")},{key:"img",label:t("hero.img")}]} t={t} />
              </SectionCard>
            </div>
          )}

          {tab === "quicklinks" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("quicklinks.section")}</h2>
              <SectionCard title={t("label.ar")} defaultOpen>
                <FieldEditor items={convertQl(ar.quicklinks)} setItems={(v) => setAr({ ...ar, quicklinks: v })} fields={[{key:"label",label:"Label"},{key:"href",label:"Href"}]} t={t} />
              </SectionCard>
              <SectionCard title={t("label.en")} defaultOpen>
                <FieldEditor items={convertQl(en.quicklinks)} setItems={(v) => setEn({ ...en, quicklinks: v })} fields={[{key:"label",label:"Label"},{key:"href",label:"Href"}]} t={t} />
              </SectionCard>
            </div>
          )}

          {tab === "features" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("features.section")}</h2>
              <SectionCard title={t("label.ar")} defaultOpen>
                <FieldEditor items={ar.features || []} setItems={(v) => setAr({ ...ar, features: v })} fields={[{key:"title",label:t("features.title")},{key:"desc",label:t("features.desc")},{key:"more",label:t("features.more")},{key:"href",label:t("features.href")}]} t={t} />
              </SectionCard>
              <SectionCard title={t("label.en")} defaultOpen>
                <FieldEditor items={en.features || []} setItems={(v) => setEn({ ...en, features: v })} fields={[{key:"title",label:t("features.title")},{key:"desc",label:t("features.desc")},{key:"more",label:t("features.more")},{key:"href",label:t("features.href")}]} t={t} />
              </SectionCard>
            </div>
          )}

          {tab === "sidecards" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("sidecards.section")}</h2>
              <SectionCard title={t("label.ar")} defaultOpen>
                <FieldEditor items={ar.sidecards || []} setItems={(v) => setAr({ ...ar, sidecards: v })} fields={[{key:"title",label:t("features.title")},{key:"desc",label:t("features.desc")},{key:"more",label:t("features.more")},{key:"href",label:t("features.href")}]} t={t} />
              </SectionCard>
              <SectionCard title={t("label.en")} defaultOpen>
                <FieldEditor items={en.sidecards || []} setItems={(v) => setEn({ ...en, sidecards: v })} fields={[{key:"title",label:t("features.title")},{key:"desc",label:t("features.desc")},{key:"more",label:t("features.more")},{key:"href",label:t("features.href")}]} t={t} />
              </SectionCard>
            </div>
          )}

          {tab === "highlight" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("highlight.section")}</h2>
              <SectionCard title={t("arabic")} defaultOpen>
                {["title", "desc", "cta", "campaign_title", "campaign_sub", "campaign_desc", "campaign_cta"].map((f) =>
                  f.includes("desc") ? (
                    <Textarea key={f} label={t("highlight." + f)} value={ar.highlight?.[f] || ""} onChange={(v) => setAr({ ...ar, highlight: { ...ar.highlight, [f]: v } })} />
                  ) : (
                    <Input key={f} label={t("highlight." + f)} value={ar.highlight?.[f] || ""} onChange={(v) => setAr({ ...ar, highlight: { ...ar.highlight, [f]: v } })} />
                  )
                )}
              </SectionCard>
              <SectionCard title={t("english")} defaultOpen>
                {["title", "desc", "cta", "campaign_title", "campaign_sub", "campaign_desc", "campaign_cta"].map((f) =>
                  f.includes("desc") ? (
                    <Textarea key={f} label={t("highlight." + f)} value={en.highlight?.[f] || ""} onChange={(v) => setEn({ ...en, highlight: { ...en.highlight, [f]: v } })} />
                  ) : (
                    <Input key={f} label={t("highlight." + f)} value={en.highlight?.[f] || ""} onChange={(v) => setEn({ ...en, highlight: { ...en.highlight, [f]: v } })} />
                  )
                )}
              </SectionCard>
            </div>
          )}

          {tab === "news" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("news.section")}</h2>
              {["ar", "en"].map((l) => {
                const data = l === "ar" ? ar : en;
                const set = l === "ar" ? setAr : setEn;
                const langLabel = l === "ar" ? t("arabic") : t("english");
                return (
                  <div key={l}>
                    <SectionCard title={t("news.news") + " - " + langLabel} defaultOpen>
                      <Input label={t("news.section_title")} value={data.news?.title || ""} onChange={(v) => set({ ...data, news: { ...data.news, title: v } })} />
                      <Input label={t("news.all_link")} value={data.news?.all || ""} onChange={(v) => set({ ...data, news: { ...data.news, all: v } })} />
                      <FieldEditor items={data.news?.items || []} setItems={(v) => set({ ...data, news: { ...data.news, items: v } })} fields={[{key:"date",label:t("news.date")},{key:"title",label:t("news.title")},{key:"href",label:t("news.href")}]} t={t} />
                    </SectionCard>
                    <SectionCard title={t("news.events") + " - " + langLabel} defaultOpen>
                      <Input label={t("news.section_title")} value={data.events?.title || ""} onChange={(v) => set({ ...data, events: { ...data.events, title: v } })} />
                      <Input label={t("news.all_link")} value={data.events?.all || ""} onChange={(v) => set({ ...data, events: { ...data.events, all: v } })} />
                      <FieldEditor items={data.events?.items || []} setItems={(v) => set({ ...data, events: { ...data.events, items: v } })} fields={[{key:"date",label:t("news.date")},{key:"title",label:t("news.title")},{key:"href",label:t("news.href")}]} t={t} />
                    </SectionCard>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "footer" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("footer.section")}</h2>
              {([["ar", ar, setAr], ["en", en, setEn]] as const).map(([locale, data, set]) => (
                <SectionCard key={locale} title={locale === "ar" ? t("arabic") : t("english")} defaultOpen>
                  <Input label={t("footer.quicklinks_title")} value={data.footer?.quicklinks?.title || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, quicklinks: { ...data.footer?.quicklinks, title: v } } })} />
                  <label className="block mb-3">
                    <span className="text-xs font-semibold text-gray-600 block mb-1">{t("footer.quicklinks_items")}</span>
                    {data.footer?.quicklinks?.items?.map((item: any, i: number) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <input type="text" value={typeof item === "string" ? item : item.label || ""}
                          onChange={(e) => { const ql = [...data.footer.quicklinks.items]; ql[i] = e.target.value; set({ ...data, footer: { ...data.footer, quicklinks: { ...data.footer?.quicklinks, items: ql } } }); }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                        <button onClick={() => { const ql = data.footer.quicklinks.items.filter((_: any, j: number) => j !== i); set({ ...data, footer: { ...data.footer, quicklinks: { ...data.footer?.quicklinks, items: ql } } }); }}
                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm transition-colors">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { const ql = [...(data.footer?.quicklinks?.items || []), ""]; set({ ...data, footer: { ...data.footer, quicklinks: { ...data.footer?.quicklinks, items: ql } } }); }}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">{t("add_item")}</button>
                  </label>
                  <Input label={t("footer.certificates_title")} value={data.footer?.certificates?.title || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, certificates: { ...data.footer?.certificates, title: v } } })} />
                  <label className="block mb-3">
                    <span className="text-xs font-semibold text-gray-600 block mb-1">{t("footer.certificates_items")}</span>
                    {data.footer?.certificates?.items?.map((item: any, i: number) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <input type="text" value={typeof item === "string" ? item : item.label || ""}
                          onChange={(e) => { const c = [...data.footer.certificates.items]; c[i] = e.target.value; set({ ...data, footer: { ...data.footer, certificates: { ...data.footer?.certificates, items: c } } }); }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                        <button onClick={() => { const c = data.footer.certificates.items.filter((_: any, j: number) => j !== i); set({ ...data, footer: { ...data.footer, certificates: { ...data.footer?.certificates, items: c } } }); }}
                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm transition-colors">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { const c = [...(data.footer?.certificates?.items || []), ""]; set({ ...data, footer: { ...data.footer, certificates: { ...data.footer?.certificates, items: c } } }); }}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">{t("add_item")}</button>
                  </label>
                  <Input label={t("footer.contact_title")} value={data.footer?.contact?.title || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, contact: { ...data.footer?.contact, title: v } } })} />
                  <Input label={t("footer.address")} value={data.footer?.contact?.address || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, contact: { ...data.footer?.contact, address: v } } })} />
                  <Input label={t("footer.phone")} value={data.footer?.contact?.phone || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, contact: { ...data.footer?.contact, phone: v } } })} />
                  <Input label={t("footer.hours")} value={data.footer?.contact?.hours || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, contact: { ...data.footer?.contact, hours: v } } })} />
                  <Input label={t("footer.social_title")} value={data.footer?.social_title || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, social_title: v } })} />
                  <Input label={t("footer.copyright")} value={data.footer?.copyright || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, copyright: v } })} />
                  {["facebook", "instagram", "telegram", "tiktok", "youtube", "twitter", "linkedin"].map((s) => (
                    <Input key={s} label={t("footer." + s)} value={data.footer?.social?.[s] || ""} onChange={(v) => set({ ...data, footer: { ...data.footer, social: { ...data.footer?.social, [s]: v } } })} />
                  ))}
                </SectionCard>
              ))}
            </div>
          )}

          {tab === "chat" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("chat.section")}</h2>
              {([["ar", ar, setAr], ["en", en, setEn]] as const).map(([locale, data, set]) => (
                <SectionCard key={locale} title={locale === "ar" ? t("arabic") : t("english")} defaultOpen>
                  <Input label={t("chat.title")} value={data.chat?.title || ""} onChange={(v) => set({ ...data, chat: { ...data.chat, title: v } })} />
                  <Textarea label={t("chat.welcome")} value={data.chat?.welcome || ""} onChange={(v) => set({ ...data, chat: { ...data.chat, welcome: v } })} />
                  <Input label={t("chat.placeholder")} value={data.chat?.placeholder || ""} onChange={(v) => set({ ...data, chat: { ...data.chat, placeholder: v } })} />
                  <Input label={t("chat.send")} value={data.chat?.send || ""} onChange={(v) => set({ ...data, chat: { ...data.chat, send: v } })} />
                  <Input label={t("chat.close")} value={data.chat?.close || ""} onChange={(v) => set({ ...data, chat: { ...data.chat, close: v } })} />
                  <label className="block mb-3">
                    <span className="text-xs font-semibold text-gray-600 block mb-1">{t("chat.responses")}</span>
                    {data.chat?.responses?.map((r: string, i: number) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <textarea value={r} onChange={(e) => { const c = [...data.chat.responses]; c[i] = e.target.value; set({ ...data, chat: { ...data.chat, responses: c } }); }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-y transition-all" rows={2} />
                        <button onClick={() => { const c = data.chat.responses.filter((_: any, j: number) => j !== i); set({ ...data, chat: { ...data.chat, responses: c } }); }}
                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm transition-colors">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { const c = [...(data.chat?.responses || []), ""]; set({ ...data, chat: { ...data.chat, responses: c } }); }}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">{t("add_item")}</button>
                  </label>
                  <label className="block mb-3">
                    <span className="text-xs font-semibold text-gray-600 block mb-1">{t("chat.greetings")}</span>
                    {data.chat?.greetings?.map((g: string, i: number) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <input type="text" value={g} onChange={(e) => { const c = [...data.chat.greetings]; c[i] = e.target.value; set({ ...data, chat: { ...data.chat, greetings: c } }); }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
                        <button onClick={() => { const c = data.chat.greetings.filter((_: any, j: number) => j !== i); set({ ...data, chat: { ...data.chat, greetings: c } }); }}
                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm transition-colors">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { const c = [...(data.chat?.greetings || []), ""]; set({ ...data, chat: { ...data.chat, greetings: c } }); }}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">{t("add_item")}</button>
                  </label>
                </SectionCard>
              ))}
            </div>
          )}

          {tab === "theme" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("theme.section")}</h2>
              <p className="text-xs text-gray-500 mb-4">{t("theme.note")}</p>
              <div className="grid grid-cols-2 gap-4">
                {[["color-primary", "theme.primary"], ["color-primary-light", "theme.primary_light"], ["color-primary-dark", "theme.primary_dark"],
                  ["color-accent", "theme.accent"], ["color-gray-light", "theme.gray_light"], ["color-gray-medium", "theme.gray_medium"],
                  ["color-text-dark", "theme.text_dark"], ["color-text-light", "theme.text_light"]
                ].map(([key, labelKey]) => (
                  <ColorInput key={key} label={t(labelKey)} value={theme[key] || ""} onChange={(v) => setTheme({ ...theme, [key]: v })} />
                ))}
              </div>
            </div>
          )}

          {tab === "admins" && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t("admins.section")}</h2>
              <p className="text-xs text-gray-500 mb-4">{t("admins.note")}</p>
              <SectionCard title={t("admins.create")} defaultOpen>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <Input label={t("admins.username")} value={newAdminUser} onChange={setNewAdminUser} />
                  <Input label={t("admins.password")} value={newAdminPass} onChange={setNewAdminPass} />
                  {adminMsg && <p className={`text-sm font-medium ${adminMsg.includes(t("admins.created").slice(0, 10)) ? "text-green-600" : "text-red-600"}`}>{adminMsg}</p>}
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm">{t("admins.btn")}</button>
                </form>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function convertQl(ql: any): Record<string, string>[] {
  if (!ql) return [];
  if (typeof ql[0] === "string") return ql.map((s: string) => ({ label: s, href: "" }));
  return ql;
}

function convertChildren(ch: any): { label: string; href: string }[] {
  if (!ch) return [];
  if (typeof ch[0] === "string") return ch.map((s: string) => ({ label: s, href: "" }));
  return ch;
}
