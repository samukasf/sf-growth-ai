import {
  BusinessCapability,
  CapabilityRegistry,
  EnterprisePlatform,
  PlatformRegistry,
  createCapabilityRegisteredEvent,
  createPlatformRegisteredEvent,
} from "../../domain";
import type { RegisterCapabilityDto, RegisterPlatformDto } from "../dto";
import type { EnterpriseOsDependencies } from "../dependencies";

export class RegisterPlatformUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: RegisterPlatformDto) {
    const platform = EnterprisePlatform.create({
      organizationId: dto.organizationId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      category: dto.category as EnterprisePlatform["category"],
      modulePath: dto.modulePath,
      version: dto.version,
    });

    await this.deps.enterpriseRegistry.savePlatform(platform);
    await this.deps.eventDispatcher.publish(createPlatformRegisteredEvent(platform));
    await this.deps.enterpriseEventBus.broadcast(createPlatformRegisteredEvent(platform));

    let registry = await this.deps.enterpriseRegistry.findPlatformRegistry(dto.organizationId);
    if (!registry) {
      registry = PlatformRegistry.create({
        organizationId: dto.organizationId,
        platformIds: [platform.id],
        defaultPlatformId: platform.id,
      });
    } else {
      registry = registry.register(platform.id);
    }
    await this.deps.enterpriseRegistry.savePlatformRegistry(registry);

    return platform;
  }
}

export class RegisterCapabilityUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: RegisterCapabilityDto) {
    const capability = BusinessCapability.create({
      organizationId: dto.organizationId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      domain: dto.domain as BusinessCapability["domain"],
      platformId: dto.platformId,
    });

    await this.deps.enterpriseRegistry.saveCapability(capability);
    await this.deps.eventDispatcher.publish(createCapabilityRegisteredEvent(capability));
    await this.deps.enterpriseEventBus.broadcast(createCapabilityRegisteredEvent(capability));

    let registry = await this.deps.enterpriseRegistry.findCapabilityRegistry(dto.organizationId);
    if (!registry) {
      registry = CapabilityRegistry.create({
        organizationId: dto.organizationId,
        capabilityIds: [capability.id],
      });
    } else {
      registry = registry.register(capability.id);
    }
    await this.deps.enterpriseRegistry.saveCapabilityRegistry(registry);

    return capability;
  }
}
