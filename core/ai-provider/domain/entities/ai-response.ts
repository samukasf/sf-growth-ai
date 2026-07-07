import type { AIRequestId, AIResponseId, OrganizationId } from "../../shared";

export type AIResponseProps = {
  id: AIResponseId;
  organizationId: OrganizationId;
  requestId: AIRequestId;
  content: string;
  structuredOutput?: Record<string, unknown>;
  finishReason: string;
  latencyMs: number;
  createdAt: string;
};

export class AIResponse {
  readonly id: AIResponseId;
  readonly organizationId: OrganizationId;
  readonly requestId: AIRequestId;
  readonly content: string;
  readonly structuredOutput?: Record<string, unknown>;
  readonly finishReason: string;
  readonly latencyMs: number;
  readonly createdAt: string;

  private constructor(props: AIResponseProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.requestId = props.requestId;
    this.content = props.content;
    this.structuredOutput = props.structuredOutput
      ? { ...props.structuredOutput }
      : undefined;
    this.finishReason = props.finishReason;
    this.latencyMs = props.latencyMs;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AIResponseProps, "id" | "createdAt"> & {
      id?: AIResponseId;
      createdAt?: string;
    },
  ): AIResponse {
    return new AIResponse({
      id: props.id ?? `aires-${Date.now()}`,
      organizationId: props.organizationId,
      requestId: props.requestId,
      content: props.content,
      structuredOutput: props.structuredOutput,
      finishReason: props.finishReason,
      latencyMs: props.latencyMs,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AIResponseProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      requestId: this.requestId,
      content: this.content,
      structuredOutput: this.structuredOutput ? { ...this.structuredOutput } : undefined,
      finishReason: this.finishReason,
      latencyMs: this.latencyMs,
      createdAt: this.createdAt,
    };
  }
}
