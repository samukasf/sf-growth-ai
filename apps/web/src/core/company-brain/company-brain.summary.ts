import type {
  CompanyBrain,
  CompanyBrainExecutiveSummary,
  DiscoveryResult,
} from "./company-brain.types";

export function summarizeCompanyBrain(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): CompanyBrainExecutiveSummary {
  const reportSummary = discovery?.report.summary;
  const headline = `${brain.companyName}: Company Brain estruturado`;
  const overview =
    reportSummary ??
    [
      `Perfil ${brain.companyProfile.completenessScore}% completo.`,
      `${brain.products.length} produtos e ${brain.services.length} serviços mapeados.`,
      `Score de conhecimento: ${brain.knowledgeScore}/100.`,
    ].join(" ");

  const keyInsights = [
    brain.marketingStatus.summary,
    brain.financialStatus.summary,
    brain.operationalStatus.summary,
    brain.digitalPresence.summary,
  ].filter(Boolean);

  const priorityActions = [
    ...discovery?.report.nextSteps.slice(0, 3) ?? [],
    ...brain.openRisks.slice(0, 2).map((risk) => `Mitigar risco: ${risk}`),
    ...brain.growthOpportunities.slice(0, 2).map((item) => `Explorar: ${item}`),
  ].slice(0, 5);

  return {
    headline,
    overview,
    keyInsights,
    priorityActions,
  };
}
