import { CalendarNotFoundError } from "../../shared";
import {
  Appointment,
  createAppointmentCreatedEvent,
  createConflictDetectedEvent,
  createResourceAllocatedEvent,
} from "../../domain";
import type { CreateAppointmentDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class CreateAppointmentUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: CreateAppointmentDto) {
    const calendar = await this.deps.schedulingRepository.findCalendarById(dto.calendarId);
    if (!calendar) throw new CalendarNotFoundError(dto.calendarId);

    const appointment = Appointment.create({
      organizationId: dto.organizationId,
      calendarId: dto.calendarId,
      serviceId: dto.serviceId,
      resourceId: dto.resourceId,
      title: dto.title,
      description: dto.description,
      customerId: dto.customerId,
      employeeId: dto.employeeId,
      startAt: dto.startAt,
      endAt: dto.endAt,
      autoConfirm: dto.autoConfirm ?? false,
      autoCheckIn: dto.autoCheckIn ?? false,
    });

    const existing = await this.deps.schedulingRepository.findAppointmentsByCalendar(
      dto.calendarId,
    );
    const conflict = this.deps.conflictDetector.detectAppointmentConflicts(
      appointment,
      existing,
    );

    if (conflict.hasConflict) {
      await this.deps.eventDispatcher.publish(
        createConflictDetectedEvent({
          organizationId: dto.organizationId,
          entityId: appointment.id,
          entityType: "appointment",
          conflictingIds: conflict.conflictingIds,
          message: conflict.message,
        }),
      );
      return { created: false, conflict };
    }

    if (dto.resourceId) {
      const resource = await this.deps.schedulingRepository.findResourceById(dto.resourceId);
      const resources = resource ? [resource] : [];
      const allocation = this.deps.resourceAllocator.allocate(
        appointment,
        resources,
        existing,
      );

      if (allocation.allocated && allocation.resourceId) {
        await this.deps.eventDispatcher.publish(
          createResourceAllocatedEvent({
            organizationId: dto.organizationId,
            resourceId: allocation.resourceId,
            appointmentId: appointment.id,
            startAt: appointment.startAt,
            endAt: appointment.endAt,
          }),
        );
      }
    }

    const final = dto.autoConfirm ? appointment.confirm() : appointment;
    await this.deps.schedulingRepository.saveAppointment(final);
    await this.deps.eventDispatcher.publish(createAppointmentCreatedEvent(final));

    const reminders = this.deps.reminderEngine.plan(final, [60, 1440]);
    for (const plan of reminders) {
      await this.deps.schedulingRepository.saveReminder(plan.reminder);
    }

    return { created: true, appointment: final, reminders };
  }
}
