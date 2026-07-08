import { AgencyDepartment, createDepartmentCreatedEvent } from "../../domain";
import type { CreateDepartmentDto } from "../dto";
import type { AgencyCoreDependencies } from "../dependencies";

export class CreateDepartmentUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: CreateDepartmentDto) {
    const department = AgencyDepartment.create({
      organizationId: dto.organizationId,
      agencyId: dto.agencyId,
      name: dto.name,
      code: dto.code,
    });

    await this.deps.repository.saveDepartment(department);
    await this.deps.eventDispatcher.publish(createDepartmentCreatedEvent(department));

    return { department };
  }
}
