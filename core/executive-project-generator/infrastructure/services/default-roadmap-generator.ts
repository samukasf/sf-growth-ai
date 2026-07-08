import { ProjectRoadmap } from "../../domain";
import type { GenerateRoadmapInput, RoadmapGenerator } from "../../domain";

export class DefaultRoadmapGenerator implements RoadmapGenerator {
  generate(input: GenerateRoadmapInput): ProjectRoadmap {
    const { project } = input;

    const milestones = [
      {
        title: "Descoberta e Planeamento",
        description: "Requisitos, desenho de solução e alinhamento de stakeholders.",
        dueWeek: 2,
        tasks: [
          { title: "Workshop de requisitos", description: "Mapear necessidades e prioridades.", estimatedDays: 2 },
          { title: "Arquitetura inicial", description: "Definir componentes e integrações.", estimatedDays: 3 },
        ],
      },
      {
        title: "Implementação",
        description: "Construção incremental com validações.",
        dueWeek: 8,
        tasks: [
          { title: "Implementar MVP", description: "Entrega funcional mínima.", estimatedDays: 10 },
          { title: "Testes e qualidade", description: "Testes e correções.", estimatedDays: 5 },
        ],
      },
      {
        title: "Rollout e Otimização",
        description: "Go-live, treinamento e monitorização.",
        dueWeek: 12,
        tasks: [
          { title: "Go-live", description: "Publicar e estabilizar.", estimatedDays: 3 },
          { title: "Monitorar KPIs", description: "Acompanhar resultados e ajustar.", estimatedDays: 5 },
        ],
      },
    ];

    return ProjectRoadmap.create({
      projectId: project.id,
      milestones: milestones.map((m, idx) => ({
        title: m.title,
        description: m.description,
        dueWeek: m.dueWeek,
        tasks: m.tasks.map((t, tIdx) => ({
          title: t.title,
          description: t.description,
          estimatedDays: t.estimatedDays,
          owner: project.departments[0],
          id: `t-${idx + 1}-${tIdx + 1}`,
          status: "todo",
        })),
        id: `m-${idx + 1}`,
      })),
    });
  }
}

