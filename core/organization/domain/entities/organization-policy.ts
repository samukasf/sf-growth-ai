import type { OrganizationId, OrganizationPolicyId } from "../../shared";

export type PolicyType = "security" | "approval" | "data" | "compliance" | "custom";

export type OrganizationPolicyProps = {
  id: OrganizationPolicyId;
  organizationId: OrganizationId;
  name: string;
  type: PolicyType;
  description: string;
  rules: string[];
  active: boolean;
};

export class OrganizationPolicy {
  readonly id: OrganizationPolicyId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly type: PolicyType;
  readonly description: string;
  readonly rules: string[];
  readonly active: boolean;

  private constructor(props: OrganizationPolicyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.type = props.type;
    this.description = props.description;
    this.rules = [...props.rules];
    this.active = props.active;
  }

  static create(
    props: Omit<OrganizationPolicyProps, "id"> & { id?: OrganizationPolicyId },
  ): OrganizationPolicy {
    return new OrganizationPolicy({
      id: props.id ?? `org-policy-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      type: props.type,
      description: props.description.trim(),
      rules: props.rules,
      active: props.active,
    });
  }

  toJSON(): OrganizationPolicyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      type: this.type,
      description: this.description,
      rules: [...this.rules],
      active: this.active,
    };
  }
}
