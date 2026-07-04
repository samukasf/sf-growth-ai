import type { MockExecutive, SprintExecutiveId } from "./executive-orchestrator.types";

export const MOCK_EXECUTIVES: Record<SprintExecutiveId, MockExecutive> = {
  samuel: {
    id: "samuel",
    name: "Samuel AI",
    role: "CEO",
    title: "Chief Executive Officer",
    domain: "Coordenação executiva e decisão final",
  },
  sophia: {
    id: "sophia",
    name: "Sophia",
    role: "CMO",
    title: "Chief Marketing Officer",
    domain: "Marca, aquisição e campanhas",
  },
  victor: {
    id: "victor",
    name: "Victor",
    role: "CFO",
    title: "Chief Financial Officer",
    domain: "Finanças, caixa e ROI",
  },
  lucas: {
    id: "lucas",
    name: "Lucas",
    role: "COO",
    title: "Chief Operating Officer",
    domain: "Operações, processos e eficiência",
  },
  "business-twin": {
    id: "business-twin",
    name: "Business Twin™",
    role: "CDO",
    title: "Memória factual da empresa",
    domain: "Dados internos — apresenta fatos, não opina",
  },
  "market-intelligence": {
    id: "market-intelligence",
    name: "Market Intelligence",
    role: "CMI",
    title: "Inteligência de Mercado",
    domain: "Concorrentes, tendências e economia",
  },
};

export const SPRINT_EXECUTIVE_ORDER: SprintExecutiveId[] = [
  "samuel",
  "sophia",
  "victor",
  "lucas",
  "business-twin",
  "market-intelligence",
];
