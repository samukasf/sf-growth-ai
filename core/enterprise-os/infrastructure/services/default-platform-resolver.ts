import type { EnterprisePlatform, PlatformResolver } from "../../domain";

export class DefaultPlatformResolver implements PlatformResolver {
  resolve(platformId: string, platforms: EnterprisePlatform[]) {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform) return null;
    const available = platform.status === "active" || platform.status === "degraded";
    return {
      platform,
      available,
      reason: available ? "Platform available" : `Platform ${platform.status}`,
    };
  }

  resolveBySlug(slug: string, platforms: EnterprisePlatform[]) {
    const platform = platforms.find((p) => p.slug === slug);
    if (!platform) return null;
    const available = platform.status === "active" || platform.status === "degraded";
    return {
      platform,
      available,
      reason: available ? "Platform available" : `Platform ${platform.status}`,
    };
  }

  resolveByCategory(category: string, platforms: EnterprisePlatform[]) {
    return platforms.filter((p) => p.category === category);
  }
}
