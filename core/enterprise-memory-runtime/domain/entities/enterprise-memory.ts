import type {
  CompanyId,
  MemoryId,
  MemoryLifecycleStatus,
  MemoryType,
  MemoryVisibility,
  OrganizationId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";
import { MemoryRelationship } from "./memory-relationship";
import { MemorySource } from "./memory-source";

export type EnterpriseMemoryProps = {
  id: MemoryId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  type: MemoryType;
  title: string;
  summary: string;
  content: string;
  source: MemorySource;
  createdAt: string;
  updatedAt: string;
  importance: Score;
  confidence: Score;
  relevanceScore: Score;
  tags: string[];
  relationships: MemoryRelationship[];
  visibility: MemoryVisibility;
  owner: string;
  status: MemoryLifecycleStatus;
  currentVersion: number;
};

export class EnterpriseMemory {
  readonly id: MemoryId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly type: MemoryType;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly source: MemorySource;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly importance: Score;
  readonly confidence: Score;
  readonly relevanceScore: Score;
  readonly tags: string[];
  readonly relationships: MemoryRelationship[];
  readonly visibility: MemoryVisibility;
  readonly owner: string;
  readonly status: MemoryLifecycleStatus;
  readonly currentVersion: number;

  private constructor(props: EnterpriseMemoryProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.type = props.type;
    this.title = props.title;
    this.summary = props.summary;
    this.content = props.content;
    this.source = props.source;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.importance = props.importance;
    this.confidence = props.confidence;
    this.relevanceScore = props.relevanceScore;
    this.tags = [...props.tags];
    this.relationships = [...props.relationships];
    this.visibility = props.visibility;
    this.owner = props.owner;
    this.status = props.status;
    this.currentVersion = props.currentVersion;
  }

  static create(
    props: Omit<
      EnterpriseMemoryProps,
      "id" | "createdAt" | "updatedAt" | "status" | "currentVersion" | "relevanceScore"
    > & {
      id?: MemoryId;
      createdAt?: string;
      updatedAt?: string;
      status?: MemoryLifecycleStatus;
      currentVersion?: number;
      relevanceScore?: Score;
    },
  ): EnterpriseMemory {
    if (!props.organizationId.trim()) throw new Error("organizationId is required");
    if (!props.companyId.trim()) throw new Error("companyId is required");
    if (!props.title.trim()) throw new Error("title is required");
    if (!props.content.trim()) throw new Error("content is required");

    const now = new Date().toISOString();

    return new EnterpriseMemory({
      id: props.id ?? `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      type: props.type,
      title: props.title.trim(),
      summary: props.summary.trim(),
      content: props.content.trim(),
      source: props.source,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      importance: clampScore(props.importance),
      confidence: clampScore(props.confidence),
      relevanceScore: clampScore(props.relevanceScore ?? 50),
      tags: props.tags.map((tag) => tag.trim()).filter(Boolean),
      relationships: props.relationships,
      visibility: props.visibility,
      owner: props.owner,
      status: props.status ?? "active",
      currentVersion: props.currentVersion ?? 1,
    });
  }

  update(input: {
    title?: string;
    summary?: string;
    content?: string;
    importance?: Score;
    confidence?: Score;
    relevanceScore?: Score;
    tags?: string[];
    visibility?: MemoryVisibility;
    owner?: string;
    version?: number;
  }): EnterpriseMemory {
    return EnterpriseMemory.create({
      ...this.toJSON(),
      title: input.title ?? this.title,
      summary: input.summary ?? this.summary,
      content: input.content ?? this.content,
      importance: input.importance ?? this.importance,
      confidence: input.confidence ?? this.confidence,
      relevanceScore: input.relevanceScore ?? this.relevanceScore,
      tags: input.tags ?? this.tags,
      visibility: input.visibility ?? this.visibility,
      owner: input.owner ?? this.owner,
      updatedAt: new Date().toISOString(),
      currentVersion: input.version ?? this.currentVersion,
    });
  }

  withRelationship(relationship: MemoryRelationship): EnterpriseMemory {
    return EnterpriseMemory.create({
      ...this.toJSON(),
      relationships: [...this.relationships, relationship],
      updatedAt: new Date().toISOString(),
    });
  }

  archive(): EnterpriseMemory {
    return EnterpriseMemory.create({
      ...this.toJSON(),
      status: "archived",
      relevanceScore: clampScore(Math.max(0, this.relevanceScore - 20)),
      updatedAt: new Date().toISOString(),
    });
  }

  isActive(): boolean {
    return this.status === "active";
  }

  toJSON(): EnterpriseMemoryProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      type: this.type,
      title: this.title,
      summary: this.summary,
      content: this.content,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      importance: this.importance,
      confidence: this.confidence,
      relevanceScore: this.relevanceScore,
      tags: [...this.tags],
      relationships: [...this.relationships],
      visibility: this.visibility,
      owner: this.owner,
      status: this.status,
      currentVersion: this.currentVersion,
    };
  }
}
