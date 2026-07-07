import type { BusinessStateId, OrganizationId } from "../../shared";

export type BusinessStateProps = {
  id: BusinessStateId;
  organizationId: OrganizationId;
  entityType: string;
  entityId: string;
  state: string;
  previousState?: string;
  metadata: Record<string, string>;
  updatedAt: string;
};

export class BusinessState {
  readonly id: BusinessStateId;
  readonly organizationId: OrganizationId;
  readonly entityType: string;
  readonly entityId: string;
  readonly state: string;
  readonly previousState?: string;
  readonly metadata: Record<string, string>;
  readonly updatedAt: string;

  private constructor(props: BusinessStateProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.state = props.state;
    this.previousState = props.previousState;
    this.metadata = { ...props.metadata };
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessStateProps, "id" | "updatedAt"> & {
      id?: BusinessStateId;
      updatedAt?: string;
    },
  ): BusinessState {
    return new BusinessState({
      id: props.id ?? `state-${Date.now()}`,
      organizationId: props.organizationId,
      entityType: props.entityType,
      entityId: props.entityId,
      state: props.state,
      previousState: props.previousState,
      metadata: props.metadata,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  transition(newState: string): BusinessState {
    return BusinessState.create({
      ...this.toJSON(),
      previousState: this.state,
      state: newState,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessStateProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      entityType: this.entityType,
      entityId: this.entityId,
      state: this.state,
      previousState: this.previousState,
      metadata: { ...this.metadata },
      updatedAt: this.updatedAt,
    };
  }
}
