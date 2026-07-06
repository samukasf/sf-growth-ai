import type { CompanyId, KnowledgeRecordId, Score } from "../../shared";
import { clampScore } from "../../shared";
import type { ExecutiveDomain } from "./knowledge-category";
import { KnowledgeCategory } from "./knowledge-category";
import { KnowledgeMetadata } from "./knowledge-metadata";
import { KnowledgeSource } from "./knowledge-source";

export type KnowledgeRecordProps = {
  id: KnowledgeRecordId;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  source: KnowledgeSource;
  domain: ExecutiveDomain;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  content: string;
  confidence: Score;
  importance: Score;
  relevance: Score;
  tags: string[];
  references: string[];
  metadata: KnowledgeMetadata;
};

export type CreateKnowledgeRecordProps = Omit<
  KnowledgeRecordProps,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: KnowledgeRecordId;
  createdAt?: string;
  updatedAt?: string;
};

export class KnowledgeRecord {
  readonly id: KnowledgeRecordId;
  readonly companyId: CompanyId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly source: KnowledgeSource;
  readonly domain: ExecutiveDomain;
  readonly category: KnowledgeCategory;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly confidence: Score;
  readonly importance: Score;
  readonly relevance: Score;
  readonly tags: string[];
  readonly references: string[];
  readonly metadata: KnowledgeMetadata;

  private constructor(props: KnowledgeRecordProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.source = props.source;
    this.domain = props.domain;
    this.category = props.category;
    this.title = props.title;
    this.summary = props.summary;
    this.content = props.content;
    this.confidence = props.confidence;
    this.importance = props.importance;
    this.relevance = props.relevance;
    this.tags = [...props.tags];
    this.references = [...props.references];
    this.metadata = props.metadata;
  }

  static create(props: CreateKnowledgeRecordProps): KnowledgeRecord {
    if (!props.companyId.trim()) {
      throw new Error("companyId is required");
    }
    if (!props.title.trim()) {
      throw new Error("title is required");
    }
    if (!props.content.trim()) {
      throw new Error("content is required");
    }

    const now = new Date().toISOString();

    return new KnowledgeRecord({
      id: props.id ?? `knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      source: props.source,
      domain: props.domain,
      category: props.category,
      title: props.title.trim(),
      summary: props.summary.trim(),
      content: props.content.trim(),
      confidence: clampScore(props.confidence),
      importance: clampScore(props.importance),
      relevance: clampScore(props.relevance),
      tags: props.tags.map((tag) => tag.trim()).filter(Boolean),
      references: props.references.map((ref) => ref.trim()).filter(Boolean),
      metadata: props.metadata,
    });
  }

  updateContent(input: {
    title?: string;
    summary?: string;
    content?: string;
    confidence?: Score;
    importance?: Score;
    relevance?: Score;
    tags?: string[];
    references?: string[];
    metadata?: KnowledgeMetadata;
  }): KnowledgeRecord {
    return KnowledgeRecord.create({
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      source: this.source,
      domain: this.domain,
      category: this.category,
      title: input.title ?? this.title,
      summary: input.summary ?? this.summary,
      content: input.content ?? this.content,
      confidence: input.confidence ?? this.confidence,
      importance: input.importance ?? this.importance,
      relevance: input.relevance ?? this.relevance,
      tags: input.tags ?? this.tags,
      references: input.references ?? this.references,
      metadata: input.metadata ?? this.metadata,
    });
  }

  markValidated(): KnowledgeRecord {
    return this.updateContent({
      metadata: this.metadata.withStatus("validated"),
      confidence: clampScore(this.confidence + 5),
    });
  }

  markArchived(): KnowledgeRecord {
    return this.updateContent({
      metadata: this.metadata.withStatus("archived"),
      relevance: clampScore(Math.max(0, this.relevance - 20)),
    });
  }

  isActive(): boolean {
    return this.metadata.status === "active" || this.metadata.status === "validated";
  }

  toJSON(): KnowledgeRecordProps {
    return {
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      source: this.source,
      domain: this.domain,
      category: this.category,
      title: this.title,
      summary: this.summary,
      content: this.content,
      confidence: this.confidence,
      importance: this.importance,
      relevance: this.relevance,
      tags: [...this.tags],
      references: [...this.references],
      metadata: this.metadata,
    };
  }
}
