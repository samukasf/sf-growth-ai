import type { BrainContextId, CompanyId, OrganizationId } from "../../shared";

export type EnterpriseBrainContextProps = {
  id: BrainContextId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  businessContext: Record<string, string>;
  domainContexts: Record<string, Record<string, string>>;
  assembledAt: string;
};

export class EnterpriseBrainContext {
  readonly id: BrainContextId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly businessContext: Record<string, string>;
  readonly domainContexts: Record<string, Record<string, string>>;
  readonly assembledAt: string;

  private constructor(props: EnterpriseBrainContextProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.businessContext = { ...props.businessContext };
    this.domainContexts = Object.fromEntries(
      Object.entries(props.domainContexts).map(([key, value]) => [key, { ...value }]),
    );
    this.assembledAt = props.assembledAt;
  }

  static create(
    props: Omit<EnterpriseBrainContextProps, "id" | "assembledAt"> & {
      id?: BrainContextId;
      assembledAt?: string;
    },
  ): EnterpriseBrainContext {
    return new EnterpriseBrainContext({
      id: props.id ?? `bctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      businessContext: props.businessContext,
      domainContexts: props.domainContexts,
      assembledAt: props.assembledAt ?? new Date().toISOString(),
    });
  }

  toJSON(): EnterpriseBrainContextProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      businessContext: { ...this.businessContext },
      domainContexts: Object.fromEntries(
        Object.entries(this.domainContexts).map(([key, value]) => [key, { ...value }]),
      ),
      assembledAt: this.assembledAt,
    };
  }
}
