import type { TenantRuntime } from "../../domain";
import type { MultiTenantDependencies } from "../dependencies";
import {
  ActivateTenantUseCase,
  ArchiveTenantUseCase,
  BuildTenantContextUseCase,
  ComputeTenantMetricsUseCase,
  CreateTenantUseCase,
  DeleteTenantUseCase,
  EvaluateTenantHealthUseCase,
  ListTenantsUseCase,
  ResolveTenantUseCase,
  SuspendTenantUseCase,
} from "../use-cases";

export class TenantRuntimeService implements TenantRuntime {
  private readonly createTenantUseCase: CreateTenantUseCase;
  private readonly activateTenantUseCase: ActivateTenantUseCase;
  private readonly suspendTenantUseCase: SuspendTenantUseCase;
  private readonly archiveTenantUseCase: ArchiveTenantUseCase;
  private readonly deleteTenantUseCase: DeleteTenantUseCase;
  private readonly resolveTenantUseCase: ResolveTenantUseCase;
  private readonly buildContextUseCase: BuildTenantContextUseCase;
  private readonly evaluateHealthUseCase: EvaluateTenantHealthUseCase;
  private readonly computeMetricsUseCase: ComputeTenantMetricsUseCase;
  private readonly listTenantsUseCase: ListTenantsUseCase;

  constructor(_deps: MultiTenantDependencies) {
    this.createTenantUseCase = new CreateTenantUseCase(_deps);
    this.activateTenantUseCase = new ActivateTenantUseCase(_deps);
    this.suspendTenantUseCase = new SuspendTenantUseCase(_deps);
    this.archiveTenantUseCase = new ArchiveTenantUseCase(_deps);
    this.deleteTenantUseCase = new DeleteTenantUseCase(_deps);
    this.resolveTenantUseCase = new ResolveTenantUseCase(_deps);
    this.buildContextUseCase = new BuildTenantContextUseCase(_deps);
    this.evaluateHealthUseCase = new EvaluateTenantHealthUseCase(_deps);
    this.computeMetricsUseCase = new ComputeTenantMetricsUseCase(_deps);
    this.listTenantsUseCase = new ListTenantsUseCase(_deps);
  }

  async createTenant(input: Parameters<TenantRuntime["createTenant"]>[0]) {
    const result = await this.createTenantUseCase.execute(input);
    return result.tenant;
  }

  async activateTenant(tenantId: string) {
    const result = await this.activateTenantUseCase.execute(tenantId);
    return result.tenant;
  }

  async suspendTenant(tenantId: string) {
    const result = await this.suspendTenantUseCase.execute(tenantId);
    return result.tenant;
  }

  async archiveTenant(tenantId: string) {
    const result = await this.archiveTenantUseCase.execute(tenantId);
    return result.tenant;
  }

  async deleteTenant(tenantId: string) {
    await this.deleteTenantUseCase.execute(tenantId);
  }

  async resolveTenant(tenantId: string) {
    const result = await this.resolveTenantUseCase.execute(tenantId);
    return result.tenant;
  }

  async buildContext(tenantId: string) {
    const result = await this.buildContextUseCase.execute(tenantId);
    return result.context;
  }

  async evaluateHealth(tenantId: string) {
    const result = await this.evaluateHealthUseCase.execute(tenantId);
    return result.health;
  }

  async computeMetrics(tenantId: string) {
    const result = await this.computeMetricsUseCase.execute(tenantId);
    return result.metrics;
  }

  async listTenants(agencyId: string) {
    const result = await this.listTenantsUseCase.execute(agencyId);
    return result.tenants;
  }
}
