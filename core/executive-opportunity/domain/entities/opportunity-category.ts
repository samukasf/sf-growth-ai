import type { OpportunityCategoryId, OpportunityCategoryKey } from "../../shared";

export type OpportunityCategoryProps = {
  id: OpportunityCategoryId;
  key: OpportunityCategoryKey;
  label: string;
  description: string;
};

export class OpportunityCategory {
  readonly id: OpportunityCategoryId;
  readonly key: OpportunityCategoryKey;
  readonly label: string;
  readonly description: string;

  private constructor(props: OpportunityCategoryProps) {
    this.id = props.id;
    this.key = props.key;
    this.label = props.label;
    this.description = props.description;
  }

  static create(
    props: Omit<OpportunityCategoryProps, "id"> & { id?: OpportunityCategoryId },
  ): OpportunityCategory {
    return new OpportunityCategory({
      id: props.id ?? `cat-${props.key}`,
      key: props.key,
      label: props.label,
      description: props.description,
    });
  }

  toJSON(): OpportunityCategoryProps {
    return {
      id: this.id,
      key: this.key,
      label: this.label,
      description: this.description,
    };
  }
}
