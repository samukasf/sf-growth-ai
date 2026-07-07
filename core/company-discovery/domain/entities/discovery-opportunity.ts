import type {
  DiscoveryOpportunityId,
  DiscoveryOpportunityPriority,
  DiscoverySessionId,
} from "../../shared";

export type DiscoveryOpportunityProps = {
  id: DiscoveryOpportunityId;
  sessionId: DiscoverySessionId;
  area: string;
  title: string;
  description: string;
  priority: DiscoveryOpportunityPriority;
  estimatedImpact: string;
  estimatedRoi?: string;
  detectedAt: string;
};

export class DiscoveryOpportunity {
  readonly id: DiscoveryOpportunityId;
  readonly sessionId: DiscoverySessionId;
  readonly area: string;
  readonly title: string;
  readonly description: string;
  readonly priority: DiscoveryOpportunityPriority;
  readonly estimatedImpact: string;
  readonly estimatedRoi?: string;
  readonly detectedAt: string;

  private constructor(props: DiscoveryOpportunityProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.area = props.area;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this.estimatedImpact = props.estimatedImpact;
    this.estimatedRoi = props.estimatedRoi;
    this.detectedAt = props.detectedAt;
  }

  static create(
    props: Omit<DiscoveryOpportunityProps, "id" | "detectedAt"> & {
      id?: DiscoveryOpportunityId;
      detectedAt?: string;
    },
  ): DiscoveryOpportunity {
    if (!props.title.trim()) throw new Error("title is required");
    return new DiscoveryOpportunity({
      id: props.id ?? `dopp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      area: props.area,
      title: props.title,
      description: props.description,
      priority: props.priority,
      estimatedImpact: props.estimatedImpact,
      estimatedRoi: props.estimatedRoi,
      detectedAt: props.detectedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DiscoveryOpportunityProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      area: this.area,
      title: this.title,
      description: this.description,
      priority: this.priority,
      estimatedImpact: this.estimatedImpact,
      estimatedRoi: this.estimatedRoi,
      detectedAt: this.detectedAt,
    };
  }
}
