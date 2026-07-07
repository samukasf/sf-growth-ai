import type { OrganizationId, OrganizationMemberId } from "../../shared";
import type { AccessLevel } from "./role";
import type { PermissionScope } from "./role";

export type MemberStatus = "invited" | "active" | "suspended" | "removed";

export type OrganizationMemberProps = {
  id: OrganizationMemberId;
  organizationId: OrganizationId;
  name: string;
  email: string;
  phone: string;
  role: AccessLevel;
  department: string;
  position: string;
  permissions: PermissionScope[];
  approvalLimit: number;
  managerId?: OrganizationMemberId;
  status: MemberStatus;
  joinedAt?: string;
  lastAccess?: string;
};

export class OrganizationMember {
  readonly id: OrganizationMemberId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly role: AccessLevel;
  readonly department: string;
  readonly position: string;
  readonly permissions: PermissionScope[];
  readonly approvalLimit: number;
  readonly managerId?: OrganizationMemberId;
  readonly status: MemberStatus;
  readonly joinedAt?: string;
  readonly lastAccess?: string;

  private constructor(props: OrganizationMemberProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.role = props.role;
    this.department = props.department;
    this.position = props.position;
    this.permissions = [...props.permissions];
    this.approvalLimit = props.approvalLimit;
    this.managerId = props.managerId;
    this.status = props.status;
    this.joinedAt = props.joinedAt;
    this.lastAccess = props.lastAccess;
  }

  static create(
    props: Omit<OrganizationMemberProps, "id" | "status"> & {
      id?: OrganizationMemberId;
      status?: MemberStatus;
    },
  ): OrganizationMember {
    if (!props.email.trim()) throw new Error("email is required");

    return new OrganizationMember({
      id: props.id ?? `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      email: props.email.trim().toLowerCase(),
      phone: props.phone.trim(),
      role: props.role,
      department: props.department.trim(),
      position: props.position.trim(),
      permissions: props.permissions,
      approvalLimit: Math.max(0, props.approvalLimit),
      managerId: props.managerId,
      status: props.status ?? "invited",
      joinedAt: props.joinedAt,
      lastAccess: props.lastAccess,
    });
  }

  activate(): OrganizationMember {
    return OrganizationMember.create({
      ...this.toJSON(),
      status: "active",
      joinedAt: this.joinedAt ?? new Date().toISOString(),
    });
  }

  changeRole(role: AccessLevel, permissions: PermissionScope[]): OrganizationMember {
    return OrganizationMember.create({
      ...this.toJSON(),
      role,
      permissions,
    });
  }

  recordAccess(): OrganizationMember {
    return OrganizationMember.create({
      ...this.toJSON(),
      lastAccess: new Date().toISOString(),
    });
  }

  toJSON(): OrganizationMemberProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      department: this.department,
      position: this.position,
      permissions: [...this.permissions],
      approvalLimit: this.approvalLimit,
      managerId: this.managerId,
      status: this.status,
      joinedAt: this.joinedAt,
      lastAccess: this.lastAccess,
    };
  }
}
