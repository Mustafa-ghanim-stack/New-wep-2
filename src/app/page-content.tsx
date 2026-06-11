"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import AiChat from "./AiChat";

// ----- Types -----
interface TextStyle { size?: string; font?: string; align?: string; x?: number; y?: number; }
function applyStyle(s?: TextStyle): React.CSSProperties {
  if (!s) return {};
  return {
    fontSize: s.size ? `${s.size}px` : undefined,
    fontFamily: s.font || undefined,
    textAlign: s.align as React.CSSProperties['textAlign'] || undefined,
    transform: (s.x || s.y) ? `translate(${s.x ?? 0}px, ${s.y ?? 0}px)` : undefined,
  };
}

interface SliderItem {
  title: string;
  desc: string;
  img: string;
  titleStyle?: TextStyle;
  descStyle?: TextStyle;
}

interface NewsItem {
  date: string;
  title: string;
  href: string;
}

// ----- Social Icons -----
function SocialIcon({ href, name, bg, children }: { href: string; name: string; bg: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 ${bg} hover:text-white transition-all`}
      title={name}
    >
      {children}
    </a>
  );
}

function FacebookIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}

function YoutubeIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}

function InstagramIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
}

function LinkedinIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
}

function TwitterIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}

function TiktokIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
}

function TelegramIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
}

// ----- Components -----
interface NavChild {
  label: string;
  href?: string;
  children?: NavChild[];
}

const EXISTING_ROUTES = ['/ab', '/tuition-fees'];
function isLiveRoute(href: string): boolean {
  if (!href || href === '#') return false;
  const path = href.replace(/^\/(ar|en)/, '');
  return EXISTING_ROUTES.some(r => path === r || path.startsWith(r + '/'));
}
const noNav = (href: string) => (e: React.MouseEvent) => { if (!isLiveRoute(href)) e.preventDefault(); };

export function Header({ nav, navStyles, topbar, searchLabel, locale, logoSettings }: { nav: { label: string; href: string; children?: NavChild[] }[]; navStyles?: Record<string, TextStyle>; topbar: { english: string; arabic: string; login: string }; searchLabel: string; locale: string; logoSettings?: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [isStudent, setIsStudent]     = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token") || !!sessionStorage.getItem("admin_token"));
    setIsStudent(!!(localStorage.getItem("student_token") || sessionStorage.getItem("student_token")));
    setIsProfessor(!!(localStorage.getItem("professor_token") || sessionStorage.getItem("professor_token")));
  }, []);
  const switchLocale = locale === "ar" ? "en" : "ar";
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)\/?/, "/");
  const switchHref = `/${switchLocale}${pathWithoutLocale}`;

  return (
    <header className="bg-white shadow-md relative">
      <a href={`/${locale}`} className="absolute" style={{
        insetInlineStart: logoSettings?.start ? `${logoSettings.start}px` : '295px',
        top: logoSettings?.top ? `${logoSettings.top}px` : '64px',
      }}>
        <img
          src={logoSettings?.url || '/images/logo.png'}
          alt={logoSettings?.alt || 'كلية الشرق'}
          style={{ width: logoSettings?.width ? `${logoSettings.width}px` : undefined }}
          className="h-32 w-auto"
        />
      </a>
      <div className="bg-primary text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={switchHref} className="hover:underline">{locale === "ar" ? topbar.english : topbar.arabic}</a>
            <span className="text-white/50">|</span>
            {isAdmin ? (
              <a href="/admin" className="hover:underline">{locale === "ar" ? "لوحة التحكم" : "Admin Panel"}</a>
            ) : isProfessor ? (
              <a href="/professor/panel" className="hover:underline">{locale === "ar" ? "لوحة التدريسي" : "Professor Panel"}</a>
            ) : isStudent ? (
              <a href="/student/panel" className="hover:underline">{locale === "ar" ? "لوحة الطالب" : "Student Panel"}</a>
            ) : (
              <a href={`/login?lang=${locale}`} className="hover:underline">{topbar.login}</a>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowContact(true)} className="hover:underline cursor-pointer">{locale === "ar" ? "اتصل بنا" : "Contact Us"}</button>
            <span className="text-white/50">|</span>
            <button className="hover:underline" aria-label={searchLabel}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-center h-44">

          <nav className="hidden lg:flex items-center gap-1 mb-6">
            {nav.map((item, idx) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href={item.href}
                  onClick={noNav(item.href)}
                  className="px-4 py-2 text-base text-text-dark hover:text-primary font-medium rounded-md hover:bg-gray-50 transition-colors"
                  style={applyStyle(navStyles?.[String(idx)])}
                >
                  {item.label}
                  {item.children && (
                    <svg className="inline-block w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </a>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full start-0 bg-white shadow-xl border rounded-lg py-2 min-w-56 z-50">
                    {item.children.map((child) => (
                      <div
                        key={child.label}
                        className="relative group/sub"
                        onMouseEnter={() => setOpenSubDropdown(child.label)}
                        onMouseLeave={() => setOpenSubDropdown(null)}
                      >
                        {child.children ? (
                          <>
                            <span className="block px-4 py-2 text-base text-text-dark hover:bg-primary hover:text-white transition-colors cursor-default flex items-center gap-3">
                              <span className="w-2 h-2 bg-primary flex-shrink-0"></span>
                              <span className="flex-1">{child.label}</span>
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7" />
                              </svg>
                            </span>
                            {openSubDropdown === child.label && (
                              <div className="absolute top-0 start-full bg-white shadow-xl border rounded-lg py-2 min-w-56 z-50">
                                {child.children.map((sub) => (
                                  <a
                                    key={sub.label}
                                    href={sub.href || "#"}
                                    onClick={noNav(sub.href || "#")}
                                    className="flex items-center gap-3 px-4 py-2 text-base text-text-dark hover:bg-primary hover:text-white transition-colors"
                                  >
                                    <span className="w-2 h-2 bg-primary flex-shrink-0"></span>
                                    {sub.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <a
                            href={child.href || "#"}
                            onClick={noNav(child.href || "#")}
                            className="flex items-center gap-3 px-4 py-2 text-base text-text-dark hover:bg-primary hover:text-white transition-colors"
                          >
                            <span className="w-2 h-2 bg-primary flex-shrink-0"></span>
                            {child.label}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            className="lg:hidden p-2 text-text-dark"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={searchLabel}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t bg-white max-h-96 overflow-y-auto">
          {nav.map((item) => (
            <div key={item.label}>
              <a
                href={item.href}
                className="block px-4 py-3 text-sm text-text-dark hover:bg-gray-50 border-b"
                onClick={e => {
                  if (!isLiveRoute(item.href)) e.preventDefault();
                  else setMenuOpen(false);
                }}
              >
                {item.label}
              </a>
              {item.children && (
                <div className="bg-gray-50">
                  {item.children.map((child) => (
                    <div key={child.label}>
                      {child.children ? (
                        <>
                          <span className="block px-8 py-2 text-sm font-medium text-text-dark border-b cursor-default">
                            {child.label}
                          </span>
                          <div className="bg-gray-100/50">
                            {child.children.map((sub) => (
                              <a
                                key={sub.label}
                                href={sub.href || "#"}
                                className="block px-12 py-1.5 text-sm text-text-light hover:text-primary border-b"
                              >
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        </>
                      ) : (
                        <a
                          href={child.href || "#"}
                          onClick={noNav(child.href || "#")}
                          className="block px-8 py-2 text-sm text-text-light hover:text-primary border-b"
                        >
                          {child.label}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-dark">{locale === "ar" ? "معلومات الاتصال" : "Contact Info"}</h3>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4 text-text-dark">
              <div>
                <p className="font-semibold text-primary">{locale === "ar" ? "العنوان" : "Address"}</p>
                <p className="text-sm">{locale === "ar" ? "البصرة - حي الزيتون - طريق حمدان الجديد" : "Basra - Al-Zaytun District - Hamdan Al-Jadid Road"}</p>
              </div>
              <div>
                <p className="font-semibold text-primary">{locale === "ar" ? "الهاتف" : "Phone"}</p>
                <p className="text-sm">07744445669 / 07870703000</p>
              </div>
              <div>
                <p className="font-semibold text-primary">{locale === "ar" ? "مواعيد العمل" : "Working Hours"}</p>
                <p className="text-sm">{locale === "ar" ? "الأحد – الخميس: 8:00 ص - 3:00 م" : "Sunday – Thursday: 8:00 AM - 3:00 PM"}</p>
              </div>
            </div>
            <button onClick={() => setShowContact(false)} className="mt-6 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors">
              {locale === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSlider({ slides }: { slides: SliderItem[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="max-w-[1840px] mx-auto px-4 relative h-[400px] md:h-[700px] overflow-hidden bg-gray-900 rounded-2xl" style={{ marginTop: '80px' }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 rounded-2xl ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-black/30 z-10 rounded-2xl" />
          <div
            className="w-full h-full bg-cover bg-center rounded-2xl"
            style={{ backgroundImage: `url(${slide.img})` }}
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="px-4 text-white">
              <h1 className="font-bold mb-2" style={{ fontSize: '2rem', ...applyStyle(slide.titleStyle) }}>{slide.title}</h1>
              <p className="max-w-2xl text-white/90" style={{ fontSize: '1rem', ...applyStyle(slide.descStyle) }}>{slide.desc}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute start-4 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white text-3xl"
        aria-label="السابق"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute end-4 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white text-3xl"
        aria-label="التالي"
      >
        ›
      </button>
    </section>
  );
}

function HeroBanner({ data, locale }: { data: { title: string; body: string; titleStyle?: TextStyle; bodyStyle?: TextStyle }; locale: string }) {
  if (!data?.title && !data?.body) return null;
  return (
    <section className="bg-white py-10">
      <div className="max-w-[1840px] mx-auto px-6 md:px-12">
        <div className={`border-s-4 border-primary ps-6 ${locale === "ar" ? "text-right" : "text-left"}`}>
          {data.title && (
            <h2 className="font-bold text-text-dark mb-4" style={{ fontSize: '1.5rem', ...applyStyle(data.titleStyle) }}>
              {data.title}
            </h2>
          )}
          {data.body && data.body.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed mb-3 last:mb-0" style={{ fontSize: '1rem', ...applyStyle(data.bodyStyle) }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks({ items }: { items: { label: string; href: string }[] }) {
  return (
    <section className="bg-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group flex flex-col items-center p-6 bg-gray-light rounded-xl hover:bg-primary hover:text-white transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 bg-primary/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-3 transition-all">
                <svg className="w-6 h-6 text-primary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-bold text-sm">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function truncateWords(text: string, n: number): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= n ? text : words.slice(0, n).join(' ') + '...';
}

const AR_MONTHS = ['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'];
function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (locale === 'ar') {
      const day = d.getDate().toLocaleString('ar-EG');
      const month = AR_MONTHS[d.getMonth()];
      const year = d.getFullYear().toLocaleString('ar-EG');
      return `${day} ${month} ${year}`;
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function FeatureCards({ items, locale }: { items: { title: string; desc: string; more: string; href: string; img?: string; youtube?: string; category?: string; date?: string; titleStyle?: TextStyle; descStyle?: TextStyle }[]; locale: string }) {
  return (
    <section className="bg-gray-light py-16">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((feat, i) => {
            const ytId = getYouTubeId(feat.youtube || '');
            const detailHref = `/${locale}/feature/${i}`;
            return (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                {/* Media */}
                <div className="relative overflow-hidden" style={{ height: 200 }}>
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={feat.title}
                    />
                  ) : feat.img ? (
                    <img src={feat.img} alt={feat.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light" />
                  )}
                  {feat.category && (
                    <span className="absolute top-3 end-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                      {feat.category}
                    </span>
                  )}
                </div>
                {/* Body */}
                <div className="p-5 flex flex-col flex-1 min-h-[200px]">
                  {feat.date && (
                    <span className="text-xs text-primary font-medium mb-2 block">
                      {formatDate(feat.date, locale)}
                    </span>
                  )}
                  <h3 className="font-bold text-text-dark leading-snug mb-3" style={{ fontSize: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', ...applyStyle(feat.titleStyle) }}>
                    {feat.title}
                  </h3>
                  <div className="mt-auto">
                    <a href={detailHref} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1">
                      {feat.more || (locale === 'ar' ? 'اقرأ المزيد' : 'Read More')}
                      <span className="text-base leading-none">{locale === 'ar' ? '›' : '›'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SideCards({ items }: { items: { title: string; desc: string; more: string; href: string; img?: string; titleStyle?: TextStyle; descStyle?: TextStyle }[] }) {
  return (
    <section className="bg-gray-light pb-16">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((card, i) => (
            <a
              key={i}
              href={card.href}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex"
            >
              <div className="w-2/5 min-h-[180px] flex-shrink-0 overflow-hidden">
                {card.img ? (
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light" />
                )}
              </div>
              <div className="w-3/5 p-6 flex flex-col justify-center">
                <h3 className="font-bold text-text-dark mb-2" style={{ fontSize: '1.1rem', ...applyStyle(card.titleStyle) }}>{card.title}</h3>
                <p style={{ fontSize: '0.875rem', ...applyStyle(card.descStyle) }}>{card.desc}</p>
                <span className="inline-block mt-3 text-primary font-semibold text-sm group-hover:underline">
                  {card.more}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightSection({ data }: { data: any }) {
  return (
    <section className="bg-white py-16">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4" style={applyStyle(data.titleStyle)}>{data.title}</h3>
            <p className="text-white/80 leading-relaxed mb-6" style={applyStyle(data.descStyle)}>{data.desc}</p>
            <a href="#" className="inline-block bg-white text-primary font-bold px-6 py-3 rounded-lg hover:bg-accent hover:text-white transition-all">
              {data.cta}
            </a>
          </div>

          <div className="border-2 border-primary/20 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-dark" style={applyStyle(data.campaignTitleStyle)}>{data.campaign_title}</h3>
                <p className="text-xs text-text-light" style={applyStyle(data.campaignSubStyle)}>{data.campaign_sub}</p>
              </div>
            </div>
            <p className="text-text-light text-sm leading-relaxed" style={applyStyle(data.campaignDescStyle)}>{data.campaign_desc}</p>
            <a href="#" className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">{data.campaign_cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestNews({ items, title, all, locale }: { items: NewsItem[]; title: string; all: string; locale: string }) {
  const isRtl = locale === 'ar';
  return (
    <section className="w-full py-12 bg-white border-b border-neutral-100">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-text-dark">{title}</h2>
          </div>
          <a href="#" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            {all}
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item, i) => (
            <a key={i} href={item.href || '#'} className="group block bg-neutral-50 hover:bg-primary rounded-2xl p-5 transition-all duration-300 border border-neutral-100 hover:border-primary hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-white transition-colors flex-shrink-0" />
                <span className="text-xs font-semibold text-primary group-hover:text-white/80 transition-colors">{item.date}</span>
              </div>
              <h4 className="text-text-dark group-hover:text-white font-medium leading-relaxed text-sm transition-colors" dir={isRtl ? 'rtl' : 'ltr'}>{item.title}</h4>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsEvents({ news, events, newsTitle, eventsTitle, newsAll, eventsAll, newsTitleStyle, eventsTitleStyle }: { news: NewsItem[]; events: NewsItem[]; newsTitle: string; eventsTitle: string; newsAll: string; eventsAll: string; newsTitleStyle?: TextStyle; eventsTitleStyle?: TextStyle }) {
  return (
    <section className="bg-gray-light py-16">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-text-dark mb-6" style={applyStyle(newsTitleStyle)}>{newsTitle}</h2>
            <div className="space-y-4">
              {news.map((item, i) => (
                <a key={i} href={item.href} className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <span className="text-xs text-primary font-semibold">{item.date}</span>
                  <h4 className="text-text-dark font-medium mt-1 leading-relaxed">{item.title}</h4>
                </a>
              ))}
            </div>
            <a href="#" className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">{newsAll}</a>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-dark mb-6" style={applyStyle(eventsTitleStyle)}>{eventsTitle}</h2>
            <div className="space-y-4">
              {events.map((event, i) => (
                <a key={i} href={event.href} className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <span className="text-xs text-primary font-semibold">{event.date}</span>
                  <h4 className="text-text-dark font-medium mt-1 leading-relaxed">{event.title}</h4>
                </a>
              ))}
            </div>
            <a href="#" className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">{eventsAll}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

interface CardStyles {
  cardNameStyle?: TextStyle;
  cardBranchStyle?: TextStyle;
  cardFeeValueStyle?: TextStyle;
  cardFeeLabelStyle?: TextStyle;
  cardRateStyle?: TextStyle;
  cardRateLabelStyle?: TextStyle;
}

function Card({ dept, locale, styles }: { dept: { slug: string; name: string; desc?: string; branch: string; morning: string; evening: string; morningRate: string; eveningRate: string; img?: string }; locale: string; styles?: CardStyles }) {
  const cs = styles || {};
  return (
    <a href={`/${locale}/tuition-fees/${dept.slug}`} className="flex-shrink-0 w-[320px] block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-neutral-100 h-full flex flex-col">
        {dept.img ? (
          <div className="w-full h-32 relative overflow-hidden">
            <img src={dept.img} alt={dept.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-primary to-primary-dark relative">
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        )}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-neutral-900 mb-2 leading-tight text-base" style={applyStyle(cs.cardNameStyle)}>{dept.name}</h3>
          <span className="inline-block px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-3" style={applyStyle(cs.cardBranchStyle)}>{dept.branch}</span>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
              <span className="text-xs font-medium text-neutral-700" style={applyStyle(cs.cardFeeLabelStyle)}>{locale === "ar" ? "صباحي" : "Morning"}</span>
              <span className="text-sm font-bold text-primary" style={applyStyle(cs.cardFeeValueStyle)}>{dept.morning} {locale === "ar" ? "د.ع" : "IQD"}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
              <span className="text-xs font-medium text-neutral-700" style={applyStyle(cs.cardFeeLabelStyle)}>{locale === "ar" ? "مسائي" : "Evening"}</span>
              <span className="text-sm font-bold text-primary" style={applyStyle(cs.cardFeeValueStyle)}>{dept.evening} {locale === "ar" ? "د.ع" : "IQD"}</span>
            </div>
          </div>
          <div className="mt-auto pt-3 border-t border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1.5" style={applyStyle(cs.cardRateLabelStyle)}>{locale === "ar" ? "الحد الأدنى لمعدل القبول:" : "Minimum acceptance rate:"}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600" style={applyStyle(cs.cardRateLabelStyle)}>{locale === "ar" ? "صباحي" : "Morning"}:</span>
              <span className="font-bold text-neutral-900" style={applyStyle(cs.cardRateStyle)}>{dept.morningRate}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-0.5">
              <span className="text-neutral-600" style={applyStyle(cs.cardRateLabelStyle)}>{locale === "ar" ? "مسائي" : "Evening"}:</span>
              <span className="font-bold text-neutral-900" style={applyStyle(cs.cardRateStyle)}>{dept.eveningRate}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

function FlagCounter({ locale }: { locale: string }) {
  const [stats, setStats] = useState({ visitorsNow: 0, todayViews: 0, totalViews: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  const fmt = (n: number) => n.toLocaleString("en-US");

  useEffect(() => {
    fetch("/api/counter", { method: "POST" })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/counter")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-6 py-3 text-sm text-white/70">
      {isAdmin && (
        <span>{locale === "ar" ? `الزوار الآن: ${fmt(stats.visitorsNow)}` : `Visitors Now: ${stats.visitorsNow}`}</span>
      )}
      {isAdmin && <span className="text-white/20">·</span>}
      <span>{locale === "ar" ? `مشاهدات اليوم: ${fmt(stats.todayViews)}` : `Views Today: ${stats.todayViews}`}</span>
      <span className="text-white/20">·</span>
      <span>{locale === "ar" ? `إجمالي المشاهدات: ${fmt(stats.totalViews)}` : `Total Views: ${stats.totalViews}`}</span>
    </div>
  );
}

function TuitionFees({ data, locale }: { data: { title: string; titleStyle?: TextStyle; viewAll: string; viewAllStyle?: TextStyle; cardNameStyle?: TextStyle; cardBranchStyle?: TextStyle; cardFeeValueStyle?: TextStyle; cardFeeLabelStyle?: TextStyle; cardRateStyle?: TextStyle; cardRateLabelStyle?: TextStyle; departments: { slug: string; name: string; desc?: string; branch: string; morning: string; evening: string; morningRate: string; eveningRate: string; img?: string }[] }; locale: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const d = dragRef.current;
    d.isDown = true;
    d.startX = e.pageX;
    d.scrollLeft = el.scrollLeft;
    el.classList.add('dragging');
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let pos = 0;
    let running = true;

    const step = () => {
      if (!running) return;
      pos += 0.5;
      el.scrollLeft = pos;
      if (pos >= el.scrollWidth / 2) pos = 1;
      raf = requestAnimationFrame(step);
    };
    let raf = requestAnimationFrame(step);

    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d.isDown) return;
      const el = trackRef.current;
      if (!el) return;
      el.scrollLeft = d.scrollLeft - (e.pageX - d.startX);
    };

    const onUp = () => {
      const d = dragRef.current;
      if (!d.isDown) return;
      d.isDown = false;
      const el = trackRef.current;
      if (el) {
        pos = el.scrollLeft;
        el.classList.remove('dragging');
      }
    };

    const onEnter = () => { running = false; cancelAnimationFrame(raf); };
    const onLeave = () => { running = true; raf = requestAnimationFrame(step); };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <section className="w-full py-16 bg-primary-dark overflow-hidden">
      <style>{`.tf-track{width:fit-content;display:flex;}.tf-track.dragging{cursor:grabbing!important}`}</style>
      <div className="px-4 mb-10 text-center">
        <h2 className="text-4xl font-bold text-white mb-4" style={applyStyle(data.titleStyle)}>{data.title}</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full mb-8" />
        <a href={`/${locale}/tuition-fees`} className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-full transition-all border border-white/40 hover:border-white/60">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span style={applyStyle(data.viewAllStyle)}>{data.viewAll}</span>
        </a>
      </div>
      <div ref={trackRef} className="w-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none" style={{ direction: "ltr" }}>
        <div className="tf-track gap-4 md:gap-6 lg:gap-8" onMouseDown={onMouseDown}>
          {[...data.departments, ...data.departments].map((dept, i) => (
            <Card key={i} dept={dept} locale={locale} styles={data} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterContactForm({ locale }: { locale: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  const ar = locale === 'ar';

  const handleSend = () => {
    if (!name.trim()) { setErr(ar ? 'الاسم مطلوب' : 'Name is required'); return; }
    if (!email.trim()) { setErr(ar ? 'البريد الإلكتروني مطلوب' : 'Email is required'); return; }
    setErr('');
    setStatus('sending');
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message }),
    })
      .then(r => {
        if (r.ok) {
          setStatus('sent');
          setName(''); setEmail(''); setPhone(''); setMessage('');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'))
      .finally(() => { setTimeout(() => setStatus('idle'), 4000); });
  };

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'white',
    outline: 'none', boxSizing: 'border-box',
  };

  const btnBg = status === 'sent' ? '#16a34a' : status === 'error' ? '#dc2626' : 'rgba(255,255,255,0.18)';

  return (
    <div style={{ width: 280, flexShrink: 0, marginRight: 24, alignSelf: 'stretch', marginTop: 16, marginBottom: 16, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, direction: ar ? 'rtl' : 'ltr', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
      <h4 style={{ fontWeight: 700, fontSize: 14, margin: 0, color: 'rgba(255,255,255,0.9)' }}>
        {ar ? 'تواصل معنا' : 'Contact Us'}
      </h4>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        {ar ? 'أرسل لنا رسالة وسنرد عليك قريباً' : "Send us a message and we'll reply soon"}
      </p>
      <input style={inp} placeholder={ar ? 'الاسم *' : 'Name *'} value={name} onChange={e => setName(e.target.value)} />
      <input style={inp} placeholder={ar ? 'البريد الإلكتروني *' : 'Email *'} value={email} onChange={e => setEmail(e.target.value)} />
      <input style={inp} placeholder={ar ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'} value={phone} onChange={e => setPhone(e.target.value)} />
      <textarea style={{ ...inp, resize: 'none', flexGrow: 1, minHeight: 60 }} placeholder={ar ? 'رسالتك...' : 'Your message...'} value={message} onChange={e => setMessage(e.target.value)} />
      {err && <p style={{ fontSize: 11, color: '#fca5a5', margin: 0 }}>{err}</p>}
      <button
        type="button"
        disabled={status === 'sending'}
        onClick={handleSend}
        style={{ background: btnBg, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: 'white', fontWeight: 600, fontSize: 13, padding: '9px 8px', cursor: status === 'sending' ? 'not-allowed' : 'pointer', flexShrink: 0, marginTop: 'auto' }}>
        {status === 'sending' ? (ar ? 'جارٍ الإرسال...' : 'Sending...') : status === 'sent' ? (ar ? '✓ تم الإرسال' : '✓ Sent!') : status === 'error' ? (ar ? 'خطأ، أعد المحاولة' : 'Error, retry') : (ar ? 'إرسال الرسالة' : 'Send Message')}
      </button>
    </div>
  );
}

export function Footer({ footerData, locale }: { footerData: { quicklinks: { title: string; items: string[] }; certificates: { title: string; items: string[] }; contact: { title: string; address: string; phone: string; hours: string }; social_title: string; copyright: string; social?: Record<string, string>; mapUrl?: string; quicklinksStyle?: TextStyle; quicklinksItemsStyle?: TextStyle; certificatesStyle?: TextStyle; certificatesItemsStyle?: TextStyle; contactStyle?: TextStyle; contactTextStyle?: TextStyle; socialTitleStyle?: TextStyle; copyrightStyle?: TextStyle }; locale: string }) {
  return (
    <footer className="bg-primary-dark text-white" style={{ display: 'flex', flexDirection: 'row', direction: 'ltr', alignItems: 'stretch' }}>
      {/* الخريطة — يسار، كامل الارتفاع */}
      {footerData.mapUrl && (
        <div style={{ width: 280, flexShrink: 0, marginLeft: 24, alignSelf: 'stretch', marginTop: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}>
          <iframe src={footerData.mapUrl} style={{ width: '100%', height: '100%', display: 'block', border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={locale === 'ar' ? 'موقع الجامعة' : 'University Location'} />
        </div>
      )}
      {/* نموذج التواصل — يمين الخريطة */}
      <FooterContactForm locale={locale} />
      {/* المحتوى — يمين */}
      <div style={{ flex: 1, direction: 'rtl', pointerEvents: 'none' }}>
        <div className="px-4 pt-8 pb-6" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ width: 'fit-content', transform: 'translateX(-304px)', fontSize: '0.9rem', pointerEvents: 'auto' }}>
            <div>
              <h4 className="font-bold mb-2" style={applyStyle(footerData.quicklinksStyle)}>{footerData.quicklinks.title}</h4>
              <ul className="space-y-1" style={applyStyle(footerData.quicklinksItemsStyle)}>
                {footerData.quicklinks.items.map((link: string) => (
                  <li key={link}><a href="#" className="text-white/70 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2" style={applyStyle(footerData.certificatesStyle)}>{footerData.certificates.title}</h4>
              <ul className="space-y-1" style={applyStyle(footerData.certificatesItemsStyle)}>
                {footerData.certificates.items.map((cert: string) => (
                  <li key={cert}><a href="#" className="text-white/70 hover:text-white transition-colors">{cert}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2" style={applyStyle(footerData.contactStyle)}>{footerData.contact.title}</h4>
              <address className="not-italic text-white/70 leading-relaxed" style={applyStyle(footerData.contactTextStyle)}>
                <p>{footerData.contact.address}</p>
                <p className="mt-1">{footerData.contact.phone}</p>
                <p className="mt-1">{footerData.contact.hours}</p>
              </address>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4" style={{ pointerEvents: 'auto' }}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4" style={{ transform: 'translateX(-304px)' }}>
            <p className="text-white/70 text-sm font-medium" style={applyStyle(footerData.socialTitleStyle)}>{footerData.social_title}</p>
            <div className="flex items-center justify-center gap-3">
              <SocialIcon href={footerData.social?.facebook || "#"} name="فيسبوك" bg="hover:bg-[#1877F2]"><FacebookIcon /></SocialIcon>
              <SocialIcon href={footerData.social?.instagram || "#"} name="إنستغرام" bg="hover:bg-[#E4405F]"><InstagramIcon /></SocialIcon>
              {footerData.social?.telegram && (
                <SocialIcon href={footerData.social.telegram} name="تيلغرام" bg="hover:bg-[#0088CC]"><TelegramIcon /></SocialIcon>
              )}
              <SocialIcon href={footerData.social?.tiktok || "#"} name="تيك توك" bg="hover:bg-[#000000]"><TiktokIcon /></SocialIcon>
              <SocialIcon href={footerData.social?.youtube || "#"} name="يوتيوب" bg="hover:bg-[#FF0000]"><YoutubeIcon /></SocialIcon>
              {footerData.social?.twitter && (
                <SocialIcon href={footerData.social.twitter} name="تويتر" bg="hover:bg-[#1DA1F2]"><TwitterIcon /></SocialIcon>
              )}
              {footerData.social?.linkedin && (
                <SocialIcon href={footerData.social.linkedin} name="لينكد إن" bg="hover:bg-[#0A66C2]"><LinkedinIcon /></SocialIcon>
              )}
            </div>
          </div>
        </div>
        <div style={{ transform: 'translateX(-304px)', pointerEvents: 'auto' }}><FlagCounter locale={locale} /></div>
        <div className="border-t border-white/10 py-4 text-center text-sm text-white/50" style={{ transform: 'translateX(-304px)', pointerEvents: 'auto' }}>
          <span style={applyStyle(footerData.copyrightStyle)}>{footerData.copyright}</span>
        </div>
      </div>
    </footer>
  );
}

// ----- Page -----
export default function PageContent({ locale }: { locale: string }) {
  const t = useTranslations();
  const [apiEvents, setApiEvents] = useState<NewsItem[]>([]);
  const [apiDepartments, setApiDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => { if (d.items?.length > 0) setApiDepartments(d.items); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => {
        if (d.items && d.items.length > 0) {
          setApiEvents(d.items.map((e: any) => ({
            date: e.date || new Date(e.createdAt || Date.now()).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-US'),
            title: locale === 'ar' ? (e.titleAr || e.title || '') : (e.titleEn || e.title || ''),
            href: e.href || '#',
          })));
        }
      })
      .catch(() => {});
  }, [locale]);

  const mapChildren = (children: any[], locale: string): NavChild[] =>
    children?.map((child: any) => {
      if (typeof child === "string") return { label: child, href: "#" };
      const mapped: NavChild = { label: child.label || "", href: child.href ? `/${locale}${child.href}` : "#" };
      if (child.children) mapped.children = mapChildren(child.children, locale);
      return mapped;
    }) || [];

  const nav = t.raw("nav").filter((item: any) => item.label !== "اتصل بنا" && item.label !== "Contact Us").map((item: any) => ({
    label: item.label,
    href: item.href ? `/${locale}${item.href}` : "#",
    children: mapChildren(item.children, locale),
  }));

  const logoSettings = (() => { try { return t.raw("logo") as any; } catch { return {}; } })();
  const navStyles = (() => { try { return t.raw("navStyles") as Record<string, TextStyle>; } catch { return {}; } })();

  const heroSlides: SliderItem[] = t.raw("hero").map((slide: any, i: number) => ({
    title: slide.title,
    desc: slide.desc,
    img: slide.img || [
      "/images/slide1.jpg",
      "/images/slide2.jpg",
      "/images/slide3.jpg",
      "/images/slide4.webp",
    ][i] || "",
    titleStyle: slide.titleStyle,
    descStyle: slide.descStyle,
  }));

  const quickLinks: { label: string; href: string }[] = t.raw("quicklinks").map((item: any) =>
    typeof item === "string" ? { label: item, href: "#" } : { label: item.label || "", href: item.href || "#" }
  );
  const features = t.raw("features").map((f: any) => ({ title: f.title, desc: f.desc, more: f.more, href: f.href || "#", img: f.img, youtube: f.youtube || '', category: f.category || '', date: f.date || '', titleStyle: f.titleStyle, descStyle: f.descStyle }));
  const sideCards = t.raw("sidecards").map((c: any) => ({ title: c.title, desc: c.desc, more: c.more, href: c.href || "#", img: c.img || '', titleStyle: c.titleStyle, descStyle: c.descStyle }));
  const highlight = t.raw("highlight");
  const news: NewsItem[] = t.raw("news.items").map((item: any) => ({ date: item.date, title: item.title, href: item.href || "#" }));
  const events: NewsItem[] = t.raw("events.items").map((item: any) => ({ date: item.date, title: item.title, href: item.href || "#" }));
  const footerData = t.raw("footer");
  const tuitionFeesRaw = t.raw("tuitionFees") as any;
  const tuitionFeesData = {
    ...tuitionFeesRaw,
    departments: apiDepartments.length > 0
      ? apiDepartments.filter((d: any) => d.status !== 'inactive').map((d: any) => ({
          slug: d.slug,
          name: locale === 'ar' ? d.nameAr : d.nameEn,
          desc: locale === 'ar' ? d.descAr : d.descEn,
          branch: locale === 'ar' ? d.branchAr : d.branchEn,
          morning: d.morning,
          evening: d.evening,
          morningRate: d.morningRate,
          eveningRate: d.eveningRate,
          img: d.img,
        }))
      : tuitionFeesRaw.departments,
  };
  const chatData = t.raw("chat");

  const topbar = {
    english: t("topbar.english"),
    arabic: t("topbar.arabic"),
    login: t("topbar.login"),
  };

  return (
    <>
      <Header nav={nav} navStyles={navStyles} topbar={topbar} searchLabel={t("search")} locale={locale} logoSettings={logoSettings} />
      <HeroSlider slides={heroSlides} />
      <HeroBanner data={t.raw("heroBanner")} locale={locale} />
      {quickLinks.length > 0 && <QuickLinks items={quickLinks} />}
      <div className="max-w-[1840px] mx-auto px-4 pt-36 pb-2 flex justify-center">
        <h2 className="text-2xl font-bold text-text-dark border-b-4 border-primary pb-1 inline-block" style={applyStyle((t.raw("news") as any)?.latestNewsTitleStyle)}>{t("news.title")}</h2>
      </div>
      <FeatureCards items={features} locale={locale} />
      <SideCards items={sideCards} />
      <HighlightSection data={highlight} />
      <TuitionFees data={tuitionFeesData} locale={locale} />
      <NewsEvents
        news={news}
        events={apiEvents.length > 0 ? apiEvents : events}
        newsTitle={t("news.title")}
        eventsTitle={t("events.title")}
        newsAll={t("news.all")}
        eventsAll={t("events.all")}
        newsTitleStyle={(t.raw("news") as any)?.titleStyle}
        eventsTitleStyle={(t.raw("events") as any)?.titleStyle}
      />
      <Footer footerData={footerData} locale={locale} />
      <AiChat chatData={chatData} locale={locale} />
    </>
  );
}
