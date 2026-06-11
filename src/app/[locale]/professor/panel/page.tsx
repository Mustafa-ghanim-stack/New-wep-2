import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function LocaleProfessorPanelRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/professor/panel?lang=${locale}`);
}
