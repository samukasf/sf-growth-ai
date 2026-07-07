import type { IntelligentSchedulingDependencies } from "../../application";
import { IntelligentSchedulingService } from "../../application";
import { createDefaultCalendarConnectors } from "../connectors/noop-calendar-connectors";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessAutomationAdapter,
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopExecutiveCrmAdapter,
  NoopExecutiveHRAdapter,
  NoopExecutiveOperationsAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopOrganizationBrainAdapter,
} from "../integration/noop-integration.adapters";
import { InMemorySchedulingRepository } from "../persistence/in-memory-scheduling.repository";
import { DefaultAppointmentOptimizer } from "../services/default-appointment-optimizer";
import { DefaultAvailabilityEngine } from "../services/default-availability-engine";
import { DefaultConflictDetector } from "../services/default-conflict-detector";
import { DefaultRecurringScheduler } from "../services/default-recurring-scheduler";
import { DefaultReminderEngine } from "../services/default-reminder-engine";
import { DefaultReservationManager } from "../services/default-reservation-manager";
import { DefaultResourceAllocator } from "../services/default-resource-allocator";

export type CreateIntelligentSchedulingOptions = {
  dependencies?: Partial<IntelligentSchedulingDependencies>;
};

export function createIntelligentScheduling(
  options: CreateIntelligentSchedulingOptions = {},
): IntelligentSchedulingService {
  const dependencies: IntelligentSchedulingDependencies = {
    schedulingRepository:
      options.dependencies?.schedulingRepository ?? new InMemorySchedulingRepository(),
    availabilityEngine:
      options.dependencies?.availabilityEngine ?? new DefaultAvailabilityEngine(),
    conflictDetector: options.dependencies?.conflictDetector ?? new DefaultConflictDetector(),
    resourceAllocator:
      options.dependencies?.resourceAllocator ?? new DefaultResourceAllocator(),
    reminderEngine: options.dependencies?.reminderEngine ?? new DefaultReminderEngine(),
    appointmentOptimizer:
      options.dependencies?.appointmentOptimizer ?? new DefaultAppointmentOptimizer(),
    recurringScheduler:
      options.dependencies?.recurringScheduler ?? new DefaultRecurringScheduler(),
    reservationManager:
      options.dependencies?.reservationManager ?? new DefaultReservationManager(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
    executiveCrm: options.dependencies?.executiveCrm ?? new NoopExecutiveCrmAdapter(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
    executiveOperations:
      options.dependencies?.executiveOperations ?? new NoopExecutiveOperationsAdapter(),
    executiveHr: options.dependencies?.executiveHr ?? new NoopExecutiveHRAdapter(),
    calendarConnectors:
      options.dependencies?.calendarConnectors ?? createDefaultCalendarConnectors(),
  };

  return new IntelligentSchedulingService(dependencies);
}
