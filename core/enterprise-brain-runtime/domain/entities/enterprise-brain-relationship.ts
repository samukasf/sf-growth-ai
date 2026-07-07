import type { BrainRelationshipId } from "../../shared";

export type EnterpriseBrainRelationshipProps = {
  id: BrainRelationshipId;
  sourceDomain: string;
  targetDomain: string;
  relationshipType: string;
  strength: number;
  label: string;
};

export class EnterpriseBrainRelationship {
  readonly id: BrainRelationshipId;
  readonly sourceDomain: string;
  readonly targetDomain: string;
  readonly relationshipType: string;
  readonly strength: number;
  readonly label: string;

  private constructor(props: EnterpriseBrainRelationshipProps) {
    this.id = props.id;
    this.sourceDomain = props.sourceDomain;
    this.targetDomain = props.targetDomain;
    this.relationshipType = props.relationshipType;
    this.strength = props.strength;
    this.label = props.label;
  }

  static create(
    props: Omit<EnterpriseBrainRelationshipProps, "id"> & { id?: BrainRelationshipId },
  ): EnterpriseBrainRelationship {
    return new EnterpriseBrainRelationship({
      id: props.id ?? `brel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sourceDomain: props.sourceDomain,
      targetDomain: props.targetDomain,
      relationshipType: props.relationshipType,
      strength: Math.max(0, Math.min(100, props.strength)),
      label: props.label,
    });
  }

  toJSON(): EnterpriseBrainRelationshipProps {
    return {
      id: this.id,
      sourceDomain: this.sourceDomain,
      targetDomain: this.targetDomain,
      relationshipType: this.relationshipType,
      strength: this.strength,
      label: this.label,
    };
  }
}
