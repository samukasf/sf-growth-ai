import type { OrganizationId } from "../../shared";
import type {
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
} from "../entities";

export interface SchedulingRepository {
  saveCalendar(calendar: Calendar): Promise<void>;
  findCalendarById(id: string): Promise<Calendar | null>;
  findCalendarsByOrganization(organizationId: OrganizationId): Promise<Calendar[]>;
  saveSchedule(schedule: Schedule): Promise<void>;
  findSchedulesByCalendar(calendarId: string): Promise<Schedule[]>;
  saveAppointment(appointment: Appointment): Promise<void>;
  findAppointmentById(id: string): Promise<Appointment | null>;
  findAppointmentsByCalendar(calendarId: string): Promise<Appointment[]>;
  findAppointmentsByOrganization(organizationId: OrganizationId): Promise<Appointment[]>;
  saveReservation(reservation: Reservation): Promise<void>;
  findReservationsByResource(resourceId: string): Promise<Reservation[]>;
  saveAvailability(availability: Availability): Promise<void>;
  findAvailabilityByEntity(entityId: string): Promise<Availability[]>;
  saveResource(resource: Resource): Promise<void>;
  findResourceById(id: string): Promise<Resource | null>;
  findResourcesByOrganization(organizationId: OrganizationId): Promise<Resource[]>;
  saveMeeting(meeting: Meeting): Promise<void>;
  saveService(service: Service): Promise<void>;
  findServicesByOrganization(organizationId: OrganizationId): Promise<Service[]>;
  saveEmployeeSchedule(schedule: EmployeeSchedule): Promise<void>;
  saveWorkingHours(hours: WorkingHours): Promise<void>;
  saveHoliday(holiday: Holiday): Promise<void>;
  findHolidaysByOrganization(organizationId: OrganizationId): Promise<Holiday[]>;
  saveReminder(reminder: AppointmentReminder): Promise<void>;
  findRemindersByAppointment(appointmentId: string): Promise<AppointmentReminder[]>;
  saveWaitingListEntry(entry: WaitingList): Promise<void>;
  findWaitingListById(id: string): Promise<WaitingList | null>;
  findWaitingListByService(serviceId: string): Promise<WaitingList[]>;
  saveRecurringSchedule(schedule: RecurringSchedule): Promise<void>;
}
