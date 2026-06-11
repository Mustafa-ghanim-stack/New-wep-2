import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../../../page-content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const raw = await fs.readFile(path.join(process.cwd(), "messages", "ar.json"), "utf-8");
  const ar = JSON.parse(raw);
  const depts: { slug: string }[] = ar.tuitionFees.departments;
  return depts.map((d) => ({ slug: d.slug }));
}

export default async function DepartmentPage({ params }: Props) {
  const { locale, slug } = await params;
  const messages = await getMessages({ locale });
  const nav: any = (messages as any).nav;
  const topbar: any = (messages as any).topbar;
  const footerData: any = (messages as any).footer;
  const logoSettings: any = (messages as any).logo || {};
  const tuitionFees: any = (messages as any).tuitionFees;
  const dept: any = tuitionFees.departments.find((d: any) => d.slug === slug);
  if (!dept) notFound();

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
    english: locale === "ar" ? "English" : "العربية",
    arabic: locale === "ar" ? "العربية" : "English",
    login: locale === "ar" ? "تسجيل الدخول" : "Login",
  };

  return (
    <>
      <Header nav={mappedNav} topbar={topbarData} searchLabel={locale === "ar" ? "بحث" : "Search"} locale={locale} logoSettings={logoSettings} />
      <main className="min-h-screen bg-neutral-50">
        <div className="bg-primary/95">
          <div className="max-w-5xl mx-auto px-4 pt-20 pb-6">
            <Link href={`/${locale}/tuition-fees`} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors">
              <svg className={`w-5 h-5 ${locale === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {locale === "ar" ? "العودة إلى القائمة" : "Back to list"}
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4">{dept.name}</h1>
            <div className="w-full h-1 bg-white/50 rounded-full"></div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            {dept.img && (
              <div className="w-full h-64 relative">
                <Image src={dept.img} alt={dept.name} fill className="object-cover" />
              </div>
            )}
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-primary text-white font-semibold rounded-full text-sm">{dept.branch}</span>
              </div>
              {dept.desc && <p className="text-neutral-700 text-base leading-relaxed mb-6">{dept.desc}</p>}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-neutral-600 mb-2">{locale === "ar" ? "الرسوم الدراسية - صباحي" : "Tuition Fee - Morning"}</p>
                  <p className="text-3xl font-bold text-primary">{dept.morning} <span className="text-lg font-medium">{locale === "ar" ? "د.ع" : "IQD"}</span></p>
                </div>
                <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm font-medium text-neutral-600 mb-2">{locale === "ar" ? "الرسوم الدراسية - مسائي" : "Tuition Fee - Evening"}</p>
                  <p className="text-3xl font-bold text-primary">{dept.evening} <span className="text-lg font-medium">{locale === "ar" ? "د.ع" : "IQD"}</span></p>
                </div>
                <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm font-medium text-neutral-600 mb-2">{locale === "ar" ? "نسبة القبول الصباحي" : "Morning Acceptance Rate"}</p>
                  <p className="text-3xl font-bold text-amber-700">{dept.morningRate}</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm font-medium text-neutral-600 mb-2">{locale === "ar" ? "نسبة القبول المسائي" : "Evening Acceptance Rate"}</p>
                  <p className="text-3xl font-bold text-purple-700">{dept.eveningRate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer footerData={footerData} locale={locale} />
    </>
  );
}
