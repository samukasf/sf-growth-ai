export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  notifyBrainSnapshot?(input: {
    organizationId: string;
    snapshotId: string;
  }): Promise<void>;
}
