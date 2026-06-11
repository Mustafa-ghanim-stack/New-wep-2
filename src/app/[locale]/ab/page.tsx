import { getTranslations, getMessages } from "next-intl/server";
import { Header, Footer } from "../../page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const site = await getTranslations({ locale });
  const messages = await getMessages({ locale });

  const nav: any = (messages as any).nav;
  const topbar: any = (messages as any).topbar;
  const footerData: any = (messages as any).footer;
  const logoSettings: any = (messages as any).logo || {};
  const goals: { title: string; items: string[] } = (messages as any).about.goals;

  const mapChildren = (children: any[]): any[] =>
    children?.map((child: any) => {
      if (typeof child === "string") return { label: child, href: "#" };
      const mapped: any = { label: child.label || "", href: child.href ? `/${locale}${child.href}` : "#" };
      if (child.children) mapped.children = mapChildren(child.children);
      return mapped;
    }) || [];

  const mappedNav = nav.filter((item: any) => item.label !== "اتصل بنا" && item.label !== "Contact Us").map((item: any) => ({
    label: item.label,
    href: item.href ? `/${locale}${item.href}` : "#",
    children: mapChildren(item.children),
  }));

  const topbarData = {
    english: site("topbar.english"),
    arabic: site("topbar.arabic"),
    login: site("topbar.login"),
  };

  return (
    <>
      <Header nav={mappedNav} topbar={topbarData} searchLabel={site("search")} locale={locale} logoSettings={logoSettings} />
      <main className="min-h-screen">
        <div className="bg-primary/95">
          <div className="max-w-5xl mx-auto px-4 pt-20 pb-6">
            <h1 className="text-4xl font-bold text-white mb-4">{t("title")}</h1>
            <p className="text-lg text-white/80 mb-8">{t("subtitle")}</p>
            <div className="w-full h-1 bg-white/50 rounded-full"></div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-lg text-neutral-700 leading-relaxed mb-12">{t("content")}</p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-primary mb-4">{t("vision.title")}</h2>
              <p className="text-lg text-neutral-700 leading-relaxed">{t("vision.content")}</p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-primary mb-4">{t("mission.title")}</h2>
              <p className="text-lg text-neutral-700 leading-relaxed">{t("mission.content")}</p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">{t("goals.title")}</h2>
            <ul className="space-y-4">
              {goals.items.map((goal: string, i: number) => (
                <li key={i} className="flex items-start gap-4 text-lg text-neutral-700">
                  <span className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2"></span>
                  <span className="leading-relaxed">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer footerData={footerData} locale={locale} />
    </>
  );
}
