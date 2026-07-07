export interface ExecutiveReasoningPort {
  isAvailable(): boolean;
  enrichBusinessContext?(input: {
    organizationId: string;
    companyId: string;
    context: Record<string, string>;
  }): Promise<Record<string, string>>;
}
