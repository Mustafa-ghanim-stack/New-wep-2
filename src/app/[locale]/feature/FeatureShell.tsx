'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header, Footer } from '../../page-content';

type NavChild = { label: string; href: string; children?: NavChild[] };

function mapChildren(children: any[], locale: string): NavChild[] {
  return children?.map((child: any) => {
    if (typeof child === 'string') return { label: child, href: '#' };
    const mapped: NavChild = { label: child.label || '', href: child.href ? `/${locale}${child.href}` : '#' };
    if (child.children) mapped.children = mapChildren(child.children, locale);
    return mapped;
  }) || [];
}

export default function FeatureShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const t = useTranslations();
  const isAr = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [locale, isAr]);

  const nav = t.raw('nav')
    .filter((item: any) => item.label !== 'اتصل بنا' && item.label !== 'Contact Us')
    .map((item: any) => ({
      label: item.label,
      href: item.href ? `/${locale}${item.href}` : '#',
      children: mapChildren(item.children, locale),
    }));

  const topbar = { english: t('topbar.english'), arabic: t('topbar.arabic'), login: t('topbar.login') };
  const logoSettings = (() => { try { return t.raw('logo') as any; } catch { return {}; } })();
  const footerData = t.raw('footer');

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} lang={locale}>
      <Header nav={nav} topbar={topbar} searchLabel={t('search')} locale={locale} logoSettings={logoSettings} />
      <div>{children}</div>
      <Footer footerData={footerData} locale={locale} />
    </div>
  );
}
