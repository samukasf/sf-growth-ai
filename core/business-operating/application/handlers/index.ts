export type BusinessOperatingEventHandler = {
  eventType: string;
  handle: (payload: Record<string, unknown>) => Promise<void>;
};

export const businessOperatingHandlers: BusinessOperatingEventHandler[] = [];
