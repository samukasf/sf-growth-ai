# Princípios

## Objetivo

Codificar os princípios que governam produto, experiência, arquitetura e decisões do SF Growth AI.

## Responsabilidades

- Garantir consistência entre squads e sprints
- Evitar decisões que contradigam a identidade do produto
- Servir como checklist em code review e design review

## Componentes

### Produto
- Business First — tecnologia é meio, crescimento é o fim
- Nunca responder imediatamente — pensar, consultar, cruzar, então responder
- Ação mensurável — toda recomendação gera melhoria mensurável

### Experiência
- Nunca parecer chatbot — sempre consultoria executiva premium
- Memória contínua — o sistema nunca começa do zero
- Organização primeiro — dashboards e permissões por cargo/departamento

### Engenharia
- Clean Architecture + DDD + Event Driven
- SOLID e Dependency Inversion
- Engines isoladas — interface só via Orchestrator
- Incremental — não quebrar compatibilidade

## Fluxo

```
Decisão proposta
      ↓
Validação contra princípios
      ↓
Aprovada / Ajustada / Rejeitada
      ↓
Implementação alinhada
```

## Integrações

- [15_ARCHITECTURE.md](./15_ARCHITECTURE.md)
- [13_SECURITY_AND_GOVERNANCE.md](./13_SECURITY_AND_GOVERNANCE.md)
- `docs/SF_GROWTH_AI_EXPERIENCE_PRINCIPLES.md`

## Futuro

Evoluir para princípios auditáveis automaticamente — governance engine validando conformidade em tempo real.
