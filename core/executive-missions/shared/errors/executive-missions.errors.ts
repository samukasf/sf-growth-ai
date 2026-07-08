export class ExecutiveMissionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutiveMissionsError";
  }
}

export class MissionNotFoundError extends ExecutiveMissionsError {
  constructor(missionId: string) {
    super(`Mission not found: ${missionId}`);
    this.name = "MissionNotFoundError";
  }
}

