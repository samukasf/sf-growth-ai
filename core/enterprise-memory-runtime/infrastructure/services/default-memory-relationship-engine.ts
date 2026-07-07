import { MemoryRelationship } from "../../domain";
import { MemoryNotFoundError } from "../../shared";
import type { MemoryRepository } from "../../domain/ports/memory-repository.port";
import type {
  LinkMemoryInput,
  MemoryRelationshipEngine,
} from "../../domain/ports/memory-relationship-engine.port";

export class DefaultMemoryRelationshipEngine implements MemoryRelationshipEngine {
  constructor(private readonly repository: MemoryRepository) {}

  async link(input: LinkMemoryInput) {
    const source = await this.repository.findById(input.sourceMemoryId);
    if (!source) throw new MemoryNotFoundError(input.sourceMemoryId);

    const target = await this.repository.findById(input.targetMemoryId);
    if (!target) throw new MemoryNotFoundError(input.targetMemoryId);

    const relationship = MemoryRelationship.create({
      sourceMemoryId: input.sourceMemoryId,
      targetMemoryId: input.targetMemoryId,
      relationshipType: input.relationshipType,
      strength: input.strength ?? 70,
    });

    await this.repository.saveRelationship(relationship);
    return relationship;
  }

  async findRelated(memoryId: string) {
    const relationships = await this.repository.findRelationshipsByMemoryId(memoryId);
    const related: import("../../domain").EnterpriseMemory[] = [];

    for (const rel of relationships) {
      const memory = await this.repository.findById(rel.targetMemoryId);
      if (memory?.isActive()) related.push(memory);
    }

    return related;
  }

  async resolveGraph(memoryId: string, depth = 2) {
    const visited = new Set<string>();
    const results: import("../../domain").EnterpriseMemory[] = [];

    const traverse = async (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) return;
      visited.add(currentId);

      const related = await this.findRelated(currentId);
      for (const memory of related) {
        results.push(memory);
        await traverse(memory.id, currentDepth + 1);
      }
    };

    await traverse(memoryId, 0);
    return results;
  }
}
