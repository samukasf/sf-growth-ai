import type { AccessPolicyId, OrganizationId } from "../../shared";
import type { PermissionScope } from "./role";
import type { PermissionAction } from "./permission";

export type AccessPolicyProps = {
  id: AccessPolicyId;
  organizationId: OrganizationId;
  name: string;
  scope: PermissionScope;
  allowedActions: PermissionAction[];
  conditions: string[];
  active: boolean;
};

export class AccessPolicy {
  readonly id: AccessPolicyId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly scope: PermissionScope;
  readonly allowedActions: PermissionAction[];
  readonly conditions: string[];
  readonly active: boolean;

  private constructor(props: AccessPolicyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.scope = props.scope;
    this.allowedActions = [...props.allowedActions];
    this.conditions = [...props.conditions];
    this.active = props.active;
  }

  static create(
    props: Omit<AccessPolicyProps, "id"> & { id?: AccessPolicyId },
  ): AccessPolicy {
    return new AccessPolicy({
      id: props.id ?? `policy-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      scope: props.scope,
      allowedActions: props.allowedActions,
      conditions: props.conditions,
      active: props.active,
    });
  }

  toJSON(): AccessPolicyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      scope: this.scope,
      allowedActions: [...this.allowedActions],
      conditions: [...this.conditions],
      active: this.active,
    };
  }
}
