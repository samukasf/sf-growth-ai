import type { BusinessCapabilityId, OrganizationId } from "../../shared";

export type CapabilityDomain =
  | "communication"
  | "automation"
  | "crm"
  | "scheduling"
  | "commerce"
  | "orchestration"
  | "intelligence"
  | "finance"
  | "hr"
  | "marketing"
  | "sales"
  | "legal"
  | "analytics"
  | "factory"
  | "marketplace";

export type BusinessCapabilityProps = {
  id: BusinessCapabilityId;
  organizationId: OrganizationId;
  name: string;
  slug: string;
  description: string;
  domain: CapabilityDomain;
  platformId: string;
  maturityLevel: number;
  active: boolean;
  createdAt: string;
};

export class BusinessCapability {
  readonly id: BusinessCapabilityId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly domain: CapabilityDomain;
  readonly platformId: string;
  readonly maturityLevel: number;
  readonly active: boolean;
  readonly createdAt: string;

  private constructor(props: BusinessCapabilityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.domain = props.domain;
    this.platformId = props.platformId;
    this.maturityLevel = props.maturityLevel;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<BusinessCapabilityProps, "id" | "createdAt" | "maturityLevel" | "active"> & {
      id?: BusinessCapabilityId;
      createdAt?: string;
      maturityLevel?: number;
      active?: boolean;
    },
  ): BusinessCapability {
    return new BusinessCapability({
      id: props.id ?? `capability-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      slug: props.slug.trim(),
      description: props.description.trim(),
      domain: props.domain,
      platformId: props.platformId,
      maturityLevel: props.maturityLevel ?? 1,
      active: props.active ?? true,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): BusinessCapabilityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      slug: this.slug,
      description: this.description,
      domain: this.domain,
      platformId: this.platformId,
      maturityLevel: this.maturityLevel,
      active: this.active,
      createdAt: this.createdAt,
    };
  }
}
