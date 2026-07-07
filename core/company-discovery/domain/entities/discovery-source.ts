import type {
  DiscoverySessionId,
  DiscoverySourceId,
  DiscoverySourceStatus,
  DiscoverySourceType,
} from "../../shared";

export type DiscoverySourceProps = {
  id: DiscoverySourceId;
  sessionId: DiscoverySessionId;
  sourceType: DiscoverySourceType;
  label: string;
  status: DiscoverySourceStatus;
  endpoint?: string;
  collectedAt?: string;
  itemsCollected: number;
  confidence: number;
  metadata: Record<string, unknown>;
};

export class DiscoverySource {
  readonly id: DiscoverySourceId;
  readonly sessionId: DiscoverySessionId;
  readonly sourceType: DiscoverySourceType;
  readonly label: string;
  readonly status: DiscoverySourceStatus;
  readonly endpoint?: string;
  readonly collectedAt?: string;
  readonly itemsCollected: number;
  readonly confidence: number;
  readonly metadata: Record<string, unknown>;

  private constructor(props: DiscoverySourceProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.sourceType = props.sourceType;
    this.label = props.label;
    this.status = props.status;
    this.endpoint = props.endpoint;
    this.collectedAt = props.collectedAt;
    this.itemsCollected = props.itemsCollected;
    this.confidence = props.confidence;
    this.metadata = { ...props.metadata };
  }

  static create(
    props: Omit<DiscoverySourceProps, "id" | "status" | "itemsCollected" | "confidence" | "metadata"> & {
      id?: DiscoverySourceId;
      status?: DiscoverySourceStatus;
      itemsCollected?: number;
      confidence?: number;
      metadata?: Record<string, unknown>;
    },
  ): DiscoverySource {
    return new DiscoverySource({
      id: props.id ?? `dsrc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      sourceType: props.sourceType,
      label: props.label,
      status: props.status ?? "pending",
      endpoint: props.endpoint,
      collectedAt: props.collectedAt,
      itemsCollected: props.itemsCollected ?? 0,
      confidence: props.confidence ?? 0,
      metadata: props.metadata ?? {},
    });
  }

  withCollection(itemsCollected: number, confidence: number): DiscoverySource {
    return DiscoverySource.create({
      ...this.toJSON(),
      status: "completed",
      collectedAt: new Date().toISOString(),
      itemsCollected,
      confidence,
    });
  }

  withStatus(status: DiscoverySourceStatus): DiscoverySource {
    return DiscoverySource.create({ ...this.toJSON(), status });
  }

  toJSON(): DiscoverySourceProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      sourceType: this.sourceType,
      label: this.label,
      status: this.status,
      endpoint: this.endpoint,
      collectedAt: this.collectedAt,
      itemsCollected: this.itemsCollected,
      confidence: this.confidence,
      metadata: { ...this.metadata },
    };
  }
}
