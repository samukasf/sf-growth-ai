import { Calendar } from "../../domain";
import type { CreateCalendarDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";

export class CreateCalendarUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async execute(dto: CreateCalendarDto) {
    const calendar = Calendar.create({
      organizationId: dto.organizationId,
      name: dto.name,
      description: dto.description,
      provider: dto.provider,
      timezone: dto.timezone,
      ownerId: dto.ownerId,
      isDefault: dto.isDefault,
    });

    await this.deps.schedulingRepository.saveCalendar(calendar);
    return calendar;
  }
}
