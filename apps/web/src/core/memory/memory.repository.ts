import type {
  Memory,
  MemoryInput,
  MemorySearch,
  MemoryUpdateInput,
} from "./memory.types";

/**
 * Persistence contract for the Memory Engine.
 * Implementations will connect to Supabase or other storage backends.
 */
export interface MemoryRepository {
  create(input: MemoryInput): Promise<Memory>;
  update(id: string, input: MemoryUpdateInput): Promise<Memory | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Memory | null>;
  findByCompany(tenantId: string, companyId: string): Promise<Memory[]>;
  search(criteria: MemorySearch): Promise<Memory[]>;
}

export type MemoryRepositoryFactory = () => MemoryRepository;
