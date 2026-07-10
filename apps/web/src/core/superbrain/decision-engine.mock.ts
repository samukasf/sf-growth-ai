import type { OrchestratorResponse } from "../orchestrator/orchestrator.types";
import type { MockExecutiveDecision } from "./superbrain.types";
import { MOCK_COMPANY_BRAIN } from "./superbrain.mocks";

export function generateMockDecision(
  orchestrator: OrchestratorResponse,
): MockExecutiveDecision {
  const brain = orchestrator.runtime.companyBrain ?? MOCK_COMPANY_BRAIN;

  return {
    id: `decision-${Date.now()}`,
    title: "Definir posicionamento oficial da marca",
    description:
      "Conduzir workshop executivo para formalizar posicionamento, promessa e território de marca antes de escalar mídia paga.",
    priority: "Critical",
    impact: "Marca + Vendas",
    department: "Estratégia",
    rationale: [
      `Growth Score ${brain.growthScore ?? 642}/1000 com blocker em posicionamento.`,
      orchestrator.runtime.executiveCouncil?.summary ?? "Conselho recomenda fundação de marca.",
      `${orchestrator.runtime.memorySummary?.totalMemories ?? 0} memórias consultadas.`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
