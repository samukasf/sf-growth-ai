export type ClientLifecycleEventHandler = {
  eventType: string;
  handle: (payload: Record<string, unknown>) => Promise<void>;
};

export const clientLifecycleHandlers: ClientLifecycleEventHandler[] = [];
