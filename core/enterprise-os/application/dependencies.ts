import type { EventDispatcher } from "../shared";
import type {
  BusinessContextResolver,
  CapabilityResolver,
  EnterpriseEventBus,
  EnterpriseRegistry,
  HealthMonitor,
  OperatingSystemKernel,
  PlatformResolver,
  WorkflowCoordinator,
} from "../domain";

export type EnterpriseOsDependencies = {
  enterpriseRegistry: EnterpriseRegistry;
  capabilityResolver: CapabilityResolver;
  platformResolver: PlatformResolver;
  businessContextResolver: BusinessContextResolver;
  workflowCoordinator: WorkflowCoordinator;
  enterpriseEventBus: EnterpriseEventBus;
  operatingSystemKernel: OperatingSystemKernel;
  healthMonitor: HealthMonitor;
  eventDispatcher: EventDispatcher;
};
