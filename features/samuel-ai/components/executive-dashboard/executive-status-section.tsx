import { cn } from "@/utils/cn";

import { formatRelativeTime } from "../../executive-brain/briefing-utils";
import type { ExecutiveStatus } from "../../executive-brain/types";
import { SectionHeader } from "../section-header";

type ExecutiveStatusSectionProps = {
  status: ExecutiveStatus;
  brainStatusLabel?: string;
};

type StatusRowProps = {
  label: string;
  value: string;
  active?: boolean;
};

function StatusRow({ label, value, active }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            active ? "bg-emerald-400" : "bg-zinc-600",
          )}
        />
        <span className="text-xs text-muted">{label}</span>
      </div>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ExecutiveStatusSection({
  status,
  brainStatusLabel,
}: ExecutiveStatusSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Executive Status"
        description="Estado operacional do Samuel AI"
      />

      <div className="divide-y divide-border rounded-lg border border-border bg-white/[0.02] px-3">
        <StatusRow
          label="Samuel AI"
          value={status.online ? "Online" : "Offline"}
          active={status.online}
        />
        <StatusRow
          label="Monitoramento"
          value={status.monitoringCompany ? "Empresa monitorada" : "Inativo"}
          active={status.monitoringCompany}
        />
        <StatusRow
          label="Business Twin™"
          value={status.businessTwinSynced ? "Sincronizado" : "Desatualizado"}
          active={status.businessTwinSynced}
        />
        <StatusRow
          label="Mercado"
          value={status.marketMonitored ? "Monitorado" : "Inativo"}
          active={status.marketMonitored}
        />
        <StatusRow
          label="Última análise"
          value={formatRelativeTime(status.lastAnalysis)}
        />
        <StatusRow label="Nível de autonomia" value={status.autonomyLevel} />
        <StatusRow
          label="Confiança da análise"
          value={`${status.analysisConfidence}%`}
        />
        <StatusRow
          label="Próxima atualização"
          value={formatRelativeTime(status.nextUpdate).replace("há ", "em ")}
        />
        {brainStatusLabel && (
          <StatusRow label="Estado atual" value={brainStatusLabel} active />
        )}
      </div>

      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-500"
          style={{ width: `${status.analysisConfidence}%` }}
        />
      </div>
    </section>
  );
}
