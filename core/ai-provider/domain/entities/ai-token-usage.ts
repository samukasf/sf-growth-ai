import type { AIRequestId, AITokenUsageId, OrganizationId } from "../../shared";

export type AITokenUsageProps = {
  id: AITokenUsageId;
  organizationId: OrganizationId;
  requestId: AIRequestId;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  currency: string;
};

export class AITokenUsage {
  readonly id: AITokenUsageId;
  readonly organizationId: OrganizationId;
  readonly requestId: AIRequestId;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly currency: string;

  private constructor(props: AITokenUsageProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.requestId = props.requestId;
    this.promptTokens = props.promptTokens;
    this.completionTokens = props.completionTokens;
    this.totalTokens = props.totalTokens;
    this.estimatedCost = props.estimatedCost;
    this.currency = props.currency;
  }

  static create(
    props: Omit<AITokenUsageProps, "id" | "totalTokens"> & { id?: AITokenUsageId },
  ): AITokenUsage {
    return new AITokenUsage({
      id: props.id ?? `tokens-${Date.now()}`,
      organizationId: props.organizationId,
      requestId: props.requestId,
      promptTokens: props.promptTokens,
      completionTokens: props.completionTokens,
      totalTokens: props.promptTokens + props.completionTokens,
      estimatedCost: props.estimatedCost,
      currency: props.currency,
    });
  }

  toJSON(): AITokenUsageProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      requestId: this.requestId,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      totalTokens: this.totalTokens,
      estimatedCost: this.estimatedCost,
      currency: this.currency,
    };
  }
}
