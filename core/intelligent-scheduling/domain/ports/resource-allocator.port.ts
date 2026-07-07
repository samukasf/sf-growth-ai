import type { Appointment, Resource } from "../entities";

export type AllocationResult = {
  allocated: boolean;
  resourceId?: string;
  message: string;
};

export interface ResourceAllocator {
  allocate(
    appointment: Appointment,
    resources: Resource[],
    existingAppointments: Appointment[],
  ): AllocationResult;
  release(resourceId: string, appointmentId: string): void;
}
