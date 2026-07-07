import type { CalendarConnectorPort } from "../../application/ports/connectors";

abstract class BaseNoopCalendarConnector implements CalendarConnectorPort {
  constructor(readonly provider: CalendarConnectorPort["provider"]) {}

  isAvailable(): boolean {
    return false;
  }

  async sync(): Promise<{ synced: boolean; message: string }> {
    return {
      synced: false,
      message: `${this.provider} connector not configured (architecture only)`,
    };
  }
}

export class NoopGoogleCalendarConnector extends BaseNoopCalendarConnector {
  constructor() {
    super("google");
  }
}

export class NoopOutlookCalendarConnector extends BaseNoopCalendarConnector {
  constructor() {
    super("outlook");
  }
}

export class NoopAppleCalendarConnector extends BaseNoopCalendarConnector {
  constructor() {
    super("apple");
  }
}

export class NoopCalendlyConnector extends BaseNoopCalendarConnector {
  constructor() {
    super("calendly");
  }
}

export class NoopInternalCalendarConnector extends BaseNoopCalendarConnector {
  constructor() {
    super("internal");
  }
}

export function createDefaultCalendarConnectors(): CalendarConnectorPort[] {
  return [
    new NoopGoogleCalendarConnector(),
    new NoopOutlookCalendarConnector(),
    new NoopAppleCalendarConnector(),
    new NoopCalendlyConnector(),
    new NoopInternalCalendarConnector(),
  ];
}
