import type { MemoryQuery, MemoryRepository } from "../../domain/ports/memory-repository.port";
import type { MemoryReader } from "../../domain/ports/memory-reader.port";

export class DefaultMemoryReader implements MemoryReader {
  constructor(private readonly repository: MemoryRepository) {}

  readById(memoryId: string) {
    return this.repository.findById(memoryId);
  }

  readByQuery(query: MemoryQuery) {
    return this.repository.query(query);
  }

  readHistory(memoryId: string) {
    return this.repository.findVersionsByMemoryId(memoryId);
  }
}
