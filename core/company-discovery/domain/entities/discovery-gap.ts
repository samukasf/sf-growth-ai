import type { DiscoveryGapId, DiscoveryGapSeverity, DiscoverySessionId } from "../../shared";

export type DiscoveryGapProps = {
  id: DiscoveryGapId;
  sessionId: DiscoverySessionId;
  area: string;
  title: string;
  description: string;
  severity: DiscoveryGapSeverity;
  impact: string;
  recommendation: string;
  detectedAt: string;
};

export class DiscoveryGap {
  readonly id: DiscoveryGapId;
  readonly sessionId: DiscoverySessionId;
  readonly area: string;
  readonly title: string;
  readonly description: string;
  readonly severity: DiscoveryGapSeverity;
  readonly impact: string;
  readonly recommendation: string;
  readonly detectedAt: string;

  private constructor(props: DiscoveryGapProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.area = props.area;
    this.title = props.title;
    this.description = props.description;
    this.severity = props.severity;
    this.impact = props.impact;
    this.recommendation = props.recommendation;
    this.detectedAt = props.detectedAt;
  }

  static create(
    props: Omit<DiscoveryGapProps, "id" | "detectedAt"> & {
      id?: DiscoveryGapId;
      detectedAt?: string;
    },
  ): DiscoveryGap {
    if (!props.title.trim()) throw new Error("title is required");
    return new DiscoveryGap({
      id: props.id ?? `dgap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      area: props.area,
      title: props.title,
      description: props.description,
      severity: props.severity,
      impact: props.impact,
      recommendation: props.recommendation,
      detectedAt: props.detectedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DiscoveryGapProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      area: this.area,
      title: this.title,
      description: this.description,
      severity: this.severity,
      impact: this.impact,
      recommendation: this.recommendation,
      detectedAt: this.detectedAt,
    };
  }
}
