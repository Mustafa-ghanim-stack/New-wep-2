import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function LocaleStudentPanelRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/student/panel?lang=${locale}`);
}
