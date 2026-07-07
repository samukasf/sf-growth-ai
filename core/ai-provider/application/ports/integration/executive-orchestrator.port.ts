export interface ExecutiveOrchestratorPort {
  isAvailable(): boolean;
  notifyRequestCompleted?(input: {
    organizationId: string;
    requestId: string;
    operation: string;
  }): Promise<void>;
}
