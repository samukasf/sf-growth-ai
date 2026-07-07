export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  notifyCodeGeneration?(input: {
    organizationId: string;
    requestId: string;
    operation: string;
  }): Promise<void>;
}
