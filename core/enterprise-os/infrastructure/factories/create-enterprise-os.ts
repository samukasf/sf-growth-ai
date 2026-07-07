import type { EnterpriseOsDependencies } from "../../application";
import { EnterpriseOsService } from "../../application";
import { createDefaultPlatforms } from "../constants/default-platforms";
import { InMemoryEnterpriseEventBus } from "../events/in-memory-enterprise-event-bus";
import { InMemoryEnterpriseRegistry } from "../persistence/in-memory-enterprise-registry";
import { DefaultBusinessContextResolver } from "../services/default-business-context-resolver";
import { DefaultCapabilityResolver } from "../services/default-capability-resolver";
import { DefaultHealthMonitor } from "../services/default-health-monitor";
import { DefaultOperatingSystemKernel } from "../services/default-operating-system-kernel";
import { DefaultPlatformResolver } from "../services/default-platform-resolver";
import { DefaultWorkflowCoordinator } from "../services/default-workflow-coordinator";

export type CreateEnterpriseOsOptions = {
  organizationId?: string;
  dependencies?: Partial<EnterpriseOsDependencies>;
};

export async function createEnterpriseOs(
  options: CreateEnterpriseOsOptions = {},
): Promise<EnterpriseOsService> {
  const organizationId = options.organizationId ?? "default-org";
  const enterpriseRegistry =
    options.dependencies?.enterpriseRegistry ?? new InMemoryEnterpriseRegistry();
  const operatingSystemKernel =
    options.dependencies?.operatingSystemKernel ?? new DefaultOperatingSystemKernel();

  if ((await enterpriseRegistry.findPlatformsByOrganization(organizationId)).length === 0) {
    const platforms = createDefaultPlatforms(organizationId);
    for (const platform of platforms) {
      await enterpriseRegistry.savePlatform(platform);
    }
    operatingSystemKernel.boot(platforms);
  }

  const enterpriseEventBus =
    options.dependencies?.enterpriseEventBus ?? new InMemoryEnterpriseEventBus();

  const dependencies: EnterpriseOsDependencies = {
    enterpriseRegistry,
    capabilityResolver:
      options.dependencies?.capabilityResolver ?? new DefaultCapabilityResolver(),
    platformResolver: options.dependencies?.platformResolver ?? new DefaultPlatformResolver(),
    businessContextResolver:
      options.dependencies?.businessContextResolver ?? new DefaultBusinessContextResolver(),
    workflowCoordinator:
      options.dependencies?.workflowCoordinator ?? new DefaultWorkflowCoordinator(),
    enterpriseEventBus,
    operatingSystemKernel,
    healthMonitor: options.dependencies?.healthMonitor ?? new DefaultHealthMonitor(),
    eventDispatcher: enterpriseEventBus,
  };

  await operatingSystemKernel.initialize(organizationId);

  return new EnterpriseOsService(dependencies);
}
