import type { HolidayId, OrganizationId } from "../../shared";

export type HolidayProps = {
  id: HolidayId;
  organizationId: OrganizationId;
  name: string;
  date: string;
  recurring: boolean;
  appliesTo: "organization" | "calendar" | "employee";
  entityId?: string;
};

export class Holiday {
  readonly id: HolidayId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly date: string;
  readonly recurring: boolean;
  readonly appliesTo: "organization" | "calendar" | "employee";
  readonly entityId?: string;

  private constructor(props: HolidayProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.date = props.date;
    this.recurring = props.recurring;
    this.appliesTo = props.appliesTo;
    this.entityId = props.entityId;
  }

  static create(
    props: Omit<HolidayProps, "id"> & { id?: HolidayId },
  ): Holiday {
    return new Holiday({
      id: props.id ?? `holiday-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      date: props.date,
      recurring: props.recurring,
      appliesTo: props.appliesTo,
      entityId: props.entityId,
    });
  }

  toJSON(): HolidayProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      date: this.date,
      recurring: this.recurring,
      appliesTo: this.appliesTo,
      entityId: this.entityId,
    };
  }
}
