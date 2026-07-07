import type { JoinWaitingListDto, PromoteWaitingListDto } from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";
import { WaitingList, createWaitingListPromotedEvent } from "../../domain";

export class WaitingListUseCase {
  constructor(private readonly deps: IntelligentSchedulingDependencies) {}

  async join(dto: JoinWaitingListDto) {
    const queue = await this.deps.schedulingRepository.findWaitingListByService(dto.serviceId);
    const position = queue.filter((e) => e.status === "waiting").length + 1;

    const entry = WaitingList.create({
      organizationId: dto.organizationId,
      serviceId: dto.serviceId,
      customerId: dto.customerId,
      preferredDate: dto.preferredDate,
      position,
    });

    await this.deps.schedulingRepository.saveWaitingListEntry(entry);
    return entry;
  }

  async promote(dto: PromoteWaitingListDto) {
    const entry = await this.deps.schedulingRepository.findWaitingListById(dto.waitingListId);
    if (!entry) throw new Error(`Waiting list entry not found: ${dto.waitingListId}`);

    const promoted = entry.promote();
    await this.deps.schedulingRepository.saveWaitingListEntry(promoted);
    await this.deps.eventDispatcher.publish(createWaitingListPromotedEvent(promoted));
    return promoted;
  }
}
