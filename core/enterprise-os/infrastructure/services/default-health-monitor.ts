import type { EnterprisePlatform, HealthMonitor } from "../../domain";

export class DefaultHealthMonitor implements HealthMonitor {
  checkPlatform(platform: EnterprisePlatform) {
    const value = platform.healthScore;
    const status: "critical" | "degraded" | "healthy" | "optimal" =
      value < 50 ? "critical" : value < 70 ? "degraded" : value < 90 ? "healthy" : "optimal";

    return {
      platformId: platform.id,
      platformName: platform.name,
      score: { value, status },
      checkedAt: new Date().toISOString(),
    };
  }

  checkEcosystem(platforms: EnterprisePlatform[], organizationId: string) {
    const platformReports = platforms.map((p) => this.checkPlatform(p));
    const overallScore =
      platformReports.length > 0
        ? Math.round(
            platformReports.reduce((sum, r) => sum + r.score.value, 0) /
              platformReports.length,
          )
        : 100;

    return {
      organizationId,
      overallScore,
      platforms: platformReports,
      checkedAt: new Date().toISOString(),
    };
  }
}
