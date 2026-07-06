import {
  ProjectApproval,
  type ApprovalWorkflow,
  type ExecutiveProject,
} from "../../domain";

export class DefaultApprovalWorkflow implements ApprovalWorkflow {
  createRequest(project: ExecutiveProject): ProjectApproval | null {
    if (!project.approvalRequired) return null;

    return ProjectApproval.create({
      companyId: project.companyId,
      projectId: project.id,
      title: `Aprovação: ${project.title}`,
      justification: `${project.description} Impacto esperado: ${project.expectedImpact}. ROI estimado: R$ ${project.estimatedROI}.`,
      estimatedCost: project.estimatedCost,
      estimatedROI: project.estimatedROI,
    });
  }

  approve(approval: ProjectApproval): ProjectApproval {
    return approval.approve();
  }

  reject(approval: ProjectApproval): ProjectApproval {
    return approval.reject();
  }
}
