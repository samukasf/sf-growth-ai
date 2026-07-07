import type {
  ExecutiveIdentityId,
  OrganizationId,
  OrganizationMemberId,
} from "../../shared";
import type { AccessLevel } from "./role";

export type ExecutiveIdentityProps = {
  id: ExecutiveIdentityId;
  organizationId: OrganizationId;
  memberId: OrganizationMemberId;
  executiveAlias: string;
  accessLevel: AccessLevel;
  dashboardProfile: string;
  objectives: string[];
  active: boolean;
};

export class ExecutiveIdentity {
  readonly id: ExecutiveIdentityId;
  readonly organizationId: OrganizationId;
  readonly memberId: OrganizationMemberId;
  readonly executiveAlias: string;
  readonly accessLevel: AccessLevel;
  readonly dashboardProfile: string;
  readonly objectives: string[];
  readonly active: boolean;

  private constructor(props: ExecutiveIdentityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.memberId = props.memberId;
    this.executiveAlias = props.executiveAlias;
    this.accessLevel = props.accessLevel;
    this.dashboardProfile = props.dashboardProfile;
    this.objectives = [...props.objectives];
    this.active = props.active;
  }

  static create(
    props: Omit<ExecutiveIdentityProps, "id"> & { id?: ExecutiveIdentityId },
  ): ExecutiveIdentity {
    return new ExecutiveIdentity({
      id: props.id ?? `exec-id-${Date.now()}`,
      organizationId: props.organizationId,
      memberId: props.memberId,
      executiveAlias: props.executiveAlias.trim(),
      accessLevel: props.accessLevel,
      dashboardProfile: props.dashboardProfile,
      objectives: props.objectives,
      active: props.active,
    });
  }

  toJSON(): ExecutiveIdentityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      memberId: this.memberId,
      executiveAlias: this.executiveAlias,
      accessLevel: this.accessLevel,
      dashboardProfile: this.dashboardProfile,
      objectives: [...this.objectives],
      active: this.active,
    };
  }
}
