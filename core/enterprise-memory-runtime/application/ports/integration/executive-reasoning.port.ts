export interface ExecutiveReasoningPort {
  isAvailable(): boolean;
  enrichMemoryContext?(input: {
    organizationId: string;
    memoryId: string;
    content: string;
  }): Promise<Record<string, string>>;
}
