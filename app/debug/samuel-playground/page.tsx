import type { Metadata } from "next";

import { SamuelPlaygroundPage } from "@/features/samuel-playground/components/samuel-playground-page";
import { listCompanies } from "@/features/samuel-playground/list-companies";

export const metadata: Metadata = {
  title: "Samuel Playground | SF Growth AI",
  description:
    "Ferramenta oficial de desenvolvimento e depuração do Samuel Runtime: pipeline completo, Intent, contexto, memórias, Company Brain, Executive Council, provider/modelo de IA, tokens, custo e resposta final.",
};

export default async function SamuelPlaygroundDebugRoute() {
  let companies: Array<{ id: string; name: string }> = [];

  try {
    companies = await listCompanies();
  } catch {
    companies = [];
  }

  return <SamuelPlaygroundPage companies={companies} />;
}
