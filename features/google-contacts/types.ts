export type ContactsActionId =
  | "contacts_search"
  | "contacts_email"
  | "contacts_phone"
  | "contacts_company"
  | "contacts_birthdays";

export type ContactsErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_CONNECTED"
  | "AUTH_ERROR"
  | "NETWORK_ERROR"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "UNKNOWN";

export class ContactsApiError extends Error {
  readonly code: ContactsErrorCode;
  readonly status?: number;

  constructor(code: ContactsErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "ContactsApiError";
    this.code = code;
    this.status = options?.status;
  }
}

export type GoogleContact = {
  resourceName: string;
  name: string;
  emails: string[];
  phones: string[];
  company?: string;
  birthday?: { month: number; day: number; year?: number };
};

export type ContactSummary = {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  company?: string;
  birthdayLabel?: string;
};

export type ContactsToolInput = {
  actionId: ContactsActionId;
  /** Nome do contato (search, email, phone). */
  name?: string;
  /** Termo de busca livre. */
  query?: string;
  /** Nome da empresa (contacts_company). */
  company?: string;
  maxResults?: number;
};

export type ContactsToolOutput = {
  actionId: ContactsActionId;
  summary: string;
  data: Record<string, unknown>;
};
