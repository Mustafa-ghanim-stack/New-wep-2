import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ReactNode } from "react";
import HtmlLangDir from "../HtmlLangDir";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const isRtl = (locale: string) => locale === "ar";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div dir={dir} lang={locale}>
        <HtmlLangDir locale={locale}>{children}</HtmlLangDir>
      </div>
    </NextIntlClientProvider>
  );
}
