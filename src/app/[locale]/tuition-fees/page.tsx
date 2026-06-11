import { getTranslations, getMessages } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../../page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

interface TextStyle { size?: string; font?: string; align?: string; x?: number; y?: number; }
function applyStyle(s?: TextStyle): React.CSSProperties {
  if (!s) return {};
  return {
    ...(s.font ? { fontFamily: s.font } : {}),
    ...(s.size ? { fontSize: `${s.size}px` } : {}),
    ...(s.align ? { textAlign: s.align as any } : {}),
    ...(s.x || s.y ? { transform: `translate(${s.x || 0}px, ${s.y || 0}px)` } : {}),
  };
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tuitionFees" });
  return { title: t("detailsTitle") };
}

export default async function TuitionFeesPage({ params }: Props) {
  const { locale } = await params;
  const site = await getTranslations({ locale });
  const messages = await getMessages({ locale });

  const nav: any = (messages as any).nav;
  const topbar: any = (messages as any).topbar;
  const footerData: any = (messages as any).footer;
  const logoSettings: any = (messages as any).logo || {};
  const tuitionFees: any = (messages as any).tuitionFees;
  const navStyles: any = (messages as any).navStyles || {};
  const departments: any[] = tuitionFees.departments;

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
      <Header nav={mappedNav} navStyles={navStyles} topbar={topbarData} searchLabel={site("search")} locale={locale} logoSettings={logoSettings} />
      <main className="min-h-screen bg-neutral-50">
        <div className="bg-primary/95">
          <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
            <h1 className="text-4xl font-bold text-white mb-4" style={applyStyle(tuitionFees.detailsTitleStyle)}>
              {tuitionFees.detailsTitle}
            </h1>
            <div className="w-full h-1 bg-white/50 rounded-full"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, i) => (
              <Link key={i} href={`/${locale}/tuition-fees/${dept.slug}`} className="block bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {dept.img && (
                  <div className="w-full h-40 relative">
                    <Image src={dept.img} alt={dept.name} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-neutral-900 text-lg mb-2 leading-tight" style={applyStyle(tuitionFees.cardNameStyle)}>
                    {dept.name}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-4" style={applyStyle(tuitionFees.cardBranchStyle)}>
                    {dept.branch}
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                      <span className="text-xs font-medium text-neutral-700" style={applyStyle(tuitionFees.morningLabelStyle)}>{tuitionFees.morning}</span>
                      <span className="text-sm font-bold text-primary" style={applyStyle(tuitionFees.cardFeeValueStyle)}>{dept.morning} {locale === "ar" ? "د.ع" : "IQD"}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                      <span className="text-xs font-medium text-neutral-700" style={applyStyle(tuitionFees.eveningLabelStyle)}>{tuitionFees.evening}</span>
                      <span className="text-sm font-bold text-primary" style={applyStyle(tuitionFees.cardFeeValueStyle)}>{dept.evening} {locale === "ar" ? "د.ع" : "IQD"}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
                      <span className="text-xs font-medium text-neutral-700" style={applyStyle(tuitionFees.morningRateLabelStyle)}>{tuitionFees.morningRate}</span>
                      <span className="text-sm font-bold text-amber-700" style={applyStyle(tuitionFees.cardRateStyle)}>{dept.morningRate}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
                      <span className="text-xs font-medium text-neutral-700" style={applyStyle(tuitionFees.eveningRateLabelStyle)}>{tuitionFees.eveningRate}</span>
                      <span className="text-sm font-bold text-purple-700" style={applyStyle(tuitionFees.cardRateStyle)}>{dept.eveningRate}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer footerData={footerData} locale={locale} />
    </>
  );
}
