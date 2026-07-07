import type {
  EnterprisePlatform,
  OperatingSession,
  OperatingSystemKernel,
} from "../../domain";

export class DefaultOperatingSystemKernel implements OperatingSystemKernel {
  private status: "initializing" | "ready" | "degraded" | "shutdown" = "initializing";
  private platformCount = 0;
  private capabilityCount = 0;
  private sessions: OperatingSession[] = [];
  private bootedAt = Date.now();

  async initialize(organizationId: string) {
    void organizationId;
    this.status = "ready";
    this.bootedAt = Date.now();
    return this.getStatus();
  }

  boot(platforms: EnterprisePlatform[]) {
    this.platformCount = platforms.length;
    this.capabilityCount = platforms.length;
    this.status = platforms.some((p) => p.status === "degraded") ? "degraded" : "ready";
    this.bootedAt = Date.now();
    return this.getStatus();
  }

  getStatus() {
    return {
      status: this.status,
      platformCount: this.platformCount,
      capabilityCount: this.capabilityCount,
      activeSessions: this.sessions.filter((s) => s.status === "active").length,
      uptime: Date.now() - this.bootedAt,
    };
  }

  registerSession(session: OperatingSession) {
    this.sessions.push(session);
  }
}
