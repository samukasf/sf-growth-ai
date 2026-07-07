export type ProcessExecutiveRequestDto = {
  companyId: string;
  organizationId?: string;
  query: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, string>;
};
