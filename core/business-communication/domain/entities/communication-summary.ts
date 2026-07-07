import type {
  CommunicationSummaryId,
  ConversationId,
  OrganizationId,
} from "../../shared";

export type CommunicationSummaryProps = {
  id: CommunicationSummaryId;
  organizationId: OrganizationId;
  conversationId: ConversationId;
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
  actionItems: string[];
  generatedAt: string;
};

export class CommunicationSummary {
  readonly id: CommunicationSummaryId;
  readonly organizationId: OrganizationId;
  readonly conversationId: ConversationId;
  readonly summary: string;
  readonly keyPoints: string[];
  readonly sentiment: "positive" | "neutral" | "negative";
  readonly actionItems: string[];
  readonly generatedAt: string;

  private constructor(props: CommunicationSummaryProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.conversationId = props.conversationId;
    this.summary = props.summary;
    this.keyPoints = [...props.keyPoints];
    this.sentiment = props.sentiment;
    this.actionItems = [...props.actionItems];
    this.generatedAt = props.generatedAt;
  }

  static create(
    props: Omit<CommunicationSummaryProps, "id" | "generatedAt"> & {
      id?: CommunicationSummaryId;
      generatedAt?: string;
    },
  ): CommunicationSummary {
    return new CommunicationSummary({
      id: props.id ?? `summary-${Date.now()}`,
      organizationId: props.organizationId,
      conversationId: props.conversationId,
      summary: props.summary.trim(),
      keyPoints: props.keyPoints,
      sentiment: props.sentiment,
      actionItems: props.actionItems,
      generatedAt: props.generatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CommunicationSummaryProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      conversationId: this.conversationId,
      summary: this.summary,
      keyPoints: [...this.keyPoints],
      sentiment: this.sentiment,
      actionItems: [...this.actionItems],
      generatedAt: this.generatedAt,
    };
  }
}
