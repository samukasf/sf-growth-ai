export type KnowledgeMetadataStatus = "active" | "validated" | "archived";

export type KnowledgeMetadataProps = {
  involvedModules?: string[];
  responsibleEngine?: string;
  userId?: string;
  version?: number;
  status?: KnowledgeMetadataStatus;
  custom?: Record<string, string | number | boolean>;
};

export class KnowledgeMetadata {
  readonly involvedModules: string[];
  readonly responsibleEngine?: string;
  readonly userId?: string;
  readonly version: number;
  readonly status: KnowledgeMetadataStatus;
  readonly custom: Record<string, string | number | boolean>;

  private constructor(props: Required<Pick<KnowledgeMetadataProps, "version" | "status">> & KnowledgeMetadataProps) {
    this.involvedModules = props.involvedModules ?? [];
    this.responsibleEngine = props.responsibleEngine;
    this.userId = props.userId;
    this.version = props.version;
    this.status = props.status;
    this.custom = props.custom ?? {};
  }

  static create(props: KnowledgeMetadataProps = {}): KnowledgeMetadata {
    return new KnowledgeMetadata({
      involvedModules: props.involvedModules ?? [],
      responsibleEngine: props.responsibleEngine,
      userId: props.userId,
      version: props.version ?? 1,
      status: props.status ?? "active",
      custom: props.custom ?? {},
    });
  }

  withStatus(status: KnowledgeMetadataStatus): KnowledgeMetadata {
    return KnowledgeMetadata.create({
      involvedModules: [...this.involvedModules],
      responsibleEngine: this.responsibleEngine,
      userId: this.userId,
      version: this.version + 1,
      status,
      custom: { ...this.custom },
    });
  }

  withCustomField(key: string, value: string | number | boolean): KnowledgeMetadata {
    return KnowledgeMetadata.create({
      involvedModules: [...this.involvedModules],
      responsibleEngine: this.responsibleEngine,
      userId: this.userId,
      version: this.version,
      status: this.status,
      custom: { ...this.custom, [key]: value },
    });
  }

  toJSON(): KnowledgeMetadataProps & { version: number; status: KnowledgeMetadataStatus } {
    return {
      involvedModules: [...this.involvedModules],
      responsibleEngine: this.responsibleEngine,
      userId: this.userId,
      version: this.version,
      status: this.status,
      custom: { ...this.custom },
    };
  }
}
