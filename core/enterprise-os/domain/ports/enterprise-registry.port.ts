import type { OrganizationId } from "../../shared";
import type {
  BusinessCapability,
  BusinessContext,
  BusinessEvent,
  BusinessService,
  BusinessState,
  BusinessWorkflow,
  CapabilityRegistry,
  EnterprisePlatform,
  OperatingSession,
  PlatformRegistry,
} from "../entities";

export interface EnterpriseRegistry {
  savePlatform(platform: EnterprisePlatform): Promise<void>;
  findPlatformById(id: string): Promise<EnterprisePlatform | null>;
  findPlatformBySlug(slug: string): Promise<EnterprisePlatform | null>;
  findPlatformsByOrganization(organizationId: OrganizationId): Promise<EnterprisePlatform[]>;
  saveCapability(capability: BusinessCapability): Promise<void>;
  findCapabilityById(id: string): Promise<BusinessCapability | null>;
  findCapabilitiesByPlatform(platformId: string): Promise<BusinessCapability[]>;
  savePlatformRegistry(registry: PlatformRegistry): Promise<void>;
  findPlatformRegistry(organizationId: OrganizationId): Promise<PlatformRegistry | null>;
  saveCapabilityRegistry(registry: CapabilityRegistry): Promise<void>;
  findCapabilityRegistry(organizationId: OrganizationId): Promise<CapabilityRegistry | null>;
  saveService(service: BusinessService): Promise<void>;
  saveContext(context: BusinessContext): Promise<void>;
  findContextById(id: string): Promise<BusinessContext | null>;
  saveWorkflow(workflow: BusinessWorkflow): Promise<void>;
  findWorkflowById(id: string): Promise<BusinessWorkflow | null>;
  saveBusinessEvent(event: BusinessEvent): Promise<void>;
  saveState(state: BusinessState): Promise<void>;
  findState(entityType: string, entityId: string): Promise<BusinessState | null>;
  saveSession(session: OperatingSession): Promise<void>;
  findSessionById(id: string): Promise<OperatingSession | null>;
}
