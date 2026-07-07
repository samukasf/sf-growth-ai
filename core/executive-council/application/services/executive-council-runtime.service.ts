import type { ProcessCouncilInput, ProcessCouncilResult, ExecutiveCouncilRuntime } from "../../domain";
import type { ExecutiveCouncilDependencies } from "../dependencies";
import { ProcessCouncilSessionUseCase } from "../use-cases";

export class ExecutiveCouncilRuntimeService implements ExecutiveCouncilRuntime {
  private readonly processUseCase: ProcessCouncilSessionUseCase;

  constructor(private readonly deps: ExecutiveCouncilDependencies) {
    this.processUseCase = new ProcessCouncilSessionUseCase(deps);
  }

  process(input: ProcessCouncilInput): Promise<ProcessCouncilResult> {
    return this.processUseCase.execute(input);
  }
}
