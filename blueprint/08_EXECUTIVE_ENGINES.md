# Executive Engines

## Objetivo

Documentar os motores de inteligência executiva — módulos especializados em Clean Architecture que processam conhecimento, aprendizado, sabedoria, experiência, inovação e projetos.

## Responsabilidades

- Processar domínios específicos de inteligência
- Emitir eventos de domínio
- Retornar contribuições para o Orchestrator
- Manter isolamento — nunca chamados diretamente pela UI

## Componentes

| Engine | Path | Função |
|--------|------|--------|
| Executive Knowledge | `core/executive-knowledge/` | Conhecimento estruturado |
| Executive Learning | `core/executive-learning/` | Aprendizado e padrões |
| Executive Wisdom | `core/executive-wisdom/` | Sabedoria e playbooks |
| Executive Experience | `core/executive-experience/` | Casos e experiências |
| Executive Innovation | `core/executive-innovation/` | Oportunidades de inovação |
| Executive Project Generator | `core/executive-projects/` | Projetos estruturados |
| Executive Orchestrator | `core/executive-orchestrator/` | Coordenação e consenso |

## Fluxo

```
UI → Orchestrator ONLY
        ↓
Routing Engine (participantes)
        ↓
Workflow Engine
        ↓
Engines convidados (ports)
        ↓
Consensus Engine
        ↓
CEO → Resposta
```

## Integrações

- [03_SUPERCEREBRO.md](./03_SUPERCEREBRO.md)
- [05_ORGANIZATION_BRAIN.md](./05_ORGANIZATION_BRAIN.md)
- [14_AI_PROVIDERS.md](./14_AI_PROVIDERS.md)
- `features/samuel-ai/` (Executive Workspace — UI)

## Futuro

Novos engines: Forecast, Legal, HR, CRM, Operations — todos plugáveis via Participant Registry do Orchestrator.
