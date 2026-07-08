import { DeploymentPlan, type DeploymentPlanner, type PlanDeploymentInput } from "../../domain";

export class DefaultDeploymentPlanner implements DeploymentPlanner {
  plan(input: PlanDeploymentInput): DeploymentPlan {
    const { project, artifacts } = input;
    return DeploymentPlan.create({
      projectId: project.id,
      environments: ["development", "staging", "production"],
      rolloutStrategy: project.projectType === "api" ? "progressive rollout" : "staged rollout",
      prerequisites: [
        "Aprovação executiva",
        "Infraestrutura provisionada",
        `Artefatos planejados: ${artifacts.length}`,
      ],
      validationChecklist: [
        "Smoke tests",
        "Validação de integrações",
        "Validação de segurança",
        "Checklist de observabilidade",
      ],
    });
  }
}

