import type { CompanyId, ExecutiveSessionId } from "../../shared";

export type ExecutiveSessionStatus = "active" | "closed" | "expired";

export type ExecutiveSessionProps = {
  id: ExecutiveSessionId;
  companyId: CompanyId;
  userId?: string;
  status: ExecutiveSessionStatus;
  requestCount: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
};

export class ExecutiveSession {
  readonly id: ExecutiveSessionId;
  readonly companyId: CompanyId;
  readonly userId?: string;
  readonly status: ExecutiveSessionStatus;
  readonly requestCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastActivityAt: string;

  private constructor(props: ExecutiveSessionProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.userId = props.userId;
    this.status = props.status;
    this.requestCount = props.requestCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastActivityAt = props.lastActivityAt;
  }

  static create(
    props: Omit<
      ExecutiveSessionProps,
      "id" | "createdAt" | "updatedAt" | "lastActivityAt" | "requestCount" | "status"
    > & {
      id?: ExecutiveSessionId;
      createdAt?: string;
      updatedAt?: string;
      lastActivityAt?: string;
      requestCount?: number;
      status?: ExecutiveSessionStatus;
    },
  ): ExecutiveSession {
    const now = new Date().toISOString();
    return new ExecutiveSession({
      id: props.id ?? `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      userId: props.userId,
      status: props.status ?? "active",
      requestCount: props.requestCount ?? 0,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      lastActivityAt: props.lastActivityAt ?? now,
    });
  }

  recordActivity(): ExecutiveSession {
    return ExecutiveSession.create({
      ...this.toJSON(),
      requestCount: this.requestCount + 1,
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveSessionProps {
    return {
      id: this.id,
      companyId: this.companyId,
      userId: this.userId,
      status: this.status,
      requestCount: this.requestCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastActivityAt: this.lastActivityAt,
    };
  }
}
