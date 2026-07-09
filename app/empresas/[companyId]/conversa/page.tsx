import { notFound, redirect } from "next/navigation";

import { FirstConversationFlow } from "@/features/portfolio-companies/components/FirstConversation";
import { PortfolioShell } from "@/features/portfolio-companies/components/CompanyListPage";
import { getPortfolioCompanyAction } from "@/features/portfolio-companies/actions/company-brain.action";

export const dynamic = "force-dynamic";

type ConversationPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { companyId } = await params;
  const company = await getPortfolioCompanyAction(companyId);

  if (!company) {
    notFound();
  }

  if ((company.brain_status ?? "inactive") !== "active") {
    redirect(`/empresas/${companyId}`);
  }

  return (
    <PortfolioShell title="Samuel" subtitle={`Primeira conversa · ${company.name}`}>
      <FirstConversationFlow company={company} />
    </PortfolioShell>
  );
}
