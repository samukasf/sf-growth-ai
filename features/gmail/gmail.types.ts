export type GmailActionId =
  | "gmail_inbox"
  | "gmail_search"
  | "gmail_read"
  | "gmail_unread_count"
  | "gmail_draft"
  | "gmail_reply_draft"
  | "gmail_send"
  | "gmail_reply"
  | "gmail_archive"
  | "gmail_trash"
  | "gmail_mark_read"
  | "gmail_mark_unread"
  | "gmail_star"
  | "gmail_label"
  | "gmail_list_labels";

export type GmailActionArgs = {
  messageId?: string;
  query?: string;
  maxResults?: number;
  to?: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
  labelId?: string;
  labelName?: string;
};

export type GmailActionPlan = {
  surface: "gmail";
  actionId: GmailActionId;
  args: GmailActionArgs;
  requiresConfirmation: boolean;
  title: string;
  preview: string;
  confirmationToken?: string;
};

export type GmailToolResult = {
  ok: boolean;
  actionId: GmailActionId;
  summary: string;
  data?: unknown;
  error?: string;
};
