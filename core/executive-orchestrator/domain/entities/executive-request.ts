import type { CompanyId, ExecutiveRequestId, ExecutiveSessionId } from "../../shared";

export type ExecutiveRequestStatus =
  | "received"
  | "routing"
  | "in_workflow"
  | "consensus"
  | "completed"
  | "failed";

export type ExecutiveRequestProps = {
  id: ExecutiveRequestId;
  companyId: CompanyId;
  sessionId: ExecutiveSessionId;
  query: string;
  intent?: string;
  status: ExecutiveRequestStatus;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string>;
};

export class ExecutiveRequest {
  readonly id: ExecutiveRequestId;
  readonly companyId: CompanyId;
  readonly sessionId: ExecutiveSessionId;
  readonly query: string;
  readonly intent?: string;
  readonly status: ExecutiveRequestStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, string>;

  private constructor(props: ExecutiveRequestProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.sessionId = props.sessionId;
    this.query = props.query;
    this.intent = props.intent;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.metadata = { ...props.metadata };
  }

  static create(
    props: Omit<ExecutiveRequestProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: ExecutiveRequestId;
      createdAt?: string;
      updatedAt?: string;
      status?: ExecutiveRequestStatus;
    },
  ): ExecutiveRequest {
    if (!props.query.trim()) throw new Error("query is required");

    const now = new Date().toISOString();
    return new ExecutiveRequest({
      id: props.id ?? `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      sessionId: props.sessionId,
      query: props.query.trim(),
      intent: props.intent,
      status: props.status ?? "received",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      metadata: props.metadata,
    });
  }

  updateStatus(status: ExecutiveRequestStatus): ExecutiveRequest {
    return ExecutiveRequest.create({
      ...this.toJSON(),
      updatedAt: new Date().toISOString(),
      status,
    });
  }

  toJSON(): ExecutiveRequestProps {
    return {
      id: this.id,
      companyId: this.companyId,
      sessionId: this.sessionId,
      query: this.query,
      intent: this.intent,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: { ...this.metadata },
    };
  }
}
