import type { Metadata } from "next";

import { samuelAi } from "@/features";
import {
  getCompanyMemory,
  getFirstCompany,
  type CompanyMemoryRecord,
} from "@/services/executive-memory.service";

export const metadata: Metadata = {
  title: "Samuel AI™ | SF Growth AI",
  description: "Seu executivo de inteligência artificial.",
};

export default async function SamuelAiRoute() {
  let companyMemories: CompanyMemoryRecord[] = [];

  try {
    const company = await getFirstCompany();

    if (company) {
      companyMemories = await getCompanyMemory(company.id);
    }
  } catch {
    companyMemories = [];
  }

  return <samuelAi.SamuelAiPage companyMemories={companyMemories} />;
}
