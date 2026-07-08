import {
  createBusinessDayFinishedEvent,
  createBusinessDayStartedEvent,
  createBusinessAlertGeneratedEvent,
  createBusinessReviewCompletedEvent,
  createPriorityCalculatedEvent,
  createRoutineCreatedEvent,
} from "../../domain";
import type { BusinessOperatingDependencies } from "../dependencies";
import type { BusinessDayScopeDto, CompanyScopeDto, StartBusinessDayDto } from "../dto";

export class StartBusinessDayUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(dto: StartBusinessDayDto) {
    const day = await this.deps.dailyCoordinator.startDay(
      dto.organizationId,
      dto.companyId,
      dto.agencyId,
    );

    await this.deps.eventDispatcher.publish(
      createBusinessDayStartedEvent({
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        agencyId: dto.agencyId,
        businessDayId: day.id,
        date: day.date,
      }),
    );

    if (dto.agencyId && this.deps.agencyCore.isAvailable()) {
      await this.deps.agencyCore.notifyBusinessDayStarted(
        dto.organizationId,
        dto.agencyId,
        dto.companyId,
      );
    }

    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.registerDailyOperations(
        dto.organizationId,
        dto.companyId,
        day.id,
      );
    }

    if (this.deps.companyBrain.isAvailable()) {
      await this.deps.companyBrain.enrichDailyContext(
        dto.organizationId,
        dto.companyId,
        day.id,
      );
    }

    if (this.deps.clientLifecycle.isAvailable()) {
      await this.deps.clientLifecycle.syncBusinessDayEvent(
        dto.organizationId,
        dto.companyId,
        "BusinessDayStarted",
      );
    }

    return { day };
  }
}

export class PlanRoutinesUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(dto: BusinessDayScopeDto) {
    const routines = await this.deps.routinePlanner.planDaily(
      dto.organizationId,
      dto.companyId,
      dto.businessDayId,
      dto.agencyId,
    );

    for (const routine of routines) {
      await this.deps.repository.saveRoutine(routine);
      await this.deps.eventDispatcher.publish(
        createRoutineCreatedEvent(routine, dto.businessDayId),
      );
    }

    return { routines };
  }
}

export class CalculatePrioritiesUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(dto: BusinessDayScopeDto) {
    const priorities = await this.deps.priorityEngine.calculate(
      dto.organizationId,
      dto.companyId,
      dto.businessDayId,
      dto.agencyId,
    );

    for (const priority of priorities) {
      await this.deps.repository.savePriority(priority);
    }

    await this.deps.eventDispatcher.publish(
      createPriorityCalculatedEvent(priorities, dto.businessDayId),
    );

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.conveneDailyReview(
        dto.organizationId,
        dto.companyId,
        priorities.map((p) => p.toJSON()),
      );
    }

    if (this.deps.executiveMissions.isAvailable()) {
      await this.deps.executiveMissions.assignDailyMissions(
        dto.organizationId,
        dto.companyId,
        priorities.map((p) => p.toJSON()),
      );
    }

    return { priorities };
  }
}

export class MonitorOperationsUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(companyId: string) {
    const alerts = await this.deps.operationsMonitor.monitor(companyId);

    for (const alert of alerts) {
      await this.deps.repository.saveAlert(alert);
      await this.deps.eventDispatcher.publish(createBusinessAlertGeneratedEvent(alert));
    }

    return { alerts };
  }
}

export class AnalyzeHealthUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(dto: CompanyScopeDto) {
    const report = await this.deps.healthAnalyzer.analyze(dto.organizationId, dto.companyId);

    if (this.deps.executiveOpportunities.isAvailable()) {
      await this.deps.executiveOpportunities.scanDailyOpportunities(
        dto.organizationId,
        dto.companyId,
      );
    }

    return { report };
  }
}

export class BuildReviewUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(dto: BusinessDayScopeDto) {
    const review = await this.deps.executiveReviewBuilder.build(
      dto.organizationId,
      dto.companyId,
      dto.businessDayId,
      dto.agencyId,
    );

    await this.deps.repository.saveReview(review);

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.deliverDailyBriefing(
        dto.organizationId,
        dto.companyId,
        review.summary as unknown as Record<string, unknown>,
      );
    }

    return { review };
  }
}

export class FinishBusinessDayUseCase {
  constructor(private readonly deps: BusinessOperatingDependencies) {}

  async execute(companyId: string, businessDayId: string) {
    const review = await this.deps.repository.findReview(businessDayId);
    const completedReview = review?.complete();
    if (completedReview) {
      await this.deps.repository.saveReview(completedReview);
      await this.deps.eventDispatcher.publish(createBusinessReviewCompletedEvent(completedReview));
    }

    const day = await this.deps.dailyCoordinator.finishDay(businessDayId, companyId);

    await this.deps.eventDispatcher.publish(
      createBusinessDayFinishedEvent({
        organizationId: day.organizationId,
        companyId: day.companyId,
        agencyId: day.agencyId,
        businessDayId: day.id,
        date: day.date,
        reviewId: completedReview?.id,
      }),
    );

    if (this.deps.clientLifecycle.isAvailable()) {
      await this.deps.clientLifecycle.syncBusinessDayEvent(
        day.organizationId,
        day.companyId,
        "BusinessDayFinished",
      );
    }

    return { day, review: completedReview };
  }
}
