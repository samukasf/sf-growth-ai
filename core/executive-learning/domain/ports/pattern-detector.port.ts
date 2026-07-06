import type { LearningPattern, LearningRecord } from "../entities";

export interface PatternDetector {
  detect(records: LearningRecord[]): LearningPattern[];
}
