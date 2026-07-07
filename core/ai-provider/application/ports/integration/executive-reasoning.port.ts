export interface ExecutiveReasoningPort {
  isAvailable(): boolean;
  prepareReasoningContext?(input: {
    organizationId: string;
    prompt: string;
  }): Promise<Record<string, string>>;
}
