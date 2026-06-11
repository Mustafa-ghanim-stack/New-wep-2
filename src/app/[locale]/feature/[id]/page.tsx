import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import FeatureShell from "../FeatureShell";

type Props = { params: Promise<{ locale: string; id: string }> };

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

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default async function FeatureDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const messages = await getMessages({ locale }) as any;
  const features: any[] = Array.isArray(messages?.features) ? messages.features : [];
  const idx = parseInt(id, 10);
  const feat = features[idx];
  if (!feat) notFound();

  const ytId = getYouTubeId(feat.youtube || '');
  const isAr = locale === "ar";

  return (
    <FeatureShell locale={locale}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Media */}
            {ytId ? (
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={feat.title}
                />
              </div>
            ) : feat.img ? (
              <img src={feat.img} alt={feat.title} className="w-full max-h-96 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-primary to-primary-light" />
            )}

            {/* Content */}
            <div className="p-8">
              {feat.category && (
                <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {feat.category}
                </span>
              )}
              {feat.date && (
                <p className="text-xs text-primary font-medium mb-2">
                  {formatDate(feat.date, locale)}
                </p>
              )}
              <h1 className="text-2xl font-bold text-text-dark mb-5 leading-snug">{feat.title}</h1>
              <p className="text-text-light leading-relaxed text-base whitespace-pre-line">{feat.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </FeatureShell>
  );
}
