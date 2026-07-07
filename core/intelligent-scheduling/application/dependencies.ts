import type { EventDispatcher } from "../shared";
import type {
  AppointmentOptimizer,
  AvailabilityEngine,
  ConflictDetector,
  RecurringScheduler,
  ReminderEngine,
  ReservationManager,
  ResourceAllocator,
  SchedulingRepository,
} from "../domain";
import type { CalendarConnectorPort } from "./ports/connectors";
import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCrmPort,
  ExecutiveHRPort,
  ExecutiveOperationsPort,
  ExecutiveOrchestratorPort,
  OrganizationBrainPort,
} from "./ports/integration";

export type IntelligentSchedulingDependencies = {
  schedulingRepository: SchedulingRepository;
  availabilityEngine: AvailabilityEngine;
  conflictDetector: ConflictDetector;
  resourceAllocator: ResourceAllocator;
  reminderEngine: ReminderEngine;
  appointmentOptimizer: AppointmentOptimizer;
  recurringScheduler: RecurringScheduler;
  reservationManager: ReservationManager;
  eventDispatcher: EventDispatcher;
  businessCommunication: BusinessCommunicationPort;
  businessAutomation: BusinessAutomationPort;
  executiveCrm: ExecutiveCrmPort;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  companyBrain: CompanyBrainPort;
  organizationBrain: OrganizationBrainPort;
  executiveOperations: ExecutiveOperationsPort;
  executiveHr: ExecutiveHRPort;
  calendarConnectors: CalendarConnectorPort[];
};
