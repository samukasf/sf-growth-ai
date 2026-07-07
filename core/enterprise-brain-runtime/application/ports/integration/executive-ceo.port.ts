export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  prioritizeSnapshot?(input: {
    organizationId: string;
    priorities: string[];
  }): Promise<string[]>;
}
