import type {
  DiscoveryFindingCategory,
  DiscoveryFindingId,
  DiscoverySessionId,
  DiscoverySourceType,
} from "../../shared";

export type DiscoveryFindingProps = {
  id: DiscoveryFindingId;
  sessionId: DiscoverySessionId;
  sourceType: DiscoverySourceType;
  category: DiscoveryFindingCategory;
  key: string;
  label: string;
  value: string;
  confidence: number;
  collectedAt: string;
};

export class DiscoveryFinding {
  readonly id: DiscoveryFindingId;
  readonly sessionId: DiscoverySessionId;
  readonly sourceType: DiscoverySourceType;
  readonly category: DiscoveryFindingCategory;
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly confidence: number;
  readonly collectedAt: string;

  private constructor(props: DiscoveryFindingProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.sourceType = props.sourceType;
    this.category = props.category;
    this.key = props.key;
    this.label = props.label;
    this.value = props.value;
    this.confidence = props.confidence;
    this.collectedAt = props.collectedAt;
  }

  static create(
    props: Omit<DiscoveryFindingProps, "id" | "collectedAt"> & {
      id?: DiscoveryFindingId;
      collectedAt?: string;
    },
  ): DiscoveryFinding {
    if (!props.key.trim() || !props.value.trim()) throw new Error("key and value are required");
    return new DiscoveryFinding({
      id: props.id ?? `dfnd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      sourceType: props.sourceType,
      category: props.category,
      key: props.key,
      label: props.label,
      value: props.value,
      confidence: props.confidence,
      collectedAt: props.collectedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DiscoveryFindingProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      sourceType: this.sourceType,
      category: this.category,
      key: this.key,
      label: this.label,
      value: this.value,
      confidence: this.confidence,
      collectedAt: this.collectedAt,
    };
  }
}
