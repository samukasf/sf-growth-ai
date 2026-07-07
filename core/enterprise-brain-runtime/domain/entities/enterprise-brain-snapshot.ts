import type { BrainSnapshotId, CompanyId, OrganizationId, Score } from "../../shared";
import { clampScore } from "../../shared";
import { EnterpriseBrainSignal } from "./enterprise-brain-signal";
import { EnterpriseBrainSummary } from "./enterprise-brain-summary";

export type EnterpriseBrainSnapshotProps = {
  id: BrainSnapshotId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  timestamp: string;
  businessContext: Record<string, string>;
  memorySummary: ReturnType<EnterpriseBrainSummary["toJSON"]>;
  knowledgeSummary: ReturnType<EnterpriseBrainSummary["toJSON"]>;
  learningSummary: ReturnType<EnterpriseBrainSummary["toJSON"]>;
  experienceSummary: ReturnType<EnterpriseBrainSummary["toJSON"]>;
  wisdomSummary: ReturnType<EnterpriseBrainSummary["toJSON"]>;
  organizationSummary: ReturnType<EnterpriseBrainSummary["toJSON"]>;
  activeSignals: ReturnType<EnterpriseBrainSignal["toJSON"]>[];
  risks: string[];
  opportunities: string[];
  priorities: string[];
  confidence: Score;
};

export class EnterpriseBrainSnapshot {
  readonly id: BrainSnapshotId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly timestamp: string;
  readonly businessContext: Record<string, string>;
  readonly memorySummary: EnterpriseBrainSummary;
  readonly knowledgeSummary: EnterpriseBrainSummary;
  readonly learningSummary: EnterpriseBrainSummary;
  readonly experienceSummary: EnterpriseBrainSummary;
  readonly wisdomSummary: EnterpriseBrainSummary;
  readonly organizationSummary: EnterpriseBrainSummary;
  readonly activeSignals: EnterpriseBrainSignal[];
  readonly risks: string[];
  readonly opportunities: string[];
  readonly priorities: string[];
  readonly confidence: Score;

  private constructor(props: {
    id: BrainSnapshotId;
    organizationId: OrganizationId;
    companyId: CompanyId;
    timestamp: string;
    businessContext: Record<string, string>;
    memorySummary: EnterpriseBrainSummary;
    knowledgeSummary: EnterpriseBrainSummary;
    learningSummary: EnterpriseBrainSummary;
    experienceSummary: EnterpriseBrainSummary;
    wisdomSummary: EnterpriseBrainSummary;
    organizationSummary: EnterpriseBrainSummary;
    activeSignals: EnterpriseBrainSignal[];
    risks: string[];
    opportunities: string[];
    priorities: string[];
    confidence: Score;
  }) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.timestamp = props.timestamp;
    this.businessContext = { ...props.businessContext };
    this.memorySummary = props.memorySummary;
    this.knowledgeSummary = props.knowledgeSummary;
    this.learningSummary = props.learningSummary;
    this.experienceSummary = props.experienceSummary;
    this.wisdomSummary = props.wisdomSummary;
    this.organizationSummary = props.organizationSummary;
    this.activeSignals = [...props.activeSignals];
    this.risks = [...props.risks];
    this.opportunities = [...props.opportunities];
    this.priorities = [...props.priorities];
    this.confidence = props.confidence;
  }

  static create(
    props: Omit<EnterpriseBrainSnapshotProps, "id" | "timestamp" | "confidence"> & {
      id?: BrainSnapshotId;
      timestamp?: string;
      confidence?: Score;
      memorySummary: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>;
      knowledgeSummary: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>;
      learningSummary: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>;
      experienceSummary: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>;
      wisdomSummary: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>;
      organizationSummary: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>;
    },
  ): EnterpriseBrainSnapshot {
    const toSummary = (value: EnterpriseBrainSummary | ReturnType<EnterpriseBrainSummary["toJSON"]>) =>
      "toJSON" in value ? value : EnterpriseBrainSummary.create(value);

    return new EnterpriseBrainSnapshot({
      id: props.id ?? `bsnap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      timestamp: props.timestamp ?? new Date().toISOString(),
      businessContext: props.businessContext,
      memorySummary: toSummary(props.memorySummary),
      knowledgeSummary: toSummary(props.knowledgeSummary),
      learningSummary: toSummary(props.learningSummary),
      experienceSummary: toSummary(props.experienceSummary),
      wisdomSummary: toSummary(props.wisdomSummary),
      organizationSummary: toSummary(props.organizationSummary),
      activeSignals: props.activeSignals.map((signal) =>
        EnterpriseBrainSignal.create(signal),
      ),
      risks: props.risks,
      opportunities: props.opportunities,
      priorities: props.priorities,
      confidence: clampScore(props.confidence ?? 50),
    });
  }

  toJSON(): EnterpriseBrainSnapshotProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      timestamp: this.timestamp,
      businessContext: { ...this.businessContext },
      memorySummary: this.memorySummary.toJSON(),
      knowledgeSummary: this.knowledgeSummary.toJSON(),
      learningSummary: this.learningSummary.toJSON(),
      experienceSummary: this.experienceSummary.toJSON(),
      wisdomSummary: this.wisdomSummary.toJSON(),
      organizationSummary: this.organizationSummary.toJSON(),
      activeSignals: this.activeSignals.map((signal) => signal.toJSON()),
      risks: [...this.risks],
      opportunities: [...this.opportunities],
      priorities: [...this.priorities],
      confidence: this.confidence,
    };
  }
}
