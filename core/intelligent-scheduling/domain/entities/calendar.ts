import type { CalendarId, OrganizationId } from "../../shared";

export type CalendarProvider = "internal" | "google" | "outlook" | "apple" | "calendly";

export type CalendarProps = {
  id: CalendarId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  provider: CalendarProvider;
  timezone: string;
  ownerId: string;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export class Calendar {
  readonly id: CalendarId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly provider: CalendarProvider;
  readonly timezone: string;
  readonly ownerId: string;
  readonly isDefault: boolean;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: CalendarProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.provider = props.provider;
    this.timezone = props.timezone;
    this.ownerId = props.ownerId;
    this.isDefault = props.isDefault;
    this.active = props.active;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CalendarProps, "id" | "createdAt" | "updatedAt" | "active"> & {
      id?: CalendarId;
      createdAt?: string;
      updatedAt?: string;
      active?: boolean;
    },
  ): Calendar {
    const now = new Date().toISOString();
    return new Calendar({
      id: props.id ?? `cal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      provider: props.provider,
      timezone: props.timezone,
      ownerId: props.ownerId,
      isDefault: props.isDefault,
      active: props.active ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): CalendarProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      provider: this.provider,
      timezone: this.timezone,
      ownerId: this.ownerId,
      isDefault: this.isDefault,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
