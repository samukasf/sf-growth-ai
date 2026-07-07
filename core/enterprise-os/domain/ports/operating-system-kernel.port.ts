import type { EnterprisePlatform, OperatingSession } from "../entities";

export type KernelStatus = "initializing" | "ready" | "degraded" | "shutdown";

export type KernelSnapshot = {
  status: KernelStatus;
  platformCount: number;
  capabilityCount: number;
  activeSessions: number;
  uptime: number;
};

export interface OperatingSystemKernel {
  initialize(organizationId: string): Promise<KernelSnapshot>;
  boot(platforms: EnterprisePlatform[]): KernelSnapshot;
  getStatus(): KernelSnapshot;
  registerSession(session: OperatingSession): void;
}
