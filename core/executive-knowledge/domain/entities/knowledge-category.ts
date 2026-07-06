export type ExecutiveDomain =
  | "finance"
  | "marketing"
  | "operations"
  | "sales"
  | "technology"
  | "hr"
  | "legal"
  | "market"
  | "strategy"
  | "general";

export type KnowledgeCategoryKind =
  | "fact"
  | "analysis"
  | "decision"
  | "recommendation"
  | "action"
  | "result"
  | "feedback"
  | "learning"
  | "insight"
  | "playbook";

export type KnowledgeCategoryProps = {
  kind: KnowledgeCategoryKind;
  label: string;
  executiveDomain: ExecutiveDomain;
};

export class KnowledgeCategory {
  readonly kind: KnowledgeCategoryKind;
  readonly label: string;
  readonly executiveDomain: ExecutiveDomain;

  private constructor(props: KnowledgeCategoryProps) {
    this.kind = props.kind;
    this.label = props.label;
    this.executiveDomain = props.executiveDomain;
  }

  static create(props: KnowledgeCategoryProps): KnowledgeCategory {
    if (!props.label.trim()) {
      throw new Error("Knowledge category label is required");
    }

    return new KnowledgeCategory({
      kind: props.kind,
      label: props.label.trim(),
      executiveDomain: props.executiveDomain,
    });
  }

  equals(other: KnowledgeCategory): boolean {
    return (
      this.kind === other.kind &&
      this.label === other.label &&
      this.executiveDomain === other.executiveDomain
    );
  }

  toJSON(): KnowledgeCategoryProps {
    return {
      kind: this.kind,
      label: this.label,
      executiveDomain: this.executiveDomain,
    };
  }
}
