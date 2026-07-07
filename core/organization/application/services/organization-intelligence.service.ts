import type {
  ActivateMemberDto,
  ChangeMemberRoleDto,
  CreateDepartmentDto,
  CreateOrganizationDto,
  InviteMemberDto,
  RequestApprovalDto,
  ResolveDashboardContextDto,
} from "../dto";
import type { OrganizationIntelligenceDependencies } from "../dependencies";
import {
  ActivateMemberUseCase,
  ChangeMemberRoleUseCase,
  CheckAccessUseCase,
  CreateDepartmentUseCase,
  CreateOrganizationUseCase,
  InviteMemberUseCase,
  RequestApprovalUseCase,
  ResolveDashboardContextUseCase,
} from "../use-cases";

export class OrganizationIntelligenceService {
  private readonly createOrgUseCase: CreateOrganizationUseCase;
  private readonly inviteMemberUseCase: InviteMemberUseCase;
  private readonly activateMemberUseCase: ActivateMemberUseCase;
  private readonly changeRoleUseCase: ChangeMemberRoleUseCase;
  private readonly createDepartmentUseCase: CreateDepartmentUseCase;
  private readonly requestApprovalUseCase: RequestApprovalUseCase;
  private readonly resolveDashboardUseCase: ResolveDashboardContextUseCase;
  private readonly checkAccessUseCase: CheckAccessUseCase;

  constructor(private readonly deps: OrganizationIntelligenceDependencies) {
    this.createOrgUseCase = new CreateOrganizationUseCase(deps);
    this.inviteMemberUseCase = new InviteMemberUseCase(deps);
    this.activateMemberUseCase = new ActivateMemberUseCase(deps);
    this.changeRoleUseCase = new ChangeMemberRoleUseCase(deps);
    this.createDepartmentUseCase = new CreateDepartmentUseCase(deps);
    this.requestApprovalUseCase = new RequestApprovalUseCase(deps);
    this.resolveDashboardUseCase = new ResolveDashboardContextUseCase(deps);
    this.checkAccessUseCase = new CheckAccessUseCase(deps);
  }

  createOrganization(dto: CreateOrganizationDto) {
    return this.createOrgUseCase.execute(dto);
  }

  inviteMember(dto: InviteMemberDto) {
    return this.inviteMemberUseCase.execute(dto);
  }

  activateMember(dto: ActivateMemberDto) {
    return this.activateMemberUseCase.execute(dto);
  }

  changeMemberRole(dto: ChangeMemberRoleDto) {
    return this.changeRoleUseCase.execute(dto);
  }

  createDepartment(dto: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute(dto);
  }

  requestApproval(dto: RequestApprovalDto) {
    return this.requestApprovalUseCase.execute(dto);
  }

  resolveDashboardContext(dto: ResolveDashboardContextDto) {
    return this.resolveDashboardUseCase.execute(dto);
  }

  checkAccess(
    input: Parameters<CheckAccessUseCase["execute"]>[0],
  ) {
    return this.checkAccessUseCase.execute(input);
  }

  async getOrganization(organizationId: string) {
    return this.deps.organizationRepository.findOrganizationById(organizationId);
  }

  async listMembers(organizationId: string) {
    return this.deps.organizationRepository.findMembersByOrganization(organizationId);
  }

  async getAuditLog(organizationId: string) {
    return this.deps.auditService.findByOrganization(organizationId);
  }
}
