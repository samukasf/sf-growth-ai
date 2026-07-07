import {
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
  type EnterpriseRegistry,
} from "../../domain";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

function deserializePlatform(raw: string): EnterprisePlatform {
  return EnterprisePlatform.create(
    JSON.parse(raw) as ReturnType<EnterprisePlatform["toJSON"]>,
  );
}

export class InMemoryEnterpriseRegistry implements EnterpriseRegistry {
  private readonly platforms = new Map<string, string>();
  private readonly capabilities: BusinessCapability[] = [];
  private readonly platformRegistries = new Map<string, string>();
  private readonly capabilityRegistries = new Map<string, string>();
  private readonly services: BusinessService[] = [];
  private readonly contexts = new Map<string, string>();
  private readonly workflows = new Map<string, string>();
  private readonly businessEvents: BusinessEvent[] = [];
  private readonly states = new Map<string, string>();
  private readonly sessions = new Map<string, string>();

  async savePlatform(platform: EnterprisePlatform): Promise<void> {
    this.platforms.set(platform.id, serialize(platform.toJSON()));
  }

  async findPlatformById(id: string): Promise<EnterprisePlatform | null> {
    const raw = this.platforms.get(id);
    return raw ? deserializePlatform(raw) : null;
  }

  async findPlatformBySlug(slug: string): Promise<EnterprisePlatform | null> {
    for (const raw of this.platforms.values()) {
      const platform = deserializePlatform(raw);
      if (platform.slug === slug) return platform;
    }
    return null;
  }

  async findPlatformsByOrganization(organizationId: string): Promise<EnterprisePlatform[]> {
    const results: EnterprisePlatform[] = [];
    for (const raw of this.platforms.values()) {
      const platform = deserializePlatform(raw);
      if (platform.organizationId === organizationId) results.push(platform);
    }
    return results;
  }

  async saveCapability(capability: BusinessCapability): Promise<void> {
    this.capabilities.push(capability);
  }

  async findCapabilityById(id: string): Promise<BusinessCapability | null> {
    return this.capabilities.find((c) => c.id === id) ?? null;
  }

  async findCapabilitiesByPlatform(platformId: string): Promise<BusinessCapability[]> {
    return this.capabilities.filter((c) => c.platformId === platformId);
  }

  async savePlatformRegistry(registry: PlatformRegistry): Promise<void> {
    this.platformRegistries.set(registry.organizationId, serialize(registry.toJSON()));
  }

  async findPlatformRegistry(organizationId: string): Promise<PlatformRegistry | null> {
    const raw = this.platformRegistries.get(organizationId);
    return raw
      ? PlatformRegistry.create(JSON.parse(raw) as ReturnType<PlatformRegistry["toJSON"]>)
      : null;
  }

  async saveCapabilityRegistry(registry: CapabilityRegistry): Promise<void> {
    this.capabilityRegistries.set(registry.organizationId, serialize(registry.toJSON()));
  }

  async findCapabilityRegistry(organizationId: string): Promise<CapabilityRegistry | null> {
    const raw = this.capabilityRegistries.get(organizationId);
    return raw
      ? CapabilityRegistry.create(JSON.parse(raw) as ReturnType<CapabilityRegistry["toJSON"]>)
      : null;
  }

  async saveService(service: BusinessService): Promise<void> {
    this.services.push(service);
  }

  async saveContext(context: BusinessContext): Promise<void> {
    this.contexts.set(context.id, serialize(context.toJSON()));
  }

  async findContextById(id: string): Promise<BusinessContext | null> {
    const raw = this.contexts.get(id);
    return raw
      ? BusinessContext.create(JSON.parse(raw) as ReturnType<BusinessContext["toJSON"]>)
      : null;
  }

  async saveWorkflow(workflow: BusinessWorkflow): Promise<void> {
    this.workflows.set(workflow.id, serialize(workflow.toJSON()));
  }

  async findWorkflowById(id: string): Promise<BusinessWorkflow | null> {
    const raw = this.workflows.get(id);
    return raw
      ? BusinessWorkflow.create(JSON.parse(raw) as ReturnType<BusinessWorkflow["toJSON"]>)
      : null;
  }

  async saveBusinessEvent(event: BusinessEvent): Promise<void> {
    this.businessEvents.push(event);
  }

  async saveState(state: BusinessState): Promise<void> {
    this.states.set(`${state.entityType}:${state.entityId}`, serialize(state.toJSON()));
  }

  async findState(entityType: string, entityId: string): Promise<BusinessState | null> {
    const raw = this.states.get(`${entityType}:${entityId}`);
    return raw
      ? BusinessState.create(JSON.parse(raw) as ReturnType<BusinessState["toJSON"]>)
      : null;
  }

  async saveSession(session: OperatingSession): Promise<void> {
    this.sessions.set(session.id, serialize(session.toJSON()));
  }

  async findSessionById(id: string): Promise<OperatingSession | null> {
    const raw = this.sessions.get(id);
    return raw
      ? OperatingSession.create(JSON.parse(raw) as ReturnType<OperatingSession["toJSON"]>)
      : null;
  }
}
