import type { CompanyId, OperationalContextId } from "../../shared";

export type OperationalContextProps = {
  id: OperationalContextId;
  companyId: CompanyId;
  domain: string;
  environment: string;
  constraints: string[];
  objectives: string[];
  recordedAt: string;
};

export class OperationalContext {
  readonly id: OperationalContextId;
  readonly companyId: CompanyId;
  readonly domain: string;
  readonly environment: string;
  readonly constraints: string[];
  readonly objectives: string[];
  readonly recordedAt: string;

  private constructor(props: OperationalContextProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.domain = props.domain;
    this.environment = props.environment;
    this.constraints = [...props.constraints];
    this.objectives = [...props.objectives];
    this.recordedAt = props.recordedAt;
  }

  static create(
    props: Omit<OperationalContextProps, "id" | "recordedAt"> & {
      id?: OperationalContextId;
      recordedAt?: string;
    },
  ): OperationalContext {
    return new OperationalContext({
      id: props.id ?? `opctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      domain: props.domain.trim(),
      environment: props.environment.trim(),
      constraints: props.constraints,
      objectives: props.objectives,
      recordedAt: props.recordedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): OperationalContextProps {
    return {
      id: this.id,
      companyId: this.companyId,
      domain: this.domain,
      environment: this.environment,
      constraints: [...this.constraints],
      objectives: [...this.objectives],
      recordedAt: this.recordedAt,
    };
  }
}
