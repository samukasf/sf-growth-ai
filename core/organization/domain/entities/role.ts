import type { OrganizationId, RoleId } from "../../shared";

export type AccessLevel =
  | "owner"
  | "partner"
  | "ceo"
  | "director"
  | "manager"
  | "coordinator"
  | "supervisor"
  | "employee"
  | "external_consultant"
  | "accountant"
  | "lawyer"
  | "developer"
  | "auditor"
  | "custom";

export type PermissionScope =
  | "finance"
  | "marketing"
  | "hr"
  | "legal"
  | "operations"
  | "crm"
  | "projects"
  | "purchasing"
  | "sales"
  | "settings"
  | "integrations";

export type RoleProps = {
  id: RoleId;
  organizationId: OrganizationId;
  name: string;
  accessLevel: AccessLevel;
  permissionScopes: PermissionScope[];
  isCustom: boolean;
  description: string;
};

export class Role {
  readonly id: RoleId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly accessLevel: AccessLevel;
  readonly permissionScopes: PermissionScope[];
  readonly isCustom: boolean;
  readonly description: string;

  private constructor(props: RoleProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.accessLevel = props.accessLevel;
    this.permissionScopes = [...props.permissionScopes];
    this.isCustom = props.isCustom;
    this.description = props.description;
  }

  static create(
    props: Omit<RoleProps, "id"> & { id?: RoleId },
  ): Role {
    return new Role({
      id: props.id ?? `role-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      accessLevel: props.accessLevel,
      permissionScopes: props.permissionScopes,
      isCustom: props.isCustom,
      description: props.description.trim(),
    });
  }

  toJSON(): RoleProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      accessLevel: this.accessLevel,
      permissionScopes: [...this.permissionScopes],
      isCustom: this.isCustom,
      description: this.description,
    };
  }
}
