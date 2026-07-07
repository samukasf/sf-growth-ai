import type {
  EnterpriseBrainContext,
  EnterpriseBrainSnapshot,
} from "../../../enterprise-brain-runtime";
import type {
  EnterpriseBrainRuntimePort,
  OrchestratorBrainContext,
  OrchestratorBrainSnapshot,
} from "../../application/ports/integration/enterprise-brain-runtime.port";
import { createEnterpriseBrainRuntime } from "../../../enterprise-brain-runtime";

function mapSnapshot(snapshot: EnterpriseBrainSnapshot): OrchestratorBrainSnapshot {
  return snapshot.toJSON();
}

function mapContext(context: EnterpriseBrainContext): OrchestratorBrainContext {
  return context.toJSON();
}

export class DefaultEnterpriseBrainRuntimeAdapter implements EnterpriseBrainRuntimePort {
  private readonly runtime = createEnterpriseBrainRuntime();

  async buildSnapshot(organizationId: string, companyId: string) {
    const snapshot = await this.runtime.buildSnapshot(organizationId, companyId);
    return mapSnapshot(snapshot);
  }

  async buildContext(organizationId: string, companyId: string) {
    const context = await this.runtime.buildContext(organizationId, companyId);
    return mapContext(context);
  }
}
