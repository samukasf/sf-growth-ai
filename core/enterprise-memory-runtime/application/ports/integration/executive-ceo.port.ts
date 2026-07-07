export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  prioritizeMemory?(input: {
    organizationId: string;
    memoryId: string;
    importance: number;
  }): Promise<number>;
}
