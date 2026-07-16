export type GoogleWorkspaceServiceStatus = {
  connected: boolean;
  count: number | null;
  error?: string;
};

export type GoogleWorkspaceCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
};

export type GoogleWorkspaceCalendarStatus = GoogleWorkspaceServiceStatus & {
  events?: GoogleWorkspaceCalendarEvent[];
  nextEvent?: GoogleWorkspaceCalendarEvent | null;
};

export type GoogleWorkspaceSummary = {
  connected: boolean;
  accountLabel: string | null;
  updatedAt: string;
  gmail: GoogleWorkspaceServiceStatus;
  calendar: GoogleWorkspaceCalendarStatus;
  drive: GoogleWorkspaceServiceStatus;
  contacts: GoogleWorkspaceServiceStatus;
};
