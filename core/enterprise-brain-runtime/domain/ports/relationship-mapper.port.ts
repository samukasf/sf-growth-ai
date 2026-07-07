import type { EnterpriseBrainRelationship } from "../entities";
import type { DataSourceContribution } from "./brain-repository.port";

export interface EnterpriseBrainRelationshipMapper {
  map(contributions: DataSourceContribution[]): EnterpriseBrainRelationship[];
}
