import {
  BusinessImprovement,
  type BusinessImprovementAnalyzer,
  type InnovationOpportunity,
} from "../../domain";

export class DefaultBusinessImprovementAnalyzer implements BusinessImprovementAnalyzer {
  analyze(opportunity: InnovationOpportunity): BusinessImprovement[] {
    const improvements: BusinessImprovement[] = [];

    const mapping: Array<{
      types: InnovationOpportunity["opportunityType"][];
      improvementType: BusinessImprovement["type"];
      title: string;
    }> = [
      {
        types: ["cost_reduction"],
        improvementType: "cost_reduction",
        title: "Redução de custos operacionais",
      },
      {
        types: ["revenue_increase"],
        improvementType: "revenue_increase",
        title: "Aumento de receita",
      },
      {
        types: ["operational_improvement", "automation"],
        improvementType: "operational_efficiency",
        title: "Eficiência operacional",
      },
      {
        types: ["new_product"],
        improvementType: "new_product",
        title: "Novo produto",
      },
      {
        types: ["new_service"],
        improvementType: "new_service",
        title: "Novo serviço",
      },
      {
        types: ["software"],
        improvementType: "customer_experience",
        title: "Experiência do cliente via software",
      },
    ];

    for (const item of mapping) {
      if (!item.types.includes(opportunity.opportunityType)) continue;

      improvements.push(
        BusinessImprovement.create({
          companyId: opportunity.companyId,
          opportunityId: opportunity.id,
          type: item.improvementType,
          title: item.title,
          description: opportunity.description,
          expectedImpact: opportunity.expectedImpact,
          implementationEffort: Math.max(20, 100 - opportunity.confidence),
        }),
      );
    }

    if (improvements.length === 0) {
      improvements.push(
        BusinessImprovement.create({
          companyId: opportunity.companyId,
          opportunityId: opportunity.id,
          type: "operational_efficiency",
          title: "Melhoria operacional geral",
          description: opportunity.description,
          expectedImpact: opportunity.expectedImpact,
          implementationEffort: 50,
        }),
      );
    }

    return improvements;
  }
}
