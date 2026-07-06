import type {
  CompanyId,
  ExecutiveContextResolverId,
  ExecutiveRequestId,
} from "../../shared";

export type ResolvedContext = {
  companyProfile?: string;
  industry?: string;
  goals: string[];
  constraints: string[];
  signals: string[];
};

export type ExecutiveContextResolverProps = {
  id: ExecutiveContextResolverId;
  companyId: CompanyId;
  requestId: ExecutiveRequestId;
  query: string;
  resolved: ResolvedContext;
  confidence: number;
  resolvedAt: string;
};

export class ExecutiveContextResolver {
  readonly id: ExecutiveContextResolverId;
  readonly companyId: CompanyId;
  readonly requestId: ExecutiveRequestId;
  readonly query: string;
  readonly resolved: ResolvedContext;
  readonly confidence: number;
  readonly resolvedAt: string;

  private constructor(props: ExecutiveContextResolverProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.requestId = props.requestId;
    this.query = props.query;
    this.resolved = {
      ...props.resolved,
      goals: [...props.resolved.goals],
      constraints: [...props.resolved.constraints],
      signals: [...props.resolved.signals],
    };
    this.confidence = props.confidence;
    this.resolvedAt = props.resolvedAt;
  }

  static create(
    props: Omit<ExecutiveContextResolverProps, "id" | "resolvedAt"> & {
      id?: ExecutiveContextResolverId;
      resolvedAt?: string;
    },
  ): ExecutiveContextResolver {
    return new ExecutiveContextResolver({
      id: props.id ?? `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      requestId: props.requestId,
      query: props.query.trim(),
      resolved: props.resolved,
      confidence: Math.max(0, Math.min(100, props.confidence)),
      resolvedAt: props.resolvedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveContextResolverProps {
    return {
      id: this.id,
      companyId: this.companyId,
      requestId: this.requestId,
      query: this.query,
      resolved: {
        ...this.resolved,
        goals: [...this.resolved.goals],
        constraints: [...this.resolved.constraints],
        signals: [...this.resolved.signals],
      },
      confidence: this.confidence,
      resolvedAt: this.resolvedAt,
    };
  }
}
