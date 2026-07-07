export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  notifyMemoryArchived?(input: {
    organizationId: string;
    memoryId: string;
  }): Promise<void>;
}
