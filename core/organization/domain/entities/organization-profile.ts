import type { OrganizationId, OrganizationProfileId } from "../../shared";

export type OrganizationProfileProps = {
  id: OrganizationProfileId;
  organizationId: OrganizationId;
  description: string;
  website?: string;
  logoUrl?: string;
  address: string;
  city: string;
  tags: string[];
};

export class OrganizationProfile {
  readonly id: OrganizationProfileId;
  readonly organizationId: OrganizationId;
  readonly description: string;
  readonly website?: string;
  readonly logoUrl?: string;
  readonly address: string;
  readonly city: string;
  readonly tags: string[];

  private constructor(props: OrganizationProfileProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.description = props.description;
    this.website = props.website;
    this.logoUrl = props.logoUrl;
    this.address = props.address;
    this.city = props.city;
    this.tags = [...props.tags];
  }

  static create(
    props: Omit<OrganizationProfileProps, "id"> & { id?: OrganizationProfileId },
  ): OrganizationProfile {
    return new OrganizationProfile({
      id: props.id ?? `org-profile-${Date.now()}`,
      organizationId: props.organizationId,
      description: props.description.trim(),
      website: props.website,
      logoUrl: props.logoUrl,
      address: props.address.trim(),
      city: props.city.trim(),
      tags: props.tags,
    });
  }

  toJSON(): OrganizationProfileProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      description: this.description,
      website: this.website,
      logoUrl: this.logoUrl,
      address: this.address,
      city: this.city,
      tags: [...this.tags],
    };
  }
}
