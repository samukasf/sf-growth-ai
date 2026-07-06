import {
  ProjectMilestone,
  type ExecutiveProject,
  type MilestoneGenerator,
} from "../../domain";

export class DefaultMilestoneGenerator implements MilestoneGenerator {
  generate(project: ExecutiveProject): ProjectMilestone[] {
    const phases = [
      {
        title: "Descoberta e Planejamento",
        description: "Levantamento de requisitos e definição de escopo.",
        ratio: 0.15,
        deliverables: ["Documento de requisitos", "Plano de projeto"],
      },
      {
        title: "Design e Arquitetura",
        description: "Prototipação, UX/UI e definição técnica.",
        ratio: 0.2,
        deliverables: ["Protótipo", "Arquitetura técnica"],
      },
      {
        title: "Desenvolvimento",
        description: "Implementação dos módulos principais.",
        ratio: 0.45,
        deliverables: ["MVP funcional", "Testes unitários"],
      },
      {
        title: "Testes e Homologação",
        description: "QA, correções e validação com stakeholders.",
        ratio: 0.15,
        deliverables: ["Relatório de testes", "Aprovação de homologação"],
      },
      {
        title: "Deploy e Entrega",
        description: "Publicação em produção e handoff.",
        ratio: 0.05,
        deliverables: ["Deploy em produção", "Documentação final"],
      },
    ];

    let cumulativeDays = 0;

    return phases.map((phase, index) => {
      const dueInDays = Math.max(1, Math.round(project.estimatedDuration * phase.ratio));
      cumulativeDays += dueInDays;

      return ProjectMilestone.create({
        companyId: project.companyId,
        projectId: project.id,
        title: phase.title,
        description: phase.description,
        dueInDays: cumulativeDays,
        order: index + 1,
        deliverables: phase.deliverables,
      });
    });
  }
}
