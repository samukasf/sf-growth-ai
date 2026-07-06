import type { CompanyId, PlaybookId, WisdomId } from "../../shared";

export type PlaybookEntry = {
  id: string;
  title: string;
  description: string;
  order: number;
};

export type ExecutivePlaybookProps = {
  id: PlaybookId;
  companyId: CompanyId;
  wisdomId: WisdomId;
  title: string;
  description: string;
  domain: string;
  entries: PlaybookEntry[];
  createdAt: string;
  updatedAt: string;
};

export class ExecutivePlaybook {
  readonly id: PlaybookId;
  readonly companyId: CompanyId;
  readonly wisdomId: WisdomId;
  readonly title: string;
  readonly description: string;
  readonly domain: string;
  readonly entries: PlaybookEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ExecutivePlaybookProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.title = props.title;
    this.description = props.description;
    this.domain = props.domain;
    this.entries = [...props.entries];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ExecutivePlaybookProps, "id" | "createdAt" | "updatedAt"> & {
      id?: PlaybookId;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ExecutivePlaybook {
    const now = new Date().toISOString();

    return new ExecutivePlaybook({
      id: props.id ?? `playbook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      title: props.title.trim(),
      description: props.description.trim(),
      domain: props.domain.trim(),
      entries: props.entries,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): ExecutivePlaybookProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      title: this.title,
      description: this.description,
      domain: this.domain,
      entries: [...this.entries],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
