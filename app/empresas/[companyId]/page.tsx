import { notFound } from "next/navigation";

import { CompanyDashboard } from "@/features/portfolio-companies/components/CompanyDashboard";
import { PortfolioShell } from "@/features/portfolio-companies/components/CompanyListPage";
import { getPortfolioCompanyAction } from "@/features/portfolio-companies/actions/company-brain.action";

export const dynamic = "force-dynamic";

type CompanyPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  const company = await getPortfolioCompanyAction(companyId);

  if (!company) {
    notFound();
  }

  return (
    <PortfolioShell title={company.name} subtitle="Dashboard da empresa">
      <CompanyDashboard company={company} />
    </PortfolioShell>
  );
}
