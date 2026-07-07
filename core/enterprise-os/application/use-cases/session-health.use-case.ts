import { OperatingSession } from "../../domain";
import { createPlatformHealthUpdatedEvent } from "../../domain";
import type { CheckHealthDto, StartSessionDto } from "../dto";
import type { EnterpriseOsDependencies } from "../dependencies";

export class StartSessionUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: StartSessionDto) {
    const session = OperatingSession.create({
      organizationId: dto.organizationId,
      userId: dto.userId,
      contextId: dto.contextId,
      activePlatformIds: dto.activePlatformIds ?? [],
    });

    await this.deps.enterpriseRegistry.saveSession(session);
    this.deps.operatingSystemKernel.registerSession(session);
    return session;
  }
}

export class CheckHealthUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: CheckHealthDto) {
    const platforms = await this.deps.enterpriseRegistry.findPlatformsByOrganization(
      dto.organizationId,
    );
    const report = this.deps.healthMonitor.checkEcosystem(platforms, dto.organizationId);

    for (const platformReport of report.platforms) {
      const platform = platforms.find((p) => p.id === platformReport.platformId);
      if (!platform) continue;

      const previousScore = platform.healthScore;
      const updated = platform.updateHealth(platformReport.score.value);
      await this.deps.enterpriseRegistry.savePlatform(updated);
      await this.deps.eventDispatcher.publish(
        createPlatformHealthUpdatedEvent(updated, previousScore),
      );
    }

    return report;
  }
}
