export type CalendarConnectorProvider =
  | "google"
  | "outlook"
  | "apple"
  | "calendly"
  | "internal";

export interface CalendarConnectorPort {
  provider: CalendarConnectorProvider;
  isAvailable(): boolean;
  sync(): Promise<{ synced: boolean; message: string }>;
}
