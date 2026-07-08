import { AgencyGoal, createGoalCreatedEvent } from "../../domain";
import type { CreateGoalDto } from "../dto";
import type { AgencyCoreDependencies } from "../dependencies";

export class CreateGoalUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: CreateGoalDto) {
    const goal = AgencyGoal.create({
      organizationId: dto.organizationId,
      agencyId: dto.agencyId,
      title: dto.title,
      targetValue: dto.targetValue,
      dueDate: dto.dueDate,
    });

    await this.deps.repository.saveGoal(goal);
    await this.deps.eventDispatcher.publish(createGoalCreatedEvent(goal));

    return { goal };
  }
}
