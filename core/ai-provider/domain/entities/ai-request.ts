import type { AIProviderId, AIProviderType, AIRequestId, OrganizationId } from "../../shared";

export type AIOperation =
  | "generateText"
  | "generateStructuredOutput"
  | "summarize"
  | "classify"
  | "extractEntities"
  | "analyze"
  | "translate"
  | "reason";

export type AIRequestStatus = "pending" | "processing" | "completed" | "failed";

export type AIRequestProps = {
  id: AIRequestId;
  organizationId: OrganizationId;
  providerId: AIProviderId;
  providerType: AIProviderType;
  operation: AIOperation;
  model: string;
  prompt: string;
  context: Record<string, string>;
  status: AIRequestStatus;
  startedAt: string;
  completedAt?: string;
};

export class AIRequest {
  readonly id: AIRequestId;
  readonly organizationId: OrganizationId;
  readonly providerId: AIProviderId;
  readonly providerType: AIProviderType;
  readonly operation: AIOperation;
  readonly model: string;
  readonly prompt: string;
  readonly context: Record<string, string>;
  readonly status: AIRequestStatus;
  readonly startedAt: string;
  readonly completedAt?: string;

  private constructor(props: AIRequestProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.providerId = props.providerId;
    this.providerType = props.providerType;
    this.operation = props.operation;
    this.model = props.model;
    this.prompt = props.prompt;
    this.context = { ...props.context };
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
  }

  static create(
    props: Omit<AIRequestProps, "id" | "startedAt" | "status"> & {
      id?: AIRequestId;
      startedAt?: string;
      status?: AIRequestStatus;
    },
  ): AIRequest {
    return new AIRequest({
      id: props.id ?? `aireq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      providerId: props.providerId,
      providerType: props.providerType,
      operation: props.operation,
      model: props.model,
      prompt: props.prompt,
      context: props.context,
      status: props.status ?? "pending",
      startedAt: props.startedAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
    });
  }

  complete(): AIRequest {
    return AIRequest.create({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): AIRequestProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      providerId: this.providerId,
      providerType: this.providerType,
      operation: this.operation,
      model: this.model,
      prompt: this.prompt,
      context: { ...this.context },
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}
