import { CompanyListPage } from "@/features/portfolio-companies/components/CompanyListPage";
import {
  listPortfolioCompaniesAction,
  type PortfolioCompanyRecord,
} from "@/features/executive-home/actions/create-company.action";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  let companies: PortfolioCompanyRecord[] = [];

  try {
    companies = await listPortfolioCompaniesAction();
  } catch {
    companies = [];
  }

  return <CompanyListPage companies={companies} />;
}
