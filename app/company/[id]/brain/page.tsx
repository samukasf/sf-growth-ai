import { notFound } from "next/navigation";

import { CompanyBrainViewer } from "@/features/company-brain";
import { PortfolioShell } from "@/features/portfolio-companies/components/CompanyListPage";
import { getCompanyBrainViewAction } from "@/features/portfolio-companies/actions/company-brain.action";

export const dynamic = "force-dynamic";

type CompanyBrainPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyBrainPage({ params }: CompanyBrainPageProps) {
  const { id } = await params;
  const viewData = await getCompanyBrainViewAction(id);

  if (!viewData) {
    notFound();
  }

  return (
    <PortfolioShell title={viewData.company.name} subtitle="Company Brain">
      <CompanyBrainViewer
        company={viewData.company}
        initialBuildResponse={viewData.buildResponse}
      />
    </PortfolioShell>
  );
}
