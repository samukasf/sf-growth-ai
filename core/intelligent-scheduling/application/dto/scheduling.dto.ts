export type CreateCalendarDto = {
  organizationId: string;
  name: string;
  description: string;
  provider: "internal" | "google" | "outlook" | "apple" | "calendly";
  timezone: string;
  ownerId: string;
  isDefault: boolean;
};

export type CreateAppointmentDto = {
  organizationId: string;
  calendarId: string;
  serviceId?: string;
  resourceId?: string;
  title: string;
  description: string;
  customerId?: string;
  employeeId?: string;
  startAt: string;
  endAt: string;
  autoConfirm?: boolean;
  autoCheckIn?: boolean;
};

export type ConfirmAppointmentDto = {
  organizationId: string;
  appointmentId: string;
};

export type CancelAppointmentDto = {
  organizationId: string;
  appointmentId: string;
  reason?: string;
};

export type CompleteAppointmentDto = {
  organizationId: string;
  appointmentId: string;
};

export type CreateReservationDto = {
  organizationId: string;
  resourceId: string;
  title: string;
  reservedBy: string;
  startAt: string;
  endAt: string;
};

export type JoinWaitingListDto = {
  organizationId: string;
  serviceId: string;
  customerId: string;
  preferredDate?: string;
};

export type PromoteWaitingListDto = {
  organizationId: string;
  waitingListId: string;
};

export type SendRemindersDto = {
  organizationId: string;
  appointmentId: string;
};
