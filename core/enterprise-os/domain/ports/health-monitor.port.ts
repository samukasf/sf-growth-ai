import type { EnterprisePlatform } from "../entities";
import type { HealthScore } from "../../shared";

export type PlatformHealthReport = {
  platformId: string;
  platformName: string;
  score: HealthScore;
  checkedAt: string;
};

export type EcosystemHealthReport = {
  organizationId: string;
  overallScore: number;
  platforms: PlatformHealthReport[];
  checkedAt: string;
};

export interface HealthMonitor {
  checkPlatform(platform: EnterprisePlatform): PlatformHealthReport;
  checkEcosystem(platforms: EnterprisePlatform[], organizationId: string): EcosystemHealthReport;
}
