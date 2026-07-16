import type { LinkedInClientConfig } from "./linkedin.types";

export function resolveLinkedInOrganizationId(companyId?: string): string {
  const mapJson = process.env.LINKEDIN_ORG_MAP;
  if (companyId && mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[companyId]) return map[companyId];
    } catch {
      // ignore invalid JSON
    }
  }

  return process.env.LINKEDIN_ORG_ID ?? "";
}

export function resolveLinkedInClientConfig(
  overrides?: Partial<LinkedInClientConfig>,
  companyId?: string,
): LinkedInClientConfig | null {
  const accessToken = overrides?.accessToken ?? process.env.LINKEDIN_ACCESS_TOKEN ?? "";
  const organizationId =
    overrides?.organizationId ?? resolveLinkedInOrganizationId(companyId);

  if (!accessToken || !organizationId) {
    return null;
  }

  return { accessToken, organizationId };
}

export function isLinkedInConfigured(companyId?: string): boolean {
  return resolveLinkedInClientConfig(undefined, companyId) !== null;
}
