import type {
  CommunicationTaskId,
  ConversationId,
  OrganizationId,
} from "../../shared";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskType = "follow_up" | "escalation" | "approval" | "review";

export type CommunicationTaskProps = {
  id: CommunicationTaskId;
  organizationId: OrganizationId;
  conversationId: ConversationId;
  type: TaskType;
  title: string;
  description: string;
  assigneeId?: string;
  status: TaskStatus;
  dueAt?: string;
  createdAt: string;
};

export class CommunicationTask {
  readonly id: CommunicationTaskId;
  readonly organizationId: OrganizationId;
  readonly conversationId: ConversationId;
  readonly type: TaskType;
  readonly title: string;
  readonly description: string;
  readonly assigneeId?: string;
  readonly status: TaskStatus;
  readonly dueAt?: string;
  readonly createdAt: string;

  private constructor(props: CommunicationTaskProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.conversationId = props.conversationId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.assigneeId = props.assigneeId;
    this.status = props.status;
    this.dueAt = props.dueAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<CommunicationTaskProps, "id" | "createdAt" | "status"> & {
      id?: CommunicationTaskId;
      createdAt?: string;
      status?: TaskStatus;
    },
  ): CommunicationTask {
    return new CommunicationTask({
      id: props.id ?? `task-${Date.now()}`,
      organizationId: props.organizationId,
      conversationId: props.conversationId,
      type: props.type,
      title: props.title.trim(),
      description: props.description.trim(),
      assigneeId: props.assigneeId,
      status: props.status ?? "pending",
      dueAt: props.dueAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CommunicationTaskProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      conversationId: this.conversationId,
      type: this.type,
      title: this.title,
      description: this.description,
      assigneeId: this.assigneeId,
      status: this.status,
      dueAt: this.dueAt,
      createdAt: this.createdAt,
    };
  }
}
