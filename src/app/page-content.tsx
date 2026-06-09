"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import AiChat from "./AiChat";

// ----- Types -----
interface SliderItem {
  title: string;
  desc: string;
  img: string;
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

export function Header({ nav, topbar, searchLabel, locale }: { nav: { label: string; href: string; children?: NavChild[] }[]; topbar: { english: string; arabic: string; login: string }; searchLabel: string; locale: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setIsAdmin(!!localStorage.getItem("admin_token")); }, []);
  const switchLocale = locale === "ar" ? "en" : "ar";
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)\/?/, "/");
  const switchHref = `/${switchLocale}${pathWithoutLocale}`;

  return (
    <header className="bg-white shadow-md relative">
      <a href={`/${locale}`} className="absolute" style={{ insetInlineStart: '295px', top: '64px' }}>
        <img src="/images/logo.png" alt="كلية الشرق" className="h-32 w-auto" />
      </a>
      <div className="bg-primary text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={switchHref} className="hover:underline">{locale === "ar" ? topbar.english : topbar.arabic}</a>
            <span className="text-white/50">|</span>
            {isAdmin ? (
              <a href="/admin" className="hover:underline">{locale === "ar" ? "لوحة التحكم" : "Admin Panel"}</a>
            ) : (
              <a href="/login" className="hover:underline">{topbar.login}</a>
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
            {nav.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href={item.href}
                  className="px-4 py-2 text-base text-text-dark hover:text-primary font-medium rounded-md hover:bg-gray-50 transition-colors"
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
                onClick={() => item.children || setMenuOpen(false)}
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
    <section className="max-w-[1840px] mx-auto px-4 relative h-[400px] md:h-[700px] overflow-hidden bg-gray-900 rounded-2xl mt-6">
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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h1>
              <p className="text-sm md:text-base max-w-2xl text-white/90">{slide.desc}</p>
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

function FeatureCards({ items }: { items: { title: string; desc: string; more: string; href: string }[] }) {
  return (
    <section className="bg-gray-light py-16">
      <div className="max-w-[1840px] mx-auto px-4">

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((feat, i) => (
            <a
              key={i}
              href={feat.href}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light" />
                <div className="absolute inset-0 z-20 flex items-end p-6">
                  <h3 className="text-white font-bold text-xl">{feat.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-text-light text-sm leading-relaxed">{feat.desc}</p>
                <span className="inline-block mt-4 text-primary font-semibold text-sm group-hover:underline">
                  {feat.more}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SideCards({ items }: { items: { title: string; desc: string; more: string; href: string }[] }) {
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
              <div className="w-2/5 bg-gradient-to-br from-primary to-primary-light min-h-[180px]" />
              <div className="w-3/5 p-6 flex flex-col justify-center">
                <h3 className="font-bold text-lg text-text-dark mb-2">{card.title}</h3>
                <p className="text-text-light text-sm">{card.desc}</p>
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

function HighlightSection({ data }: { data: { title: string; desc: string; cta: string; campaign_title: string; campaign_sub: string; campaign_desc: string; campaign_cta: string } }) {
  return (
    <section className="bg-white py-16">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">{data.title}</h3>
            <p className="text-white/80 leading-relaxed mb-6">{data.desc}</p>
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
                <h3 className="font-bold text-lg text-text-dark">{data.campaign_title}</h3>
                <p className="text-xs text-text-light">{data.campaign_sub}</p>
              </div>
            </div>
            <p className="text-text-light text-sm leading-relaxed">{data.campaign_desc}</p>
            <a href="#" className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">{data.campaign_cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsEvents({ news, events, newsTitle, eventsTitle, newsAll, eventsAll }: { news: NewsItem[]; events: NewsItem[]; newsTitle: string; eventsTitle: string; newsAll: string; eventsAll: string }) {
  return (
    <section className="bg-gray-light py-16">
      <div className="max-w-[1840px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-text-dark mb-6">{newsTitle}</h2>
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
            <h2 className="text-2xl font-bold text-text-dark mb-6">{eventsTitle}</h2>
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

function Card({ dept, locale }: { dept: { name: string; branch: string; morning: string; evening: string; morningRate: string; eveningRate: string; img?: string }; locale: string }) {
  return (
    <div className="flex-shrink-0 w-[320px]">
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
          <h3 className="font-bold text-neutral-900 mb-2 leading-tight text-base">{dept.name}</h3>
          <div className="mb-3">
            <span className="inline-block px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full">{dept.branch}</span>
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
              <span className="text-xs font-medium text-neutral-700">{locale === "ar" ? "صباحي" : "Morning"}</span>
              <span className="text-sm font-bold text-primary">{dept.morning} د.ع</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
              <span className="text-xs font-medium text-neutral-700">{locale === "ar" ? "مسائي" : "Evening"}</span>
              <span className="text-sm font-bold text-primary">{dept.evening} د.ع</span>
            </div>
          </div>
          <div className="mt-auto pt-3 border-t border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1.5">{locale === "ar" ? "الحد الأدنى لمعدل القبول:" : "Minimum acceptance rate:"}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">{locale === "ar" ? "صباحي" : "Morning"}:</span>
              <span className="font-bold text-neutral-900">{dept.morningRate}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-0.5">
              <span className="text-neutral-600">{locale === "ar" ? "مسائي" : "Everyning"}:</span>
              <span className="font-bold text-neutral-900">{dept.eveningRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function TuitionFees({ data, locale }: { data: { title: string; viewAll: string; departments: { name: string; branch: string; morning: string; evening: string; morningRate: string; eveningRate: string; img?: string }[] }; locale: string }) {
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
        <h2 className="text-4xl font-bold text-white mb-4">{data.title}</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full mb-8" />
        <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-full transition-all border border-white/40 hover:border-white/60">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>{data.viewAll}</span>
        </a>
      </div>
      <div ref={trackRef} className="w-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none" style={{ direction: "ltr" }}>
        <div className="tf-track gap-4 md:gap-6 lg:gap-8" onMouseDown={onMouseDown}>
          {[...data.departments, ...data.departments].map((dept, i) => (
            <Card key={i} dept={dept} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer({ footerData, locale }: { footerData: { quicklinks: { title: string; items: string[] }; certificates: { title: string; items: string[] }; contact: { title: string; address: string; phone: string; hours: string }; social_title: string; copyright: string; social?: Record<string, string> }; locale: string }) {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-bold text-base mb-2">{footerData.quicklinks.title}</h4>
            <ul className="space-y-1 text-sm">
              {footerData.quicklinks.items.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-2">{footerData.certificates.title}</h4>
            <ul className="space-y-1 text-sm">
              {footerData.certificates.items.map((cert) => (
                <li key={cert}>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">{cert}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-2">{footerData.contact.title}</h4>
            <address className="not-italic text-white/70 text-sm leading-relaxed">
              <p>{footerData.contact.address}</p>
              <p className="mt-2">{footerData.contact.phone}</p>
              <p className="mt-2">{footerData.contact.hours}</p>
            </address>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <p className="text-white/70 text-sm font-medium">{footerData.social_title}</p>
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
      <FlagCounter locale={locale} />
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/50">
        {footerData.copyright}
      </div>
    </footer>
  );
}

// ----- Page -----
export default function PageContent({ locale }: { locale: string }) {
  const t = useTranslations();

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

  const heroSlides: SliderItem[] = t.raw("hero").map((slide: any, i: number) => ({
    title: slide.title,
    desc: slide.desc,
    img: slide.img || [
      "/images/slide1.jpg",
      "/images/slide2.jpg",
      "/images/slide3.jpg",
      "/images/slide4.webp",
    ][i] || "",
  }));

  const quickLinks: { label: string; href: string }[] = t.raw("quicklinks").map((item: any) =>
    typeof item === "string" ? { label: item, href: "#" } : { label: item.label || "", href: item.href || "#" }
  );
  const features = t.raw("features").map((f: any) => ({ title: f.title, desc: f.desc, more: f.more, href: f.href || "#" }));
  const sideCards = t.raw("sidecards").map((c: any) => ({ title: c.title, desc: c.desc, more: c.more, href: c.href || "#" }));
  const highlight = t.raw("highlight");
  const news: NewsItem[] = t.raw("news.items").map((item: any) => ({ date: item.date, title: item.title, href: item.href || "#" }));
  const events: NewsItem[] = t.raw("events.items").map((item: any) => ({ date: item.date, title: item.title, href: item.href || "#" }));
  const footerData = t.raw("footer");
  const tuitionFeesData = t.raw("tuitionFees");
  const chatData = t.raw("chat");

  const topbar = {
    english: t("topbar.english"),
    arabic: t("topbar.arabic"),
    login: t("topbar.login"),
  };

  return (
    <>
      <Header nav={nav} topbar={topbar} searchLabel={t("search")} locale={locale} />
      <HeroSlider slides={heroSlides} />
      {quickLinks.length > 0 && <QuickLinks items={quickLinks} />}
      <FeatureCards items={features} />
      <SideCards items={sideCards} />
      <HighlightSection data={highlight} />
      <TuitionFees data={tuitionFeesData} locale={locale} />
      <NewsEvents
        news={news}
        events={events}
        newsTitle={t("news.title")}
        eventsTitle={t("events.title")}
        newsAll={t("news.all")}
        eventsAll={t("events.all")}
      />
      <Footer footerData={footerData} locale={locale} />
      <AiChat chatData={chatData} locale={locale} />
    </>
  );
}
