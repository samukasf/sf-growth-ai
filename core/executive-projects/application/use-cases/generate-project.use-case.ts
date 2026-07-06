import {
  ProjectROI,
  ProjectScope,
  createProjectGeneratedEvent,
} from "../../domain";
import type { GenerateProjectDto } from "../dto";
import type { ExecutiveProjectEngineDependencies } from "../dependencies";

function generateScope(
  project: ReturnType<ExecutiveProjectEngineDependencies["projectGenerator"]["generate"]>,
): ProjectScope {
  return ProjectScope.create({
    companyId: project.companyId,
    projectId: project.id,
    inScope: [
      `Desenvolvimento de ${project.title}`,
      "Documentação técnica e funcional",
      "Testes e validação",
    ],
    outOfScope: [
      "Manutenção pós-entrega além do período acordado",
      "Integrações não especificadas",
      "Treinamento extensivo da equipe",
    ],
    assumptions: [
      "Stakeholders disponíveis para validações",
      "Acesso aos sistemas necessários",
      "Requisitos estáveis durante o desenvolvimento",
    ],
    constraints: [
      `Prazo estimado: ${project.estimatedDuration} dias`,
      `Orçamento estimado: R$ ${project.estimatedCost}`,
    ],
  });
}

export class GenerateProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectEngineDependencies) {}

  async execute(dto: GenerateProjectDto) {
    const project = this.deps.projectGenerator.generate({
      companyId: dto.companyId,
      projectType: dto.projectType,
      businessProblem: dto.businessProblem,
      proposedSolution: dto.proposedSolution,
      title: dto.title,
      description: dto.description,
      expectedImpact: dto.expectedImpact,
      estimatedROI: dto.estimatedROI,
      estimatedCost: dto.estimatedCost,
      estimatedDuration: dto.estimatedDuration,
      relatedInnovation: dto.relatedInnovation,
      relatedKnowledge: dto.relatedKnowledge,
      relatedLearning: dto.relatedLearning,
      relatedWisdom: dto.relatedWisdom,
      tags: dto.tags,
    });

    const requirements = this.deps.requirementGenerator.generate(project);
    const architecture = this.deps.architectureGenerator.generate(project);
    const scope = generateScope(project);
    const milestones = this.deps.milestoneGenerator.generate(project);
    const budget = this.deps.budgetEstimator.estimate(project);
    const risks = this.deps.riskEvaluator.evaluate(project);
    const executionPlan = this.deps.executionPlanner.plan(project, milestones);

    const monthlyBenefit = project.expectedImpact * 400;
    const roi = ProjectROI.create({
      companyId: project.companyId,
      projectId: project.id,
      estimatedReturn: monthlyBenefit * 12,
      estimatedCost: budget.totalCost,
      paybackMonths: monthlyBenefit > 0 ? Math.ceil(budget.totalCost / monthlyBenefit) : 0,
      confidence: project.priority,
    });

    const enriched = project.update({
      estimatedCost: budget.totalCost,
      estimatedROI: roi.estimatedReturn,
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        dueInDays: m.dueInDays,
        order: m.order,
      })),
      deliverables: milestones.flatMap((m) => m.deliverables),
    });

    await this.deps.repository.saveProject(enriched);
    await this.deps.repository.saveRequirements(requirements);
    await this.deps.repository.saveArchitecture(architecture);
    await this.deps.repository.saveScope(scope);
    await this.deps.repository.saveMilestones(milestones);
    await this.deps.repository.saveBudget(budget);
    await this.deps.repository.saveRisks(risks);
    await this.deps.repository.saveROI(roi);
    await this.deps.repository.saveExecutionPlan(executionPlan);

    const approval = this.deps.approvalWorkflow.createRequest(enriched);
    if (approval) {
      await this.deps.repository.saveApproval(approval);
    }

    await this.deps.eventDispatcher.publish(createProjectGeneratedEvent(enriched));

    return {
      project: enriched,
      requirements,
      architecture,
      scope,
      milestones,
      budget,
      risks,
      roi,
      executionPlan,
      approval,
    };
  }
}
