import { createConflictDetectedEvent } from "../../domain";
import type { CreateReservationDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class CreateReservationUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: CreateReservationDto) {
    const resource = await this.deps.schedulingRepository.findResourceById(dto.resourceId);
    if (!resource) throw new Error(`Resource not found: ${dto.resourceId}`);

    const existing = await this.deps.schedulingRepository.findReservationsByResource(
      dto.resourceId,
    );

    const result = this.deps.reservationManager.create(
      resource,
      {
        title: dto.title,
        reservedBy: dto.reservedBy,
        startAt: dto.startAt,
        endAt: dto.endAt,
        organizationId: dto.organizationId,
      },
      existing,
    );

    if (!result.success || !result.reservation) {
      await this.deps.eventDispatcher.publish(
        createConflictDetectedEvent({
          organizationId: dto.organizationId,
          entityId: dto.resourceId,
          entityType: "reservation",
          conflictingIds: existing.map((r) => r.id),
          message: result.message,
        }),
      );
      return { created: false, message: result.message };
    }

    await this.deps.schedulingRepository.saveReservation(result.reservation);
    return { created: true, reservation: result.reservation };
  }
}
