import { AppointmentNotFoundError } from "../../shared";
import { createReminderSentEvent } from "../../domain";
import type { SendRemindersDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class SendRemindersUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: SendRemindersDto) {
    const appointment = await this.deps.schedulingRepository.findAppointmentById(
      dto.appointmentId,
    );
    if (!appointment) throw new AppointmentNotFoundError(dto.appointmentId);

    const reminders = await this.deps.schedulingRepository.findRemindersByAppointment(
      dto.appointmentId,
    );
    const now = new Date();
    const sent = [];

    for (const reminder of reminders) {
      if (this.deps.reminderEngine.shouldSend(reminder, now)) {
        const updated = reminder.markSent();
        await this.deps.schedulingRepository.saveReminder(updated);
        await this.deps.eventDispatcher.publish(createReminderSentEvent(updated));
        sent.push(updated);
      }
    }

    return { appointment, sent };
  }
}
