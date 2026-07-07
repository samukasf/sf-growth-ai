import { CompanyProfile, type BuildProfileInput, type BusinessProfiler } from "../../domain";
import { clampScore } from "../../shared";

const SECTION_KEYS = ["identity", "products", "customers", "operations", "finance", "commercial", "technology"] as const;

export class DefaultBusinessProfiler implements BusinessProfiler {
  async build(input: BuildProfileInput): Promise<CompanyProfile> {
    const now = new Date().toISOString();
    let profile =
      input.existingProfile ??
      CompanyProfile.create({
        organizationId: input.organizationId,
        companyId: input.companyId,
        name: input.companyName,
      });

    for (const key of SECTION_KEYS) {
      const sectionFindings = input.findings.filter((f) => f.category === key || f.key.startsWith(key));
      if (sectionFindings.length === 0) continue;

      const data: Record<string, unknown> = {};
      for (const f of sectionFindings) {
        data[f.key] = f.value;
      }

      const confidence = Math.round(
        sectionFindings.reduce((sum, f) => sum + f.confidence, 0) / sectionFindings.length,
      );

      profile = profile.withSection({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data,
        confidence,
        lastUpdatedAt: now,
      });
    }

    const completeness = clampScore(
      (profile.sections.length / SECTION_KEYS.length) * 100,
    );

    return profile.withCompleteness(completeness);
  }
}
