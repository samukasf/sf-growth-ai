import type {
  CancelAppointmentDto,
  CompleteAppointmentDto,
  ConfirmAppointmentDto,
  CreateAppointmentDto,
  CreateCalendarDto,
  CreateReservationDto,
  JoinWaitingListDto,
  PromoteWaitingListDto,
  SendRemindersDto,
} from "../dto";
import type { IntelligentSchedulingDependencies } from "../dependencies";
import {
  CancelAppointmentUseCase,
  CompleteAppointmentUseCase,
  ConfirmAppointmentUseCase,
  CreateAppointmentUseCase,
  CreateCalendarUseCase,
  CreateReservationUseCase,
  SendRemindersUseCase,
  WaitingListUseCase,
} from "../use-cases";

export class IntelligentSchedulingService {
  private readonly createCalendarUseCase: CreateCalendarUseCase;
  private readonly createAppointmentUseCase: CreateAppointmentUseCase;
  private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase;
  private readonly cancelAppointmentUseCase: CancelAppointmentUseCase;
  private readonly completeAppointmentUseCase: CompleteAppointmentUseCase;
  private readonly createReservationUseCase: CreateReservationUseCase;
  private readonly waitingListUseCase: WaitingListUseCase;
  private readonly sendRemindersUseCase: SendRemindersUseCase;

  constructor(private readonly deps: IntelligentSchedulingDependencies) {
    this.createCalendarUseCase = new CreateCalendarUseCase(deps);
    this.createAppointmentUseCase = new CreateAppointmentUseCase(deps);
    this.confirmAppointmentUseCase = new ConfirmAppointmentUseCase(deps);
    this.cancelAppointmentUseCase = new CancelAppointmentUseCase(deps);
    this.completeAppointmentUseCase = new CompleteAppointmentUseCase(deps);
    this.createReservationUseCase = new CreateReservationUseCase(deps);
    this.waitingListUseCase = new WaitingListUseCase(deps);
    this.sendRemindersUseCase = new SendRemindersUseCase(deps);
  }

  createCalendar(dto: CreateCalendarDto) {
    return this.createCalendarUseCase.execute(dto);
  }

  createAppointment(dto: CreateAppointmentDto) {
    return this.createAppointmentUseCase.execute(dto);
  }

  confirmAppointment(dto: ConfirmAppointmentDto) {
    return this.confirmAppointmentUseCase.execute(dto);
  }

  cancelAppointment(dto: CancelAppointmentDto) {
    return this.cancelAppointmentUseCase.execute(dto);
  }

  completeAppointment(dto: CompleteAppointmentDto) {
    return this.completeAppointmentUseCase.execute(dto);
  }

  createReservation(dto: CreateReservationDto) {
    return this.createReservationUseCase.execute(dto);
  }

  joinWaitingList(dto: JoinWaitingListDto) {
    return this.waitingListUseCase.join(dto);
  }

  promoteWaitingList(dto: PromoteWaitingListDto) {
    return this.waitingListUseCase.promote(dto);
  }

  sendReminders(dto: SendRemindersDto) {
    return this.sendRemindersUseCase.execute(dto);
  }

  async listCalendars(organizationId: string) {
    return this.deps.schedulingRepository.findCalendarsByOrganization(organizationId);
  }

  async listAppointments(organizationId: string) {
    return this.deps.schedulingRepository.findAppointmentsByOrganization(organizationId);
  }

  async listResources(organizationId: string) {
    return this.deps.schedulingRepository.findResourcesByOrganization(organizationId);
  }

  getCalendarConnectors() {
    return this.deps.calendarConnectors;
  }
}
