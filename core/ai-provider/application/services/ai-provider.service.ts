import type {
  CheckProviderHealthDto,
  ExecuteAIRequestDto,
  SwitchProviderDto,
} from "../dto";
import type { AIProviderDependencies } from "../dependencies";
import {
  CheckProviderHealthUseCase,
  ExecuteAIRequestUseCase,
  SwitchProviderUseCase,
} from "../use-cases";

export class AIProviderService {
  private readonly activeProviderByOrg = new Map<string, string>();
  private readonly executeAIRequestUseCase: ExecuteAIRequestUseCase;
  private readonly switchProviderUseCase: SwitchProviderUseCase;
  private readonly checkProviderHealthUseCase: CheckProviderHealthUseCase;

  constructor(private readonly deps: AIProviderDependencies) {
    this.executeAIRequestUseCase = new ExecuteAIRequestUseCase(
      deps,
      this.activeProviderByOrg,
    );
    this.switchProviderUseCase = new SwitchProviderUseCase(deps, this.activeProviderByOrg);
    this.checkProviderHealthUseCase = new CheckProviderHealthUseCase(deps);
  }

  executeRequest(dto: ExecuteAIRequestDto) {
    return this.executeAIRequestUseCase.execute(dto);
  }

  switchProvider(dto: SwitchProviderDto) {
    return this.switchProviderUseCase.execute(dto);
  }

  checkHealth(dto: CheckProviderHealthDto) {
    return this.checkProviderHealthUseCase.execute(dto);
  }

  listProviders() {
    return this.deps.registry.getAll();
  }

  listAvailableProviders() {
    return this.deps.registry.getAvailable();
  }

  getActiveProviderId(organizationId: string) {
    return this.activeProviderByOrg.get(organizationId) ?? null;
  }

  async getUsage(providerId: string, organizationId: string) {
    return this.deps.registry.findUsageByProvider(providerId, organizationId);
  }

  async getMetrics(providerId: string) {
    return this.deps.registry.findMetricsByProvider(providerId);
  }
}
