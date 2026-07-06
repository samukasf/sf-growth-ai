export type ProcessExecutiveRequestDto = {
  companyId: string;
  query: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, string>;
};
