import { AccessDeniedError } from "../../shared";
import {
  createApprovalGrantedEvent,
  createApprovalRejectedEvent,
  createApprovalRequestedEvent,
} from "../../domain";
import type { RequestApprovalDto, ResolveDashboardContextDto } from "../dto";
import type { OrganizationIntelligenceDependencies } from "../dependencies";

export class RequestApprovalUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: RequestApprovalDto) {
    const member = await this.deps.organizationRepository.findMemberById(dto.memberId);
    if (!member) throw new Error(`Member not found: ${dto.memberId}`);

    const requestId = `approval-req-${Date.now()}`;
    const currency = dto.currency ?? "EUR";

    await this.deps.eventDispatcher.publish(
      createApprovalRequestedEvent({
        organizationId: dto.organizationId,
        requestId,
        memberId: dto.memberId,
        amount: dto.amount,
        currency,
        description: dto.description,
      }),
    );

    const canSelfApprove = this.deps.decisionAuthorityEngine.canApprove(member, dto.amount);

    if (canSelfApprove) {
      await this.deps.eventDispatcher.publish(
        createApprovalGrantedEvent({
          organizationId: dto.organizationId,
          requestId,
          approverId: dto.memberId,
          amount: dto.amount,
        }),
      );
      await this.deps.auditService.record({
        organizationId: dto.organizationId,
        actorId: dto.actorId,
        actorName: dto.actorName,
        module: "approval",
        action: "approve",
        description: `Self-approved ${currency} ${dto.amount}`,
        result: "success",
      });
      return { requestId, status: "granted" as const, approverId: dto.memberId };
    }

    const approver = await this.deps.decisionAuthorityEngine.findRequiredApprover(
      dto.organizationId,
      dto.amount,
    );

    if (!approver) {
      await this.deps.eventDispatcher.publish(
        createApprovalRejectedEvent({
          organizationId: dto.organizationId,
          requestId,
          approverId: "system",
          reason: "No approver with sufficient authority",
        }),
      );
      await this.deps.auditService.record({
        organizationId: dto.organizationId,
        actorId: dto.actorId,
        actorName: dto.actorName,
        module: "approval",
        action: "reject",
        description: `Approval rejected — no authority for ${currency} ${dto.amount}`,
        result: "denied",
      });
      return { requestId, status: "rejected" as const };
    }

    await this.deps.auditService.record({
      organizationId: dto.organizationId,
      actorId: dto.actorId,
      actorName: dto.actorName,
      module: "approval",
      action: "request",
      description: `Approval requested: ${currency} ${dto.amount} — pending ${approver.name}`,
      result: "pending",
    });

    return { requestId, status: "pending" as const, approverId: approver.id };
  }
}

export class ResolveDashboardContextUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: ResolveDashboardContextDto) {
    const member = await this.deps.organizationRepository.findMemberById(dto.memberId);
    if (!member) throw new Error(`Member not found: ${dto.memberId}`);

    const identity = await this.deps.identityResolver.resolveByMemberId(dto.memberId);
    const departments = await this.deps.departmentResolver.resolveByOrganization(dto.organizationId);
    const department = departments.find((d) => d.name === member.department);

    const panels = member.permissions.map((scope) => ({
      scope,
      visible: true,
      priority: member.role === "ceo" || member.role === "owner" ? "high" : "normal",
    }));

    const kpis = department
      ? [`${department.name} — performance`, `${department.name} — budget`]
      : ["Organizational overview"];

    const alerts =
      member.role === "manager" || member.role === "director"
        ? ["Pending approvals", "Team performance"]
        : ["Personal tasks"];

    const tasks = member.permissions.includes("projects")
      ? ["Review active projects", "Update project status"]
      : ["Complete assigned tasks"];

  const actions = member.permissions.map((scope) => `Access ${scope} module`);

    await this.deps.auditService.record({
      organizationId: dto.organizationId,
      actorId: dto.memberId,
      actorName: member.name,
      module: "dashboard",
      action: "resolve_context",
      description: "Dashboard context resolved",
      result: "success",
    });

    return {
      member,
      identity,
      panels,
      recommendations: [`Focus on ${member.department} objectives`],
      alerts,
      kpis,
      tasks,
      actions,
      integrations: {
        orchestrator: this.deps.executiveOrchestrator.isAvailable(),
        companyBrain: this.deps.companyBrain.isAvailable(),
        memory: this.deps.executiveMemory.isAvailable(),
        knowledge: this.deps.executiveKnowledge.isAvailable(),
        learning: this.deps.executiveLearning.isAvailable(),
        experience: this.deps.executiveExperience.isAvailable(),
        wisdom: this.deps.executiveWisdom.isAvailable(),
        innovation: this.deps.executiveInnovation.isAvailable(),
        projectGenerator: this.deps.executiveProjectGenerator.isAvailable(),
        softwareFactory: this.deps.aiSoftwareFactory.isAvailable(),
      },
    };
  }
}

export class CheckAccessUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(input: {
    organizationId: string;
    memberId: string;
    scope: import("../../domain").PermissionScope;
    action: import("../../domain").PermissionAction;
  }) {
    const allowed = await this.deps.accessPolicyEngine.canAccess({
      memberId: input.memberId,
      organizationId: input.organizationId,
      scope: input.scope,
      action: input.action,
    });

    if (!allowed) {
      throw new AccessDeniedError(`${input.action} on ${input.scope}`);
    }

    return true;
  }
}
