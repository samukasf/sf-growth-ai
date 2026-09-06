"use client";

import { BrainCircuit, CircleCheck, LoaderCircle, Search, Sparkles, Target, Workflow } from "lucide-react";
import { cn } from "@/utils/cn";
import type { OrchestratorSnapshot } from "../../services/executive-orchestrator.types";

type Props = { snapshot?: OrchestratorSnapshot | null; isProcessing: boolean };

const agents = [
  { id: "market", label: "Market Agent", detail: "Mapeando sinais e oportunidades", icon: Search },
  { id: "research", label: "Research Agent", detail: "Organizando contexto e evidências", icon: BrainCircuit },
  { id: "qualification", label: "Qualification Agent", detail: "Priorizando impacto e confiança", icon: Target },
  { id: "creative", label: "Creative Agent", detail: "Preparando ativos quando necessário", icon: Sparkles },
  { id: "orchestrator", label: "Samuel Orchestrator", detail: "Consolidando a próxima ação", icon: Workflow },
] as const;

function activeIndex(snapshot?: OrchestratorSnapshot | null) {
  if (!snapshot) return 0;
  switch (snapshot.phase) {
    case "building_context": return 0;
    case "selecting_executives": return 1;
    case "running_analysis": return 2;
    case "building_consensus": return 3;
    case "building_action_plan": return 4;
    case "complete": return agents.length;
    default: return 0;
  }
}

export function SamuelAgentActivity({ snapshot, isProcessing }: Props) {
  if (!isProcessing && snapshot?.phase !== "complete") return null;
  const current = activeIndex(snapshot);
  return (
    <div className="samuel-agent-activity" aria-live="polite">
      <div className="samuel-agent-activity__head">
        <span className={cn("samuel-agent-activity__pulse", isProcessing && "is-live")} />
        <div><p>{isProcessing ? "Samuel está executando" : "Execução concluída"}</p><span>Orquestração em tempo real · sem simulação de atividade</span></div>
      </div>
      <div className="samuel-agent-activity__rail">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const complete = current > index;
          const active = isProcessing && current === index;
          return <div key={agent.id} className={cn("samuel-agent-activity__item", active && "is-active", complete && "is-complete")}>
            <span className="samuel-agent-activity__icon">{active ? <LoaderCircle className="animate-spin" /> : complete ? <CircleCheck /> : <Icon />}</span>
            <div><p>{agent.label}</p><span>{complete ? "Concluído" : active ? agent.detail : "Em espera"}</span></div>
          </div>;
        })}
      </div>
    </div>
  );
}
