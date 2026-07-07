import {
  Appointment,
  AppointmentReminder,
  Availability,
  Calendar,
  EmployeeSchedule,
  Holiday,
  Meeting,
  RecurringSchedule,
  Reservation,
  Resource,
  Schedule,
  Service,
  WaitingList,
  WorkingHours,
  type SchedulingRepository,
} from "../../domain";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

function deserializeCalendar(raw: string): Calendar {
  return Calendar.create(JSON.parse(raw) as ReturnType<Calendar["toJSON"]>);
}

function deserializeAppointment(raw: string): Appointment {
  return Appointment.create(JSON.parse(raw) as ReturnType<Appointment["toJSON"]>);
}

function deserializeResource(raw: string): Resource {
  return Resource.create(JSON.parse(raw) as ReturnType<Resource["toJSON"]>);
}

export class InMemorySchedulingRepository implements SchedulingRepository {
  private readonly calendars = new Map<string, string>();
  private readonly schedules: Schedule[] = [];
  private readonly appointments = new Map<string, string>();
  private readonly reservations: Reservation[] = [];
  private readonly availabilities: Availability[] = [];
  private readonly resources = new Map<string, string>();
  private readonly meetings: Meeting[] = [];
  private readonly services: Service[] = [];
  private readonly employeeSchedules: EmployeeSchedule[] = [];
  private readonly workingHours: WorkingHours[] = [];
  private readonly holidays: Holiday[] = [];
  private readonly reminders: AppointmentReminder[] = [];
  private readonly waitingList: WaitingList[] = [];
  private readonly recurringSchedules: RecurringSchedule[] = [];

  async saveCalendar(calendar: Calendar): Promise<void> {
    this.calendars.set(calendar.id, serialize(calendar.toJSON()));
  }

  async findCalendarById(id: string): Promise<Calendar | null> {
    const raw = this.calendars.get(id);
    return raw ? deserializeCalendar(raw) : null;
  }

  async findCalendarsByOrganization(organizationId: string): Promise<Calendar[]> {
    const results: Calendar[] = [];
    for (const raw of this.calendars.values()) {
      const calendar = deserializeCalendar(raw);
      if (calendar.organizationId === organizationId) results.push(calendar);
    }
    return results;
  }

  async saveSchedule(schedule: Schedule): Promise<void> {
    this.schedules.push(schedule);
  }

  async findSchedulesByCalendar(calendarId: string): Promise<Schedule[]> {
    return this.schedules.filter((s) => s.calendarId === calendarId);
  }

  async saveAppointment(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.id, serialize(appointment.toJSON()));
  }

  async findAppointmentById(id: string): Promise<Appointment | null> {
    const raw = this.appointments.get(id);
    return raw ? deserializeAppointment(raw) : null;
  }

  async findAppointmentsByCalendar(calendarId: string): Promise<Appointment[]> {
    const results: Appointment[] = [];
    for (const raw of this.appointments.values()) {
      const appointment = deserializeAppointment(raw);
      if (appointment.calendarId === calendarId) results.push(appointment);
    }
    return results;
  }

  async findAppointmentsByOrganization(organizationId: string): Promise<Appointment[]> {
    const results: Appointment[] = [];
    for (const raw of this.appointments.values()) {
      const appointment = deserializeAppointment(raw);
      if (appointment.organizationId === organizationId) results.push(appointment);
    }
    return results;
  }

  async saveReservation(reservation: Reservation): Promise<void> {
    this.reservations.push(reservation);
  }

  async findReservationsByResource(resourceId: string): Promise<Reservation[]> {
    return this.reservations.filter((r) => r.resourceId === resourceId);
  }

  async saveAvailability(availability: Availability): Promise<void> {
    this.availabilities.push(availability);
  }

  async findAvailabilityByEntity(entityId: string): Promise<Availability[]> {
    return this.availabilities.filter((a) => a.entityId === entityId);
  }

  async saveResource(resource: Resource): Promise<void> {
    this.resources.set(resource.id, serialize(resource.toJSON()));
  }

  async findResourceById(id: string): Promise<Resource | null> {
    const raw = this.resources.get(id);
    return raw ? deserializeResource(raw) : null;
  }

  async findResourcesByOrganization(organizationId: string): Promise<Resource[]> {
    const results: Resource[] = [];
    for (const raw of this.resources.values()) {
      const resource = deserializeResource(raw);
      if (resource.organizationId === organizationId) results.push(resource);
    }
    return results;
  }

  async saveMeeting(meeting: Meeting): Promise<void> {
    this.meetings.push(meeting);
  }

  async saveService(service: Service): Promise<void> {
    this.services.push(service);
  }

  async findServicesByOrganization(organizationId: string): Promise<Service[]> {
    return this.services.filter((s) => s.organizationId === organizationId);
  }

  async saveEmployeeSchedule(schedule: EmployeeSchedule): Promise<void> {
    this.employeeSchedules.push(schedule);
  }

  async saveWorkingHours(hours: WorkingHours): Promise<void> {
    this.workingHours.push(hours);
  }

  async saveHoliday(holiday: Holiday): Promise<void> {
    this.holidays.push(holiday);
  }

  async findHolidaysByOrganization(organizationId: string): Promise<Holiday[]> {
    return this.holidays.filter((h) => h.organizationId === organizationId);
  }

  async saveReminder(reminder: AppointmentReminder): Promise<void> {
    this.reminders.push(reminder);
  }

  async findRemindersByAppointment(appointmentId: string): Promise<AppointmentReminder[]> {
    return this.reminders.filter((r) => r.appointmentId === appointmentId);
  }

  async saveWaitingListEntry(entry: WaitingList): Promise<void> {
    this.waitingList.push(entry);
  }

  async findWaitingListById(id: string): Promise<WaitingList | null> {
    return this.waitingList.find((e) => e.id === id) ?? null;
  }

  async findWaitingListByService(serviceId: string): Promise<WaitingList[]> {
    return this.waitingList.filter((e) => e.serviceId === serviceId);
  }

  async saveRecurringSchedule(schedule: RecurringSchedule): Promise<void> {
    this.recurringSchedules.push(schedule);
  }
}
