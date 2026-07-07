import type { BusinessCapability } from "../entities";

export type CapabilityResolution = {
  capability: BusinessCapability;
  available: boolean;
  reason: string;
};

export interface CapabilityResolver {
  resolve(capabilityId: string, capabilities: BusinessCapability[]): CapabilityResolution | null;
  resolveBySlug(slug: string, capabilities: BusinessCapability[]): CapabilityResolution | null;
  resolveByDomain(domain: string, capabilities: BusinessCapability[]): BusinessCapability[];
}
