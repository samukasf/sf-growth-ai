export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  syncMemory?(input: {
    organizationId: string;
    companyId: string;
    memoryId: string;
  }): Promise<void>;
}
