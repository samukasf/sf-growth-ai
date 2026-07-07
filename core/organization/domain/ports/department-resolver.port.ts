import type { Department, DepartmentProfile } from "../entities";

export interface DepartmentResolver {
  resolveById(departmentId: string): Promise<Department | null>;
  resolveProfile(departmentId: string): Promise<DepartmentProfile | null>;
  resolveByOrganization(organizationId: string): Promise<Department[]>;
}
