import { ExecutiveWisdomNotFoundError } from "../../shared";
import { createPlaybookGeneratedEvent } from "../../domain";
import type { GeneratePlaybookDto } from "../dto";
import type { ExecutiveWisdomEngineDependencies } from "../dependencies";

export class GeneratePlaybookUseCase {
  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {}

  async execute(dto: GeneratePlaybookDto) {
    const wisdom = await this.deps.repository.findWisdomById(dto.wisdomId);
    if (!wisdom) {
      throw new ExecutiveWisdomNotFoundError(dto.wisdomId);
    }

    const playbook = this.deps.playbookGenerator.generate(wisdom);
    await this.deps.repository.savePlaybook(playbook);

    const event = createPlaybookGeneratedEvent(playbook);
    await this.deps.eventDispatcher.publish(event);

    return playbook;
  }
}
