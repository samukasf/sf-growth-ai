import type { Metadata } from "next";

import { APP_NAME } from "@/constants";
import {
  ExecutiveHome,
  listPortfolioCompaniesAction,
  type PortfolioCompanyRecord,
} from "@/features/executive-home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Executive Home | ${APP_NAME}`,
  description: "Primeira experiência oficial do SF Growth AI.",
};

export default async function Home() {
  let initialCompanies: PortfolioCompanyRecord[] = [];

  try {
    initialCompanies = await listPortfolioCompaniesAction();
  } catch {
    initialCompanies = [];
  }

  return <ExecutiveHome initialCompanies={initialCompanies} />;
}
