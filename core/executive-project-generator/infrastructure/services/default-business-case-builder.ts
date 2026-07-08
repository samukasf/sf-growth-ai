import { ProjectBusinessCase } from "../../domain";
import type { BuildBusinessCaseInput, BusinessCaseBuilder } from "../../domain";

export class DefaultBusinessCaseBuilder implements BusinessCaseBuilder {
  build(input: BuildBusinessCaseInput): ProjectBusinessCase {
    const { opportunity, proposal } = input;
    return ProjectBusinessCase.create({
      proposalId: proposal.id,
      rationale: `Business case para resolver: ${proposal.problem}`,
      assumptions: [
        `Confiança da oportunidade: ${opportunity.confidence}/100`,
        "Dados operacionais disponíveis para validação",
        "Equipe alocável para execução",
      ],
      risks: ["Prazo pode variar", "Integrações podem exigir ajustes", "Adoção pelos usuários pode ser gradual"],
      successMetrics: [
        "ROI atingido em até 12 meses",
        "Redução de tempo operacional",
        "Aumento de conversão/receita (se aplicável)",
      ],
    });
  }
}

