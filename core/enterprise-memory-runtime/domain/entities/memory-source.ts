export type MemorySourceProps = {
  type: string;
  origin: string;
  referenceId?: string;
  capturedAt: string;
};

export class MemorySource {
  readonly type: string;
  readonly origin: string;
  readonly referenceId?: string;
  readonly capturedAt: string;

  private constructor(props: MemorySourceProps) {
    this.type = props.type;
    this.origin = props.origin;
    this.referenceId = props.referenceId;
    this.capturedAt = props.capturedAt;
  }

  static create(props: MemorySourceProps): MemorySource {
    return new MemorySource({
      type: props.type.trim(),
      origin: props.origin.trim(),
      referenceId: props.referenceId?.trim(),
      capturedAt: props.capturedAt,
    });
  }

  toJSON(): MemorySourceProps {
    return {
      type: this.type,
      origin: this.origin,
      referenceId: this.referenceId,
      capturedAt: this.capturedAt,
    };
  }
}
