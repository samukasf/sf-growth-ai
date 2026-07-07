import type { OrganizationId, PermissionId } from "../../shared";
import type { PermissionScope } from "./role";

export type PermissionAction = "read" | "write" | "approve" | "admin" | "execute";

export type PermissionProps = {
  id: PermissionId;
  organizationId: OrganizationId;
  scope: PermissionScope;
  action: PermissionAction;
  description: string;
  granted: boolean;
};

export class Permission {
  readonly id: PermissionId;
  readonly organizationId: OrganizationId;
  readonly scope: PermissionScope;
  readonly action: PermissionAction;
  readonly description: string;
  readonly granted: boolean;

  private constructor(props: PermissionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.scope = props.scope;
    this.action = props.action;
    this.description = props.description;
    this.granted = props.granted;
  }

  static create(
    props: Omit<PermissionProps, "id"> & { id?: PermissionId },
  ): Permission {
    return new Permission({
      id: props.id ?? `perm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      scope: props.scope,
      action: props.action,
      description: props.description.trim(),
      granted: props.granted,
    });
  }

  grant(): Permission {
    return Permission.create({ ...this.toJSON(), granted: true });
  }

  revoke(): Permission {
    return Permission.create({ ...this.toJSON(), granted: false });
  }

  toJSON(): PermissionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      scope: this.scope,
      action: this.action,
      description: this.description,
      granted: this.granted,
    };
  }
}
