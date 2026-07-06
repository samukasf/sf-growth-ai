import {
  AutomationOpportunity,
  type AutomationOpportunityAnalyzer,
  type InnovationOpportunity,
} from "../../domain";

const MANUAL_INDICATORS = [
  "manual",
  "planilha",
  "spreadsheet",
  "excel",
  "repetitivo",
  "repetitive",
  "copiar",
  "colar",
  "digitar",
];

export class DefaultAutomationOpportunityAnalyzer implements AutomationOpportunityAnalyzer {
  analyze(opportunity: InnovationOpportunity): AutomationOpportunity[] {
    const text = `${opportunity.problemDetected} ${opportunity.description}`.toLowerCase();
    const isAutomation =
      opportunity.opportunityType === "automation" ||
      MANUAL_INDICATORS.some((keyword) => text.includes(keyword));

    if (!isAutomation) return [];

    return [
      AutomationOpportunity.create({
        companyId: opportunity.companyId,
        opportunityId: opportunity.id,
        processName: opportunity.title,
        manualSteps: [
          "Coletar dados manualmente",
          "Processar informações em planilha",
          "Enviar resultado para próximo responsável",
        ],
        automationPotential: Math.min(100, opportunity.expectedImpact + 10),
        estimatedTimeSavedHours: Math.round(opportunity.estimatedTime * 0.6),
        description: `Processo manual identificado: ${opportunity.problemDetected}`,
      }),
    ];
  }
}
