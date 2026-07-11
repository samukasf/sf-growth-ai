# Spec — Executive Council

## Objetivo

Especificar o **Conselho Executivo Digital**: sessões, participantes (funcionários digitais), construção de decisões e recomendações estratégicas coordenadas pelo Samuel AI.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Planejado |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Produto / Engenharia |

## Escopo

- Sessões de conselho e agenda
- Decision builder e priorização
- Integração com Executive Engines
- Governança e audit trail (futuro)

## Componentes

| Componente | Localização |
|------------|-------------|
| Domínio | `core/executive-council/` |
| Session manager | `core/executive-council/domain/ports/council-session-manager.port.ts` |
| Decision builder | `core/executive-council/infrastructure/services/default-decision-builder.ts` |

## Fluxo

```
Solicitação executiva → Sessão de conselho → Deliberação (engines) → Decisão / recomendação → Samuel AI
```

## Critérios de aceite

- [ ] Criação e encerramento de sessão de conselho
- [ ] Decisões estruturadas com rationale
- [ ] Integração com Orchestrator documentada

## Próximos passos

- [ ] Definir MVP de sessão (participantes, outputs)
- [ ] Especificar API e eventos de domínio
- [ ] Alinhar com `blueprint/07_DIGITAL_EMPLOYEES.md` e `blueprint/08_EXECUTIVE_ENGINES.md`

## Referências

- `blueprint/07_DIGITAL_EMPLOYEES.md`
- `blueprint/08_EXECUTIVE_ENGINES.md`
- `blueprint/04_EXECUTIVE_COUNCIL.md` (legado)
