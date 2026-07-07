import type { CompanyId, CompanyProfileId, OrganizationId } from "../../shared";

export type CompanyProfileSection = {
  key: string;
  label: string;
  data: Record<string, unknown>;
  confidence: number;
  lastUpdatedAt: string;
};

export type CompanyProfileProps = {
  id: CompanyProfileId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  name: string;
  industry?: string;
  description?: string;
  sections: CompanyProfileSection[];
  completenessScore: number;
  lastDiscoverySessionId?: string;
  createdAt: string;
  updatedAt: string;
};

export class CompanyProfile {
  readonly id: CompanyProfileId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly industry?: string;
  readonly description?: string;
  readonly sections: CompanyProfileSection[];
  readonly completenessScore: number;
  readonly lastDiscoverySessionId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: CompanyProfileProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.industry = props.industry;
    this.description = props.description;
    this.sections = props.sections.map((s) => ({ ...s, data: { ...s.data } }));
    this.completenessScore = props.completenessScore;
    this.lastDiscoverySessionId = props.lastDiscoverySessionId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CompanyProfileProps, "id" | "createdAt" | "updatedAt" | "sections" | "completenessScore"> & {
      id?: CompanyProfileId;
      sections?: CompanyProfileSection[];
      completenessScore?: number;
      createdAt?: string;
      updatedAt?: string;
    },
  ): CompanyProfile {
    if (!props.name.trim()) throw new Error("name is required");
    const now = new Date().toISOString();
    return new CompanyProfile({
      id: props.id ?? `cprof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      name: props.name,
      industry: props.industry,
      description: props.description,
      sections: props.sections ?? [],
      completenessScore: props.completenessScore ?? 0,
      lastDiscoverySessionId: props.lastDiscoverySessionId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withSection(section: CompanyProfileSection): CompanyProfile {
    const sections = this.sections.filter((s) => s.key !== section.key);
    sections.push(section);
    return CompanyProfile.create({
      ...this.toJSON(),
      sections,
      updatedAt: new Date().toISOString(),
    });
  }

  withCompleteness(score: number, sessionId?: string): CompanyProfile {
    return CompanyProfile.create({
      ...this.toJSON(),
      completenessScore: score,
      lastDiscoverySessionId: sessionId ?? this.lastDiscoverySessionId,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): CompanyProfileProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      name: this.name,
      industry: this.industry,
      description: this.description,
      sections: this.sections.map((s) => ({ ...s, data: { ...s.data } })),
      completenessScore: this.completenessScore,
      lastDiscoverySessionId: this.lastDiscoverySessionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
