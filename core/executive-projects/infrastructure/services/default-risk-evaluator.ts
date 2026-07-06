import { ProjectRisk, type ExecutiveProject, type RiskEvaluator } from "../../domain";

export class DefaultRiskEvaluator implements RiskEvaluator {
  evaluate(project: ExecutiveProject): ProjectRisk[] {
    const risks = [
      {
        title: "Escopo mal definido",
        description: "Requisitos incompletos podem gerar retrabalho.",
        level: "medium" as const,
        mitigation: "Workshop de descoberta e documentação formal de escopo.",
        probability: 40,
      },
      {
        title: "Atraso no cronograma",
        description: "Complexidade técnica pode estender prazos.",
        level: project.complexity >= 70 ? ("high" as const) : ("medium" as const),
        mitigation: "Sprints curtas com entregas incrementais.",
        probability: project.complexity >= 70 ? 55 : 35,
      },
      {
        title: "Dependências externas",
        description: "Integrações de terceiros podem bloquear progresso.",
        level: "medium" as const,
        mitigation: "Mapear dependências cedo e criar mocks para desenvolvimento.",
        probability: 30,
      },
    ];

    if (project.approvalRequired) {
      risks.push({
        title: "Aprovação pendente",
        description: "Projeto aguarda aprovação executiva para iniciar.",
        level: "high" as const,
        mitigation: "Apresentar business case com ROI estimado.",
        probability: 60,
      });
    }

    return risks.map((risk) =>
      ProjectRisk.create({
        companyId: project.companyId,
        projectId: project.id,
        title: risk.title,
        description: risk.description,
        level: risk.level,
        mitigation: risk.mitigation,
        probability: risk.probability,
      }),
    );
  }
}
