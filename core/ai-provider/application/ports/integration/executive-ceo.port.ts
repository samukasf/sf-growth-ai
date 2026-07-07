export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  enrichPrompt?(input: {
    organizationId: string;
    prompt: string;
    context?: Record<string, string>;
  }): Promise<string>;
}
