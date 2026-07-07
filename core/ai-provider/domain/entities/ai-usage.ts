import type { AIProviderId, AIUsageId, OrganizationId } from "../../shared";

export type AIUsageProps = {
  id: AIUsageId;
  organizationId: OrganizationId;
  providerId: AIProviderId;
  requestCount: number;
  tokenCount: number;
  costAmount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  limitReached: boolean;
};

export class AIUsage {
  readonly id: AIUsageId;
  readonly organizationId: OrganizationId;
  readonly providerId: AIProviderId;
  readonly requestCount: number;
  readonly tokenCount: number;
  readonly costAmount: number;
  readonly currency: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly limitReached: boolean;

  private constructor(props: AIUsageProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.providerId = props.providerId;
    this.requestCount = props.requestCount;
    this.tokenCount = props.tokenCount;
    this.costAmount = props.costAmount;
    this.currency = props.currency;
    this.periodStart = props.periodStart;
    this.periodEnd = props.periodEnd;
    this.limitReached = props.limitReached;
  }

  static create(
    props: Omit<AIUsageProps, "id"> & { id?: AIUsageId },
  ): AIUsage {
    return new AIUsage({
      id: props.id ?? `usage-${Date.now()}`,
      organizationId: props.organizationId,
      providerId: props.providerId,
      requestCount: props.requestCount,
      tokenCount: props.tokenCount,
      costAmount: props.costAmount,
      currency: props.currency,
      periodStart: props.periodStart,
      periodEnd: props.periodEnd,
      limitReached: props.limitReached,
    });
  }

  increment(tokens: number, cost: number): AIUsage {
    return AIUsage.create({
      ...this.toJSON(),
      requestCount: this.requestCount + 1,
      tokenCount: this.tokenCount + tokens,
      costAmount: this.costAmount + cost,
    });
  }

  toJSON(): AIUsageProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      providerId: this.providerId,
      requestCount: this.requestCount,
      tokenCount: this.tokenCount,
      costAmount: this.costAmount,
      currency: this.currency,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      limitReached: this.limitReached,
    };
  }
}
