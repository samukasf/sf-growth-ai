import type { OrganizationId, RelationshipProfileId } from "../../shared";

export type RelationshipEntityType = "lead" | "customer" | "supplier" | "partner";

export type CommunicationPreference = {
  channel: "email" | "whatsapp" | "phone" | "meeting";
  preferred: boolean;
  frequency: "low" | "medium" | "high";
};

export type PurchaseRecord = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
};

export type InteractionRecord = {
  id: string;
  type: string;
  date: string;
  summary: string;
  sentiment?: "positive" | "neutral" | "negative";
};

export type RecommendedAction = {
  id: string;
  type: string;
  title: string;
  priority: "low" | "medium" | "high";
  reason: string;
};

export type RelationshipProfileProps = {
  id: RelationshipProfileId;
  organizationId: OrganizationId;
  entityId: string;
  entityType: RelationshipEntityType;
  communicationPreferences: CommunicationPreference[];
  purchaseHistory: PurchaseRecord[];
  interactionHistory: InteractionRecord[];
  satisfactionScore: number;
  relationshipScore: number;
  riskScore: number;
  lifetimeValue: number;
  recommendedActions: RecommendedAction[];
  updatedAt: string;
};

export class RelationshipProfile {
  readonly id: RelationshipProfileId;
  readonly organizationId: OrganizationId;
  readonly entityId: string;
  readonly entityType: RelationshipEntityType;
  readonly communicationPreferences: CommunicationPreference[];
  readonly purchaseHistory: PurchaseRecord[];
  readonly interactionHistory: InteractionRecord[];
  readonly satisfactionScore: number;
  readonly relationshipScore: number;
  readonly riskScore: number;
  readonly lifetimeValue: number;
  readonly recommendedActions: RecommendedAction[];
  readonly updatedAt: string;

  private constructor(props: RelationshipProfileProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.entityId = props.entityId;
    this.entityType = props.entityType;
    this.communicationPreferences = props.communicationPreferences.map((p) => ({ ...p }));
    this.purchaseHistory = props.purchaseHistory.map((p) => ({ ...p }));
    this.interactionHistory = props.interactionHistory.map((i) => ({ ...i }));
    this.satisfactionScore = props.satisfactionScore;
    this.relationshipScore = props.relationshipScore;
    this.riskScore = props.riskScore;
    this.lifetimeValue = props.lifetimeValue;
    this.recommendedActions = props.recommendedActions.map((a) => ({ ...a }));
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<RelationshipProfileProps, "id" | "updatedAt"> & {
      id?: RelationshipProfileId;
      updatedAt?: string;
    },
  ): RelationshipProfile {
    return new RelationshipProfile({
      id: props.id ?? `profile-${Date.now()}`,
      organizationId: props.organizationId,
      entityId: props.entityId,
      entityType: props.entityType,
      communicationPreferences: props.communicationPreferences,
      purchaseHistory: props.purchaseHistory,
      interactionHistory: props.interactionHistory,
      satisfactionScore: props.satisfactionScore,
      relationshipScore: props.relationshipScore,
      riskScore: props.riskScore,
      lifetimeValue: props.lifetimeValue,
      recommendedActions: props.recommendedActions,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  updateScores(scores: {
    satisfactionScore: number;
    relationshipScore: number;
    riskScore: number;
    lifetimeValue: number;
    recommendedActions: RecommendedAction[];
  }): RelationshipProfile {
    return RelationshipProfile.create({
      ...this.toJSON(),
      ...scores,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): RelationshipProfileProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      entityId: this.entityId,
      entityType: this.entityType,
      communicationPreferences: this.communicationPreferences.map((p) => ({ ...p })),
      purchaseHistory: this.purchaseHistory.map((p) => ({ ...p })),
      interactionHistory: this.interactionHistory.map((i) => ({ ...i })),
      satisfactionScore: this.satisfactionScore,
      relationshipScore: this.relationshipScore,
      riskScore: this.riskScore,
      lifetimeValue: this.lifetimeValue,
      recommendedActions: this.recommendedActions.map((a) => ({ ...a })),
      updatedAt: this.updatedAt,
    };
  }
}
