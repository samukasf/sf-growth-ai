import type { AssessmentId, AssessmentRoadmapId, RoadmapHorizon } from "../../shared";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  dimensionKey: string;
  priority: string;
  owner?: string;
};

export type RoadmapPhase = {
  horizon: RoadmapHorizon;
  label: string;
  focus: string;
  items: RoadmapItem[];
  targetScore?: number;
};

export type AssessmentRoadmapProps = {
  id: AssessmentRoadmapId;
  assessmentId: AssessmentId;
  phases: RoadmapPhase[];
  executiveSummary: string;
  generatedAt: string;
};

export class AssessmentRoadmap {
  readonly id: AssessmentRoadmapId;
  readonly assessmentId: AssessmentId;
  readonly phases: RoadmapPhase[];
  readonly executiveSummary: string;
  readonly generatedAt: string;

  private constructor(props: AssessmentRoadmapProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.phases = props.phases.map((p) => ({
      ...p,
      items: p.items.map((i) => ({ ...i })),
    }));
    this.executiveSummary = props.executiveSummary;
    this.generatedAt = props.generatedAt;
  }

  static create(
    props: Omit<AssessmentRoadmapProps, "id" | "generatedAt"> & {
      id?: AssessmentRoadmapId;
      generatedAt?: string;
    },
  ): AssessmentRoadmap {
    return new AssessmentRoadmap({
      id: props.id ?? `armap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: props.assessmentId,
      phases: props.phases,
      executiveSummary: props.executiveSummary,
      generatedAt: props.generatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AssessmentRoadmapProps {
    return {
      id: this.id,
      assessmentId: this.assessmentId,
      phases: this.phases.map((p) => ({ ...p, items: p.items.map((i) => ({ ...i })) })),
      executiveSummary: this.executiveSummary,
      generatedAt: this.generatedAt,
    };
  }
}
