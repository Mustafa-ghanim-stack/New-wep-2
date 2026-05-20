"use client";

import { useEffect } from "react";

export default function HtmlLangDir({ locale, children }: { locale: string; children: React.ReactNode }) {
  const isRtl = locale === "ar";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [locale, isRtl]);
  return <>{children}</>;
}
