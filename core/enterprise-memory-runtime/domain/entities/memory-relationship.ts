import type { MemoryRelationshipId, MemoryId } from "../../shared";

export type MemoryRelationshipType =
  | "related_to"
  | "derived_from"
  | "supersedes"
  | "references"
  | "belongs_to"
  | "involves";

export type MemoryRelationshipProps = {
  id: MemoryRelationshipId;
  sourceMemoryId: MemoryId;
  targetMemoryId: MemoryId;
  relationshipType: MemoryRelationshipType;
  strength: number;
  createdAt: string;
};

export class MemoryRelationship {
  readonly id: MemoryRelationshipId;
  readonly sourceMemoryId: MemoryId;
  readonly targetMemoryId: MemoryId;
  readonly relationshipType: MemoryRelationshipType;
  readonly strength: number;
  readonly createdAt: string;

  private constructor(props: MemoryRelationshipProps) {
    this.id = props.id;
    this.sourceMemoryId = props.sourceMemoryId;
    this.targetMemoryId = props.targetMemoryId;
    this.relationshipType = props.relationshipType;
    this.strength = props.strength;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<MemoryRelationshipProps, "id" | "createdAt"> & {
      id?: MemoryRelationshipId;
      createdAt?: string;
    },
  ): MemoryRelationship {
    return new MemoryRelationship({
      id: props.id ?? `mrel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sourceMemoryId: props.sourceMemoryId,
      targetMemoryId: props.targetMemoryId,
      relationshipType: props.relationshipType,
      strength: Math.max(0, Math.min(100, props.strength)),
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MemoryRelationshipProps {
    return {
      id: this.id,
      sourceMemoryId: this.sourceMemoryId,
      targetMemoryId: this.targetMemoryId,
      relationshipType: this.relationshipType,
      strength: this.strength,
      createdAt: this.createdAt,
    };
  }
}
