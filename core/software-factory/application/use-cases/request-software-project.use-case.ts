import {
  SoftwareProject,
  createArchitectureGeneratedEvent,
  createDeploymentPreparedEvent,
  createGenerationCompletedEvent,
  createGenerationStartedEvent,
  createRequirementsCompletedEvent,
  createSoftwareRequestedEvent,
  type RequestSoftwareInput,
  type SoftwareFactoryResult,
} from "../../domain";
import type { SoftwareFactoryDependencies } from "../dependencies";

export class RequestSoftwareProjectUseCase {
  constructor(private readonly deps: SoftwareFactoryDependencies) {}

  async execute(input: RequestSoftwareInput): Promise<SoftwareFactoryResult> {
    let project = SoftwareProject.create({
      organizationId: input.organizationId,
      companyId: input.companyId,
      projectType: input.projectType,
      sourceProjectId: input.sourceProjectId,
      title: input.title,
      description: input.description,
      businessProblem: input.businessProblem,
      businessGoals: input.businessGoals,
      functionalRequirements: input.functionalRequirements,
      technicalRequirements: input.technicalRequirements,
      architecture: input.architecture ?? "planned",
      estimatedCost: input.estimatedCost,
      estimatedTime: input.estimatedTime,
      estimatedROI: input.estimatedROI,
      priority: input.priority,
    });
    await this.deps.repository.saveProject(project);
    await this.deps.eventDispatcher.publish(createSoftwareRequestedEvent(project));

    const analyzed = this.deps.requirementsAnalyzer.analyze({ project, context: input.context });
    await this.deps.repository.saveBusinessRequirements(analyzed.businessRequirements);
    await this.deps.repository.saveFunctionalRequirements(analyzed.functionalRequirements);
    await this.deps.repository.saveTechnicalRequirements(analyzed.technicalRequirements);

    const specification = this.deps.specificationBuilder.build({
      project,
      businessRequirements: analyzed.businessRequirements,
      functionalRequirements: analyzed.functionalRequirements,
      technicalRequirements: analyzed.technicalRequirements,
    });
    await this.deps.repository.saveSpecification(specification);
    await this.deps.eventDispatcher.publish(createRequirementsCompletedEvent(project, specification));

    let architecture = this.deps.architectureGenerator.generate({ project, specification });
    architecture = this.deps.modulePlanner.plan({ project, specification, architecture });
    await this.deps.repository.saveArchitecture(architecture);
    project = project.withArchitecture(architecture.style);
    await this.deps.repository.saveProject(project);
    await this.deps.eventDispatcher.publish(createArchitectureGeneratedEvent(project, architecture));

    await this.deps.eventDispatcher.publish(createGenerationStartedEvent(project));
    const artifacts = this.deps.artifactGenerator.generate({ project, specification, architecture });
    for (const artifact of artifacts) {
      await this.deps.repository.saveArtifact(artifact);
    }
    await this.deps.eventDispatcher.publish(createGenerationCompletedEvent(project, artifacts.length));

    const deploymentPlan = this.deps.deploymentPlanner.plan({ project, architecture, artifacts });
    await this.deps.repository.saveDeploymentPlan(deploymentPlan);
    await this.deps.eventDispatcher.publish(createDeploymentPreparedEvent(project, deploymentPlan));

    const approval = this.deps.approvalManager.request(project);
    await this.deps.repository.saveApproval(approval);

    if (this.deps.executiveProjectGenerator.isAvailable()) {
      await this.deps.executiveProjectGenerator.notifySoftwareFactoryRequested(
        project.organizationId,
        project.companyId,
        project,
      );
    }

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.requestSoftwareApproval(
        project.organizationId,
        project.companyId,
        approval.toJSON(),
      );
    }

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.deliverSoftwareBriefing(project.organizationId, project.companyId, {
        project: project.toJSON(),
        specification: specification.toJSON(),
        architecture: architecture.toJSON(),
        artifacts: artifacts.map((artifact) => artifact.toJSON()),
        deploymentPlan: deploymentPlan.toJSON(),
      });
    }

    if (project.projectType === "automation" && this.deps.businessAutomationPlatform.isAvailable()) {
      await this.deps.businessAutomationPlatform.evaluateAutomationBlueprint(
        project.organizationId,
        project.companyId,
        project,
      );
    }

    if (this.deps.aiProviderLayer.isAvailable()) {
      await this.deps.aiProviderLayer.registerPlannedGeneration(
        project.organizationId,
        project.companyId,
        project,
      );
    }

    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.syncSoftwareProjects(
        project.organizationId,
        project.companyId,
        [project.toJSON()],
      );
    }

    const result = await this.deps.repository.findResultByProject(project.id);
    return result!;
  }
}

