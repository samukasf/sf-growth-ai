import type { AgencyContextId, AgencyId, OrganizationId } from "../../shared";

export type AgencyContextProps = {
  id: AgencyContextId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  operationalContext: Record<string, string>;
  clientContexts: Record<string, Record<string, string>>;
  assembledAt: string;
};

export class AgencyContext {
  readonly id: AgencyContextId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly operationalContext: Record<string, string>;
  readonly clientContexts: Record<string, Record<string, string>>;
  readonly assembledAt: string;

  private constructor(props: AgencyContextProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.operationalContext = { ...props.operationalContext };
    this.clientContexts = Object.fromEntries(
      Object.entries(props.clientContexts).map(([key, value]) => [key, { ...value }]),
    );
    this.assembledAt = props.assembledAt;
  }

  static create(
    props: Omit<AgencyContextProps, "id" | "assembledAt"> & {
      id?: AgencyContextId;
      assembledAt?: string;
    },
  ): AgencyContext {
    return new AgencyContext({
      id: props.id ?? `actx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      operationalContext: props.operationalContext,
      clientContexts: props.clientContexts,
      assembledAt: props.assembledAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyContextProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      operationalContext: { ...this.operationalContext },
      clientContexts: Object.fromEntries(
        Object.entries(this.clientContexts).map(([key, value]) => [key, { ...value }]),
      ),
      assembledAt: this.assembledAt,
    };
  }
}
