import type { MemoryId, MemoryIndexEntryId, MemoryType } from "../../shared";

export type MemoryIndexEntryProps = {
  id: MemoryIndexEntryId;
  memoryId: MemoryId;
  type: MemoryType;
  title: string;
  summary: string;
  tags: string[];
  keywords: string[];
  relevanceScore: number;
  semanticVectorReady: boolean;
  indexedAt: string;
};

export class MemoryIndexEntry {
  readonly id: MemoryIndexEntryId;
  readonly memoryId: MemoryId;
  readonly type: MemoryType;
  readonly title: string;
  readonly summary: string;
  readonly tags: string[];
  readonly keywords: string[];
  readonly relevanceScore: number;
  readonly semanticVectorReady: boolean;
  readonly indexedAt: string;

  private constructor(props: MemoryIndexEntryProps) {
    this.id = props.id;
    this.memoryId = props.memoryId;
    this.type = props.type;
    this.title = props.title;
    this.summary = props.summary;
    this.tags = [...props.tags];
    this.keywords = [...props.keywords];
    this.relevanceScore = props.relevanceScore;
    this.semanticVectorReady = props.semanticVectorReady;
    this.indexedAt = props.indexedAt;
  }

  static create(
    props: Omit<MemoryIndexEntryProps, "id" | "indexedAt" | "semanticVectorReady"> & {
      id?: MemoryIndexEntryId;
      indexedAt?: string;
      semanticVectorReady?: boolean;
    },
  ): MemoryIndexEntry {
    return new MemoryIndexEntry({
      id: props.id ?? `midx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      memoryId: props.memoryId,
      type: props.type,
      title: props.title,
      summary: props.summary,
      tags: props.tags,
      keywords: props.keywords,
      relevanceScore: props.relevanceScore,
      semanticVectorReady: props.semanticVectorReady ?? false,
      indexedAt: props.indexedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MemoryIndexEntryProps {
    return {
      id: this.id,
      memoryId: this.memoryId,
      type: this.type,
      title: this.title,
      summary: this.summary,
      tags: [...this.tags],
      keywords: [...this.keywords],
      relevanceScore: this.relevanceScore,
      semanticVectorReady: this.semanticVectorReady,
      indexedAt: this.indexedAt,
    };
  }
}
