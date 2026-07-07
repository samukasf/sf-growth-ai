import { CouncilMember, CouncilSession } from "../../domain";
import type { CouncilSessionManager, StartSessionInput } from "../../domain/ports/council-session-manager.port";
import type { CouncilSpecialistRole } from "../../shared";

const ROLE_NAMES: Record<CouncilSpecialistRole, string> = {
  ceo: "Executive CEO",
  finance: "Finance Specialist",
  marketing: "Marketing Specialist",
  sales: "Sales Specialist",
  operations: "Operations Specialist",
  hr: "HR Specialist",
  legal: "Legal Specialist",
  crm: "CRM Specialist",
  communication: "Communication Specialist",
  commerce: "Commerce Specialist",
  scheduling: "Scheduling Specialist",
  innovation: "Innovation Specialist",
  projects: "Projects Specialist",
};

export class DefaultCouncilSessionManager implements CouncilSessionManager {
  async start(input: StartSessionInput) {
    const session = CouncilSession.create({
      councilId: input.council.id,
      organizationId: input.council.organizationId,
      companyId: input.council.companyId,
      requestId: input.requestId,
      query: input.query,
      brainSnapshotId: input.brainSnapshotId,
      status: "deliberating",
    });

    const members = input.roles.map((role) =>
      CouncilMember.create({
        sessionId: session.id,
        role,
        name: ROLE_NAMES[role],
      }),
    );

    const activeSession = session.withMembers(members.map((m) => m.id));
    return { session: activeSession, members };
  }

  async complete(session: CouncilSession) {
    return session.complete();
  }
}
