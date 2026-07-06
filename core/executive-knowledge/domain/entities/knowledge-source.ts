export type KnowledgeSourceType =
  | "executive-engine"
  | "executive-module"
  | "watcher"
  | "inbox"
  | "conversation"
  | "manual"
  | "system";

export type KnowledgeSourceProps = {
  type: KnowledgeSourceType;
  origin: string;
  referenceId?: string;
  capturedAt: string;
};

export class KnowledgeSource {
  readonly type: KnowledgeSourceType;
  readonly origin: string;
  readonly referenceId?: string;
  readonly capturedAt: string;

  private constructor(props: KnowledgeSourceProps) {
    this.type = props.type;
    this.origin = props.origin;
    this.referenceId = props.referenceId;
    this.capturedAt = props.capturedAt;
  }

  static create(props: KnowledgeSourceProps): KnowledgeSource {
    if (!props.origin.trim()) {
      throw new Error("Knowledge source origin is required");
    }

    return new KnowledgeSource({
      type: props.type,
      origin: props.origin.trim(),
      referenceId: props.referenceId,
      capturedAt: props.capturedAt,
    });
  }

  equals(other: KnowledgeSource): boolean {
    return (
      this.type === other.type &&
      this.origin === other.origin &&
      this.referenceId === other.referenceId &&
      this.capturedAt === other.capturedAt
    );
  }

  toJSON(): KnowledgeSourceProps {
    return {
      type: this.type,
      origin: this.origin,
      referenceId: this.referenceId,
      capturedAt: this.capturedAt,
    };
  }
}
