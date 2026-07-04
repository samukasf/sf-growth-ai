import { cn } from "@/utils/cn";

import { formatRelativeTime } from "../../executive-brain/briefing-utils";
import type {
  CouncilMemberAvailability,
  CouncilMemberStatus,
  ExecutiveCouncil,
} from "../../executive-brain/types";
import { SectionHeader } from "../section-header";

type ExecutiveCouncilSectionProps = {
  council: ExecutiveCouncil;
};

const STATUS_LABELS: Record<CouncilMemberStatus, string> = {
  online: "Online",
  consulting: "Consultando",
  standby: "Standby",
  offline: "Offline",
};

const STATUS_DOT: Record<CouncilMemberStatus, string> = {
  online: "bg-emerald-400",
  consulting: "bg-accent animate-pulse",
  standby: "bg-amber-400",
  offline: "bg-zinc-600",
};

const AVAILABILITY_LABELS: Record<CouncilMemberAvailability, string> = {
  available: "Disponível",
  busy: "Ocupado",
  unavailable: "Indisponível",
};

export function ExecutiveCouncilSection({
  council,
}: ExecutiveCouncilSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Executive Council"
        description="Conselho executivo permanente"
      />

      <ul className="flex flex-col gap-2">
        {council.members.map((member) => (
          <li
            key={member.id}
            className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    STATUS_DOT[member.status],
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.role}
                  </p>
                  <p className="text-[11px] text-muted">{member.title}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                {AVAILABILITY_LABELS[member.availability]}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between pl-5 text-[11px]">
              <span className="text-muted">
                {STATUS_LABELS[member.status]}
              </span>
              <span className="text-muted">
                Consulta: {formatRelativeTime(member.lastConsulted)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
