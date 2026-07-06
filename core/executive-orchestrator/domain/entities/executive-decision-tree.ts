import type {
  CompanyId,
  ExecutiveDecisionTreeId,
  ExecutiveParticipantId,
} from "../../shared";

export type DecisionNode = {
  id: string;
  intent: string;
  keywords: string[];
  participants: ExecutiveParticipantId[];
};

export type ExecutiveDecisionTreeProps = {
  id: ExecutiveDecisionTreeId;
  companyId: CompanyId;
  name: string;
  nodes: DecisionNode[];
  defaultParticipants: ExecutiveParticipantId[];
  createdAt: string;
};

export class ExecutiveDecisionTree {
  readonly id: ExecutiveDecisionTreeId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly nodes: DecisionNode[];
  readonly defaultParticipants: ExecutiveParticipantId[];
  readonly createdAt: string;

  private constructor(props: ExecutiveDecisionTreeProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.name = props.name;
    this.nodes = props.nodes.map((n) => ({
      ...n,
      keywords: [...n.keywords],
      participants: [...n.participants],
    }));
    this.defaultParticipants = [...props.defaultParticipants];
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ExecutiveDecisionTreeProps, "id" | "createdAt"> & {
      id?: ExecutiveDecisionTreeId;
      createdAt?: string;
    },
  ): ExecutiveDecisionTree {
    return new ExecutiveDecisionTree({
      id: props.id ?? `decision-tree-${Date.now()}`,
      companyId: props.companyId,
      name: props.name.trim(),
      nodes: props.nodes,
      defaultParticipants: props.defaultParticipants,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  matchParticipants(query: string): ExecutiveParticipantId[] {
    const normalized = query.toLowerCase();

    for (const node of this.nodes) {
      if (node.keywords.some((keyword) => normalized.includes(keyword))) {
        return [...node.participants];
      }
    }

    return [...this.defaultParticipants];
  }

  toJSON(): ExecutiveDecisionTreeProps {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      nodes: this.nodes.map((n) => ({
        ...n,
        keywords: [...n.keywords],
        participants: [...n.participants],
      })),
      defaultParticipants: [...this.defaultParticipants],
      createdAt: this.createdAt,
    };
  }
}
