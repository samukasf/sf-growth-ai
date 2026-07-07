import { AppointmentNotFoundError } from "../../shared";
import { createAppointmentConfirmedEvent } from "../../domain";
import type { ConfirmAppointmentDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class ConfirmAppointmentUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: ConfirmAppointmentDto) {
    const appointment = await this.deps.schedulingRepository.findAppointmentById(
      dto.appointmentId,
    );
    if (!appointment) throw new AppointmentNotFoundError(dto.appointmentId);

    const confirmed = appointment.confirm();
    await this.deps.schedulingRepository.saveAppointment(confirmed);
    await this.deps.eventDispatcher.publish(createAppointmentConfirmedEvent(confirmed));

    return confirmed;
  }
}
