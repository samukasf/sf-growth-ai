import { AppointmentNotFoundError } from "../../shared";
import { createAppointmentCancelledEvent } from "../../domain";
import type { CancelAppointmentDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class CancelAppointmentUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: CancelAppointmentDto) {
    const appointment = await this.deps.schedulingRepository.findAppointmentById(
      dto.appointmentId,
    );
    if (!appointment) throw new AppointmentNotFoundError(dto.appointmentId);

    const cancelled = appointment.cancel();
    await this.deps.schedulingRepository.saveAppointment(cancelled);
    await this.deps.eventDispatcher.publish(
      createAppointmentCancelledEvent(cancelled, dto.reason),
    );

    return cancelled;
  }
}
