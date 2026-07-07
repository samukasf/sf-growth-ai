import { AppointmentNotFoundError } from "../../shared";
import { createAppointmentCompletedEvent } from "../../domain";
import type { CompleteAppointmentDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class CompleteAppointmentUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: CompleteAppointmentDto) {
    const appointment = await this.deps.schedulingRepository.findAppointmentById(
      dto.appointmentId,
    );
    if (!appointment) throw new AppointmentNotFoundError(dto.appointmentId);

    const completed = appointment.complete();
    await this.deps.schedulingRepository.saveAppointment(completed);
    await this.deps.eventDispatcher.publish(createAppointmentCompletedEvent(completed));

    return completed;
  }
}
