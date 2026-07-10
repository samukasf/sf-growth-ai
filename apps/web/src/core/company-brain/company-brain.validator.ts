import type {
  CompanyBrain,
  CompanyBrainValidationIssue,
  CompanyBrainValidationResult,
} from "./company-brain.types";

export function validateCompanyBrain(brain: CompanyBrain): CompanyBrainValidationResult {
  const issues: CompanyBrainValidationIssue[] = [];

  if (!brain.profile.companyName.trim()) {
    issues.push({ field: "profile.companyName", message: "Nome da empresa é obrigatório.", severity: "error" });
  }

  if (!brain.profile.industry.trim()) {
    issues.push({ field: "profile.industry", message: "Setor/indústria não definido.", severity: "warning" });
  }

  if (!brain.mission.trim()) {
    issues.push({ field: "mission", message: "Missão não definida.", severity: "warning" });
  }

  if (!brain.vision.trim()) {
    issues.push({ field: "vision", message: "Visão não definida.", severity: "warning" });
  }

  if (brain.values.length === 0) {
    issues.push({ field: "values", message: "Valores organizacionais ausentes.", severity: "warning" });
  }

  if (brain.products.length === 0 && brain.services.length === 0) {
    issues.push({
      field: "offerings",
      message: "Produtos e serviços não mapeados.",
      severity: "warning",
    });
  }

  if (brain.swot.strengths.length === 0 || brain.swot.weaknesses.length === 0) {
    issues.push({ field: "swot", message: "SWOT incompleto.", severity: "warning" });
  }

  if (brain.knowledgeScore < 40) {
    issues.push({
      field: "knowledgeScore",
      message: "Base de conhecimento ainda limitada.",
      severity: "warning",
    });
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}
