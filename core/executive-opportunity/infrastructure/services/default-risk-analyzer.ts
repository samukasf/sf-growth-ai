import { OpportunityRisk } from "../../domain";
import type { RiskAnalysisInput, RiskAnalysisOutput, RiskAnalyzer } from "../../domain";
import type { OpportunityRiskLevel } from "../../shared";

const TYPE_RISK: Record<string, { level: OpportunityRiskLevel; score: number; factors: string[] }> = {
  create_software: {
    level: "high",
    score: 70,
    factors: ["Complexidade técnica", "Prazo de desenvolvimento", "Dependência de equipa"],
  },
  automate_process: {
    level: "medium",
    score: 45,
    factors: ["Resistência à mudança", "Integração com sistemas existentes"],
  },
  switch_supplier: {
    level: "medium",
    score: 50,
    factors: ["Disrupção operacional", "Qualidade do novo fornecedor"],
  },
  new_sales_channel: {
    level: "medium",
    score: 55,
    factors: ["Investimento inicial", "Curva de aprendizagem comercial"],
  },
  reduce_costs: {
    level: "low",
    score: 25,
    factors: ["Impacto em qualidade se mal executado"],
  },
};

export class DefaultRiskAnalyzer implements RiskAnalyzer {
  analyze(input: RiskAnalysisInput): RiskAnalysisOutput {
    const { opportunity } = input;
    const profile = TYPE_RISK[opportunity.opportunityType] ?? {
      level: "medium" as OpportunityRiskLevel,
      score: 40,
      factors: ["Risco operacional padrão"],
    };

    const risk = OpportunityRisk.create({
      opportunityId: opportunity.id,
      level: profile.level,
      score: profile.score,
      factors: profile.factors,
      mitigation: [
        "Validar com stakeholders antes da execução",
        "Implementar em fases com checkpoints",
        "Monitorizar KPIs semanalmente",
      ],
    });

    return { risk, level: profile.level };
  }
}
