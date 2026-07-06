import type { CompanyId } from "../../shared";

export type ExecutiveOrchestratorStatus = "active" | "paused" | "maintenance";

export type ExecutiveOrchestratorProps = {
  id: string;
  companyId: CompanyId;
  name: string;
  version: string;
  status: ExecutiveOrchestratorStatus;
  createdAt: string;
  updatedAt: string;
};

export class ExecutiveOrchestrator {
  readonly id: string;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly version: string;
  readonly status: ExecutiveOrchestratorStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ExecutiveOrchestratorProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.name = props.name;
    this.version = props.version;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ExecutiveOrchestratorProps, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ExecutiveOrchestrator {
    const now = new Date().toISOString();
    return new ExecutiveOrchestrator({
      id: props.id ?? `orchestrator-${Date.now()}`,
      companyId: props.companyId,
      name: props.name.trim(),
      version: props.version,
      status: props.status,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): ExecutiveOrchestratorProps {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      version: this.version,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
