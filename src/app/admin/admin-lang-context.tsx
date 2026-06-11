'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminDict } from './admin-translations';

export type AdminLang = 'ar' | 'en';

interface AdminLangContextType {
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const AdminLangContext = createContext<AdminLangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k: string) => k,
  dir: 'ltr',
});

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('admin_lang') as AdminLang | null;
    if (saved === 'ar' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: AdminLang) => {
    setLangState(l);
    localStorage.setItem('admin_lang', l);
  };

  const t = (key: string): string => {
    return adminDict[lang]?.[key] || adminDict.en[key] || key;
  };

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  return useContext(AdminLangContext);
}
