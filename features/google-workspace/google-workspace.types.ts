export type GoogleWorkspaceServiceStatus = {
  connected: boolean;
  count: number | null;
  error?: string;
};

export type GoogleWorkspaceSummary = {
  connected: boolean;
  accountLabel: string | null;
  updatedAt: string;
  gmail: GoogleWorkspaceServiceStatus;
  calendar: GoogleWorkspaceServiceStatus;
  drive: GoogleWorkspaceServiceStatus;
  contacts: GoogleWorkspaceServiceStatus;
};
