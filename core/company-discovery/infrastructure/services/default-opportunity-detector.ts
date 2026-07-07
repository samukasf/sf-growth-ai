import {
  DiscoveryOpportunity,
  type DetectOpportunitiesInput,
  type OpportunityDetector,
} from "../../domain";

export class DefaultOpportunityDetector implements OpportunityDetector {
  detect(input: DetectOpportunitiesInput): DiscoveryOpportunity[] {
    const opportunities: DiscoveryOpportunity[] = [];

    const hasCommercial = input.profile.sections.some((s) => s.key === "commercial" || s.key === "customers");
    const hasOperations = input.profile.sections.some((s) => s.key === "operations");
    const hasTechnology = input.profile.sections.some((s) => s.key === "technology");

    if (hasCommercial) {
      opportunities.push(
        DiscoveryOpportunity.create({
          sessionId: input.sessionId,
          area: "commercial",
          title: "Estruturar pipeline comercial",
          description: "Dados comerciais detectados — oportunidade de digitalizar pipeline e follow-up.",
          priority: "high",
          estimatedImpact: "Aumento de 8–12 pp na conversão",
          estimatedRoi: "700–900%",
        }),
      );
    }

    if (hasOperations) {
      opportunities.push(
        DiscoveryOpportunity.create({
          sessionId: input.sessionId,
          area: "operations",
          title: "Automatizar processos operacionais",
          description: "Processos operacionais identificados — candidatos a automação via Supercérebro.",
          priority: "high",
          estimatedImpact: "Redução de 30% em tarefas repetitivas",
          estimatedRoi: "500–700%",
        }),
      );
    }

    if (!hasTechnology) {
      opportunities.push(
        DiscoveryOpportunity.create({
          sessionId: input.sessionId,
          area: "technology",
          title: "Integrar sistemas existentes",
          description: "Stack tecnológico não mapeado — integração PHC/CRM habilitaria decisões em tempo real.",
          priority: "strategic",
          estimatedImpact: "Visibilidade executiva unificada",
          estimatedRoi: "400–600%",
        }),
      );
    }

    if (input.findings.length >= 15) {
      opportunities.push(
        DiscoveryOpportunity.create({
          sessionId: input.sessionId,
          area: "strategy",
          title: "Ativar Business Twin™ completo",
          description: "Volume suficiente de dados para ativar Gêmeo Digital com alta confiança.",
          priority: "strategic",
          estimatedImpact: "Supercérebro operacional em <30 dias",
          estimatedRoi: "800–1.000%",
        }),
      );
    }

    return opportunities;
  }
}
