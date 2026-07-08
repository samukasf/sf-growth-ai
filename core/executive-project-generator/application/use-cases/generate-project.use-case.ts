import {
  ExecutiveProject,
  ProjectOpportunity,
  createBusinessCaseCreatedEvent,
  createProjectGeneratedEvent,
  createRoadmapCreatedEvent,
  type GenerateProjectInput,
  type GenerateProjectResult,
} from "../../domain";
import type { ExecutiveProjectGeneratorDependencies } from "../dependencies";

export class GenerateProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectGeneratorDependencies) {}

  async execute(input: GenerateProjectInput): Promise<GenerateProjectResult> {
    const opportunity = ProjectOpportunity.create({
      organizationId: input.organizationId,
      companyId: input.companyId,
      source: input.opportunity.source,
      opportunityRefId: input.opportunity.opportunityRefId,
      title: input.opportunity.title,
      description: input.opportunity.description,
      category: input.opportunity.category,
      estimatedROI: input.opportunity.estimatedROI,
      confidence: input.opportunity.confidence,
    });
    await this.deps.repository.saveOpportunity(opportunity);

    const proposal = this.deps.projectPlanner.propose({
      opportunity,
      projectType: input.projectType,
    });
    await this.deps.repository.saveProposal(proposal);

    const businessCase = this.deps.businessCaseBuilder.build({ opportunity, proposal });
    await this.deps.repository.saveBusinessCase(businessCase);

    // materialize project shell first so ROI/Roadmap engines can reference projectId
    let project = this.deps.projectPlanner.materializeProject({
      opportunity,
      proposal,
      priority: "medium",
      riskLevel: "medium",
      businessImpact: 50,
      estimatedInvestment: 0,
      estimatedROI: opportunity.estimatedROI,
      estimatedTime: 12,
      roadmap: null,
    });
    project = ExecutiveProject.create({
      ...project.toJSON(),
      sourceOpportunityId: opportunity.id,
      proposalId: proposal.id,
    });
    await this.deps.repository.saveProject(project);
    await this.deps.eventDispatcher.publish(createBusinessCaseCreatedEvent(project, businessCase));

    const roi = this.deps.roiEngine.compute({ project, opportunity });
    await this.deps.repository.saveROI(roi);

    const roadmap = this.deps.roadmapGenerator.generate({ project, projectType: proposal.projectType });
    await this.deps.repository.saveRoadmap(roadmap);
    await this.deps.eventDispatcher.publish(createRoadmapCreatedEvent(project, roadmap));

    const depsList = this.deps.dependencyAnalyzer.analyze({ project, proposal });
    for (const d of depsList) await this.deps.repository.saveDependency(d);

    const { priority, riskLevel, businessImpact } = this.deps.priorityEngine.calculate({ project, roi });
    project = ExecutiveProject.create({
      ...project.toJSON(),
      estimatedInvestment: roi.estimatedInvestment,
      estimatedROI: roi.estimatedROI,
      estimatedTime: roadmap.totalWeeks,
      priority,
      riskLevel,
      businessImpact,
      implementationRoadmap: roadmap.toJSON(),
    });
    await this.deps.repository.saveProject(project);

    const approval = this.deps.approvalCoordinator.requestApproval({
      project,
      requestedBy: "system",
    });
    await this.deps.repository.saveApproval(approval);

    await this.deps.eventDispatcher.publish(createProjectGeneratedEvent(project));

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.requestApproval(input.organizationId, input.companyId, {
        approvalId: approval.id,
        projectId: project.id,
        briefing: {
          projectId: project.id,
          title: project.title,
          summary: project.description,
          investment: project.estimatedInvestment,
          roi: project.estimatedROI,
          roadmapWeeks: roadmap.totalWeeks,
          priority: project.priority,
          riskLevel: project.riskLevel,
        },
      });
    }

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.deliverProjectBriefing(input.organizationId, input.companyId, {
        project: project.toJSON(),
        opportunity: opportunity.toJSON(),
        proposal: proposal.toJSON(),
        businessCase: businessCase.toJSON(),
        roi: roi.toJSON(),
        roadmap: roadmap.toJSON(),
      });
    }

    if (this.deps.executiveOpportunityEngine.isAvailable()) {
      await this.deps.executiveOpportunityEngine.notifyProjectGenerated(
        input.organizationId,
        input.companyId,
        project,
      );
    }

    if (project.priority === "strategic" && this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.syncProjects(input.organizationId, input.companyId, [project.toJSON()]);
    }

    if (proposal.projectType === "create_automations" && this.deps.businessAutomationPlatform.isAvailable()) {
      await this.deps.businessAutomationPlatform.evaluateAutomationProject(input.organizationId, input.companyId, project);
    }

    if (
      ["create_internal_system", "create_virtual_assistant", "create_integration"].includes(proposal.projectType) &&
      this.deps.softwareFactory.isAvailable()
    ) {
      await this.deps.softwareFactory.evaluateSoftwareProject(input.organizationId, input.companyId, project);
    }

    const result = await this.deps.repository.findResultByProject(project.id);
    return result!;
  }
}

