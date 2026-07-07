export class SchedulingDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchedulingDomainError";
  }
}

export class AppointmentNotFoundError extends SchedulingDomainError {
  constructor(appointmentId: string) {
    super(`Appointment not found: ${appointmentId}`);
    this.name = "AppointmentNotFoundError";
  }
}

export class CalendarNotFoundError extends SchedulingDomainError {
  constructor(calendarId: string) {
    super(`Calendar not found: ${calendarId}`);
    this.name = "CalendarNotFoundError";
  }
}

export class ConflictDetectedError extends SchedulingDomainError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictDetectedError";
  }
}

export class SchedulingValidationError extends SchedulingDomainError {
  constructor(message: string) {
    super(message);
    this.name = "SchedulingValidationError";
  }
}
