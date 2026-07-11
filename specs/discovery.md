# Spec — Discovery

## Objetivo

Especificar o módulo de **Discovery**: descoberta de perfil de negócio, enriquecimento de dados e atualização contínua do contexto corporativo para o Company Brain e engines executivos.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Planejado |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Produto / Engenharia |

## Escopo

- Onboarding e perfil de empresa
- Eventos de atualização de business profile
- Conectores com fontes externas (futuro)
- Alimentação do Company Brain

## Componentes

| Componente | Localização |
|------------|-------------|
| Domínio | `core/company-discovery/` |
| Eventos | `core/company-discovery/domain/events/` |
| Business profile | `business-profile-updated.event.ts` |

## Fluxo

```
Entrada (formulário, import, API) → Discovery → Perfil enriquecido → Company Brain → Engines
```

## Critérios de aceite

- [ ] Perfil mínimo capturável (setor, modelo, objetivos)
- [ ] Eventos de atualização propagados ao brain
- [ ] Integração documentada com Company Brain spec

## Próximos passos

- [ ] Definir campos obrigatórios do Business Profile
- [ ] Especificar jornada de onboarding
- [ ] Priorizar no backlog após Company Brain MVP

## Referências

- `specs/company-brain.md`
- `blueprint/06_COMPANY_BRAIN.md`
- `blueprint/pilots/` (jornadas de referência)
