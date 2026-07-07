export interface CompanyBrainPort {
  isAvailable(): boolean;
  enrichContext?(input: {
    organizationId: string;
    prompt: string;
  }): Promise<Record<string, string>>;
}
