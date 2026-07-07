import type { EnterprisePlatformId, OrganizationId } from "../../shared";

export type PlatformStatus = "active" | "inactive" | "degraded" | "planned";
export type PlatformCategory =
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

export type EnterprisePlatformProps = {
  id: EnterprisePlatformId;
  organizationId: OrganizationId;
  name: string;
  slug: string;
  description: string;
  category: PlatformCategory;
  modulePath: string;
  status: PlatformStatus;
  version: string;
  healthScore: number;
  registeredAt: string;
  updatedAt: string;
};

export class EnterprisePlatform {
  readonly id: EnterprisePlatformId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly category: PlatformCategory;
  readonly modulePath: string;
  readonly status: PlatformStatus;
  readonly version: string;
  readonly healthScore: number;
  readonly registeredAt: string;
  readonly updatedAt: string;

  private constructor(props: EnterprisePlatformProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.category = props.category;
    this.modulePath = props.modulePath;
    this.status = props.status;
    this.version = props.version;
    this.healthScore = props.healthScore;
    this.registeredAt = props.registeredAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<EnterprisePlatformProps, "id" | "registeredAt" | "updatedAt" | "status" | "healthScore"> & {
      id?: EnterprisePlatformId;
      registeredAt?: string;
      updatedAt?: string;
      status?: PlatformStatus;
      healthScore?: number;
    },
  ): EnterprisePlatform {
    const now = new Date().toISOString();
    return new EnterprisePlatform({
      id: props.id ?? `platform-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      slug: props.slug.trim(),
      description: props.description.trim(),
      category: props.category,
      modulePath: props.modulePath,
      status: props.status ?? "active",
      version: props.version,
      healthScore: props.healthScore ?? 100,
      registeredAt: props.registeredAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  updateHealth(score: number): EnterprisePlatform {
    const status: PlatformStatus =
      score < 50 ? "degraded" : score < 80 ? "active" : "active";
    return EnterprisePlatform.create({
      ...this.toJSON(),
      healthScore: score,
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): EnterprisePlatformProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      slug: this.slug,
      description: this.description,
      category: this.category,
      modulePath: this.modulePath,
      status: this.status,
      version: this.version,
      healthScore: this.healthScore,
      registeredAt: this.registeredAt,
      updatedAt: this.updatedAt,
    };
  }
}
