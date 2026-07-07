import type { ContactId, OrganizationId } from "../../shared";

export type ContactEntityType = "lead" | "customer" | "supplier" | "partner";

export type ContactProps = {
  id: ContactId;
  organizationId: OrganizationId;
  entityId: string;
  entityType: ContactEntityType;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary: boolean;
  createdAt: string;
};

export class Contact {
  readonly id: ContactId;
  readonly organizationId: OrganizationId;
  readonly entityId: string;
  readonly entityType: ContactEntityType;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly role: string;
  readonly isPrimary: boolean;
  readonly createdAt: string;

  private constructor(props: ContactProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.entityId = props.entityId;
    this.entityType = props.entityType;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.role = props.role;
    this.isPrimary = props.isPrimary;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ContactProps, "id" | "createdAt"> & { id?: ContactId; createdAt?: string },
  ): Contact {
    return new Contact({
      id: props.id ?? `contact-${Date.now()}`,
      organizationId: props.organizationId,
      entityId: props.entityId,
      entityType: props.entityType,
      name: props.name.trim(),
      email: props.email.trim(),
      phone: props.phone,
      role: props.role.trim(),
      isPrimary: props.isPrimary,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ContactProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      entityId: this.entityId,
      entityType: this.entityType,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      isPrimary: this.isPrimary,
      createdAt: this.createdAt,
    };
  }
}
