import type { EnterprisePlatform } from "../entities";

export type PlatformResolution = {
  platform: EnterprisePlatform;
  available: boolean;
  reason: string;
};

export interface PlatformResolver {
  resolve(platformId: string, platforms: EnterprisePlatform[]): PlatformResolution | null;
  resolveBySlug(slug: string, platforms: EnterprisePlatform[]): PlatformResolution | null;
  resolveByCategory(category: string, platforms: EnterprisePlatform[]): EnterprisePlatform[];
}
