export interface ExecutiveOrchestratorPort {
  isAvailable(): boolean;
  notifySnapshotBuilt?(input: {
    organizationId: string;
    companyId: string;
    snapshotId: string;
  }): Promise<void>;
}
