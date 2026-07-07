import type { AccessLevel } from "../entities";

export type ApprovalLimitConfig = {
  accessLevel: AccessLevel;
  label: string;
  maxAmount: number;
  unlimited: boolean;
  order: number;
};

export const DEFAULT_APPROVAL_LIMITS: ApprovalLimitConfig[] = [
  { accessLevel: "employee", label: "Employee", maxAmount: 0, unlimited: false, order: 1 },
  { accessLevel: "supervisor", label: "Supervisor", maxAmount: 500, unlimited: false, order: 2 },
  { accessLevel: "coordinator", label: "Coordinator", maxAmount: 1000, unlimited: false, order: 3 },
  { accessLevel: "manager", label: "Manager", maxAmount: 2000, unlimited: false, order: 4 },
  { accessLevel: "director", label: "Director", maxAmount: 20000, unlimited: false, order: 5 },
  { accessLevel: "ceo", label: "CEO", maxAmount: 100000, unlimited: false, order: 6 },
  { accessLevel: "partner", label: "Partner", maxAmount: 0, unlimited: true, order: 7 },
  { accessLevel: "owner", label: "Owner", maxAmount: 0, unlimited: true, order: 8 },
];
