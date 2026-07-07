import type { BrainSignalId, BrainSignalType } from "../../shared";
import { clampScore } from "../../shared";

export type EnterpriseBrainSignalProps = {
  id: BrainSignalId;
  type: BrainSignalType;
  title: string;
  description: string;
  source: string;
  severity: number;
  createdAt: string;
};

export class EnterpriseBrainSignal {
  readonly id: BrainSignalId;
  readonly type: BrainSignalType;
  readonly title: string;
  readonly description: string;
  readonly source: string;
  readonly severity: number;
  readonly createdAt: string;

  private constructor(props: EnterpriseBrainSignalProps) {
    this.id = props.id;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.source = props.source;
    this.severity = props.severity;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<EnterpriseBrainSignalProps, "id" | "createdAt" | "severity"> & {
      id?: BrainSignalId;
      createdAt?: string;
      severity?: number;
    },
  ): EnterpriseBrainSignal {
    return new EnterpriseBrainSignal({
      id: props.id ?? `bsig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: props.type,
      title: props.title,
      description: props.description,
      source: props.source,
      severity: clampScore(props.severity ?? 50),
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): EnterpriseBrainSignalProps {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      source: this.source,
      severity: this.severity,
      createdAt: this.createdAt,
    };
  }
}
