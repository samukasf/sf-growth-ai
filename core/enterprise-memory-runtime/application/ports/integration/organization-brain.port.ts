export interface OrganizationBrainPort {
  isAvailable(): boolean;
  notifyMemoryIndexed?(input: {
    organizationId: string;
    companyId: string;
    memoryId: string;
  }): Promise<void>;
}
