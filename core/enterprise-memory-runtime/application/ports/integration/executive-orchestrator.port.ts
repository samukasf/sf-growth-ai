export interface ExecutiveOrchestratorPort {
  isAvailable(): boolean;
  notifyMemoryChange?(input: {
    organizationId: string;
    companyId: string;
    memoryId: string;
    action: string;
  }): Promise<void>;
}
