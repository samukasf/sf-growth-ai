import type { CouncilMember, CouncilSession, ExecutiveCouncil } from "../entities";

export type StartSessionInput = {
  council: ExecutiveCouncil;
  requestId: string;
  query: string;
  brainSnapshotId?: string;
  roles: import("../../shared").CouncilSpecialistRole[];
};

export interface CouncilSessionManager {
  start(input: StartSessionInput): Promise<{ session: CouncilSession; members: CouncilMember[] }>;
  complete(session: CouncilSession): Promise<CouncilSession>;
}
