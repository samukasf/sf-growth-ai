import {
  ApprovalLevel,
  Department,
  ExecutiveIdentity,
  Organization,
  OrganizationMember,
  OrganizationProfile,
  OrganizationSettings,
  createDepartmentCreatedEvent,
  createMemberActivatedEvent,
  createMemberInvitedEvent,
  createOrganizationCreatedEvent,
  createRoleChangedEvent,
} from "../../domain";
import type { CreateOrganizationDto, InviteMemberDto, ActivateMemberDto, ChangeMemberRoleDto, CreateDepartmentDto } from "../dto";
import type { OrganizationIntelligenceDependencies } from "../dependencies";
import { DEFAULT_APPROVAL_LIMITS, DEFAULT_ROLE_PERMISSIONS } from "../../domain";

export class CreateOrganizationUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: CreateOrganizationDto) {
    const organization = Organization.create({
      name: dto.name,
      legalName: dto.legalName,
      taxId: dto.taxId,
      country: dto.country,
      timezone: dto.timezone,
      currency: dto.currency,
      industry: dto.industry,
      companySize: dto.companySize,
      businessModel: dto.businessModel,
      language: dto.language,
    });

    const profile = OrganizationProfile.create({
      organizationId: organization.id,
      description: `${dto.name} — perfil organizacional`,
      address: "",
      city: "",
      tags: [dto.industry, dto.businessModel],
    });

    const settings = OrganizationSettings.create({
      organizationId: organization.id,
      fiscalYearStart: "01-01",
      workingDays: ["mon", "tue", "wed", "thu", "fri"],
      defaultApprovalCurrency: dto.currency,
      enableAudit: true,
      enableMultiDepartment: true,
      dashboardPersonalization: true,
    });

    await this.deps.organizationRepository.saveOrganization(organization);
    await this.deps.organizationRepository.saveProfile(profile);
    await this.deps.organizationRepository.saveSettings(settings);

    for (const level of DEFAULT_APPROVAL_LIMITS) {
      await this.deps.organizationRepository.saveApprovalLevel(
        ApprovalLevel.create({
          organizationId: organization.id,
          accessLevel: level.accessLevel,
          label: level.label,
          maxAmount: level.maxAmount,
          unlimited: level.unlimited,
          currency: dto.currency,
          order: level.order,
        }),
      );
    }

    await this.deps.eventDispatcher.publish(createOrganizationCreatedEvent(organization));
    await this.deps.auditService.record({
      organizationId: organization.id,
      actorId: "system",
      actorName: "System",
      module: "organization",
      action: "create",
      description: `Organization created: ${organization.name}`,
      result: "success",
    });

    return { organization, profile, settings };
  }
}

export class InviteMemberUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: InviteMemberDto) {
    const permissions = dto.permissions ?? DEFAULT_ROLE_PERMISSIONS[dto.role] ?? [];
    const approvalLimit = DEFAULT_APPROVAL_LIMITS.find((l) => l.accessLevel === dto.role);

    const member = OrganizationMember.create({
      organizationId: dto.organizationId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? "",
      role: dto.role,
      department: dto.department,
      position: dto.position,
      permissions,
      approvalLimit: approvalLimit?.unlimited ? Infinity : (approvalLimit?.maxAmount ?? 0),
      managerId: dto.managerId,
    });

    await this.deps.organizationRepository.saveMember(member);
    await this.deps.eventDispatcher.publish(createMemberInvitedEvent(member));
    await this.deps.auditService.record({
      organizationId: dto.organizationId,
      actorId: dto.actorId,
      actorName: dto.actorName,
      module: "organization",
      action: "invite_member",
      description: `Invited member: ${member.email}`,
      result: "success",
    });

    return member;
  }
}

export class ActivateMemberUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: ActivateMemberDto) {
    const member = await this.deps.organizationRepository.findMemberById(dto.memberId);
    if (!member) throw new Error(`Member not found: ${dto.memberId}`);

    const activated = member.activate();
    const identity = ExecutiveIdentity.create({
      organizationId: dto.organizationId,
      memberId: activated.id,
      executiveAlias: activated.name,
      accessLevel: activated.role,
      dashboardProfile: `${activated.role}-${activated.department}`,
      objectives: [],
      active: true,
    });

    await this.deps.organizationRepository.saveMember(activated);
    await this.deps.organizationRepository.saveExecutiveIdentity(identity);
    await this.deps.eventDispatcher.publish(createMemberActivatedEvent(activated));
    await this.deps.auditService.record({
      organizationId: dto.organizationId,
      actorId: dto.actorId,
      actorName: dto.actorName,
      module: "organization",
      action: "activate_member",
      description: `Activated member: ${activated.email}`,
      result: "success",
    });

    return { member: activated, identity };
  }
}

export class ChangeMemberRoleUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: ChangeMemberRoleDto) {
    const member = await this.deps.organizationRepository.findMemberById(dto.memberId);
    if (!member) throw new Error(`Member not found: ${dto.memberId}`);

    const previousRole = member.role;
    const updated = member.changeRole(dto.newRole, dto.permissions);
    const approvalLimit = DEFAULT_APPROVAL_LIMITS.find((l) => l.accessLevel === dto.newRole);

    const withLimit = OrganizationMember.create({
      ...updated.toJSON(),
      approvalLimit: approvalLimit?.unlimited ? Infinity : (approvalLimit?.maxAmount ?? 0),
    });

    await this.deps.organizationRepository.saveMember(withLimit);
    await this.deps.eventDispatcher.publish(
      createRoleChangedEvent({
        organizationId: dto.organizationId,
        memberId: dto.memberId,
        previousRole,
        newRole: dto.newRole,
      }),
    );
    await this.deps.auditService.record({
      organizationId: dto.organizationId,
      actorId: dto.actorId,
      actorName: dto.actorName,
      module: "organization",
      action: "change_role",
      description: `Role changed from ${previousRole} to ${dto.newRole}`,
      result: "success",
    });

    return withLimit;
  }
}

export class CreateDepartmentUseCase {
  constructor(private readonly deps: OrganizationIntelligenceDependencies) {}

  async execute(dto: CreateDepartmentDto) {
    const department = Department.create({
      organizationId: dto.organizationId,
      name: dto.name,
      code: dto.code,
      parentDepartmentId: dto.parentDepartmentId,
    });

    await this.deps.organizationRepository.saveDepartment(department);
    await this.deps.eventDispatcher.publish(createDepartmentCreatedEvent(department));
    await this.deps.auditService.record({
      organizationId: dto.organizationId,
      actorId: dto.actorId,
      actorName: dto.actorName,
      module: "organization",
      action: "create_department",
      description: `Department created: ${department.name}`,
      result: "success",
    });

    return department;
  }
}
