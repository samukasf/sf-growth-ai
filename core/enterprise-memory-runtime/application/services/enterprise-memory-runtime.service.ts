import type {
  LinkMemoryRelationshipDto,
  QueryMemoryDto,
  SearchMemoryDto,
  UpdateMemoryDto,
  WriteMemoryDto,
} from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";
import type { MemoryRuntime } from "../../domain";
import {
  ArchiveMemoryUseCase,
  LinkMemoryRelationshipUseCase,
  ReadMemoryUseCase,
  SearchMemoryUseCase,
  UpdateMemoryUseCase,
  WriteMemoryUseCase,
} from "../use-cases";

export class EnterpriseMemoryRuntimeService implements MemoryRuntime {
  private readonly writeUseCase: WriteMemoryUseCase;
  private readonly readUseCase: ReadMemoryUseCase;
  private readonly updateUseCase: UpdateMemoryUseCase;
  private readonly searchUseCase: SearchMemoryUseCase;
  private readonly linkUseCase: LinkMemoryRelationshipUseCase;
  private readonly archiveUseCase: ArchiveMemoryUseCase;

  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {
    this.writeUseCase = new WriteMemoryUseCase(deps);
    this.readUseCase = new ReadMemoryUseCase(deps);
    this.updateUseCase = new UpdateMemoryUseCase(deps);
    this.searchUseCase = new SearchMemoryUseCase(deps);
    this.linkUseCase = new LinkMemoryRelationshipUseCase(deps);
    this.archiveUseCase = new ArchiveMemoryUseCase(deps);
  }

  write(dto: WriteMemoryDto) {
    return this.writeUseCase.execute(dto);
  }

  read(memoryId: string) {
    return this.readUseCase.executeById(memoryId);
  }

  query(dto: QueryMemoryDto) {
    return this.readUseCase.executeQuery(dto);
  }

  search(dto: SearchMemoryDto) {
    return this.searchUseCase.execute(dto);
  }

  async update(dto: UpdateMemoryDto) {
    const result = await this.updateUseCase.execute(dto);
    return result.memory;
  }

  async linkRelationship(dto: LinkMemoryRelationshipDto) {
    const result = await this.linkUseCase.execute(dto);
    return result.memory;
  }

  archive(memoryId: string) {
    return this.archiveUseCase.execute({ memoryId });
  }

  getHistory(memoryId: string) {
    return this.readUseCase.executeHistory(memoryId);
  }
}
