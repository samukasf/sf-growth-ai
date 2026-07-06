import {
  ProjectExecutionPlan,
  type ExecutionPlanner,
  type ExecutiveProject,
  type ProjectMilestone,
} from "../../domain";

export class DefaultExecutionPlanner implements ExecutionPlanner {
  plan(project: ExecutiveProject, milestones: ProjectMilestone[]): ProjectExecutionPlan {
    const phases = milestones.map((milestone) => ({
      name: milestone.title,
      durationDays: milestone.dueInDays,
      activities: [
        `Executar: ${milestone.description}`,
        `Validar entregáveis: ${milestone.deliverables.join(", ")}`,
      ],
      milestoneIds: [milestone.id],
    }));

    const teamRoles =
      project.projectType === "mobile_app"
        ? ["Product Owner", "Designer", "Mobile Dev", "Backend Dev", "QA"]
        : project.projectType === "automation"
          ? ["Analista de Processos", "Engenheiro de Automação", "QA"]
          : ["Product Owner", "Designer", "Full-stack Dev", "QA"];

    return ProjectExecutionPlan.create({
      companyId: project.companyId,
      projectId: project.id,
      phases,
      teamRoles,
      summary: `Plano de execução para ${project.title} com duração estimada de ${project.estimatedDuration} dias.`,
    });
  }
}
