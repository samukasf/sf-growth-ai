# Spec — Software Factory

## Objetivo

Especificar a **Software Factory**: fábrica de software autônoma capaz de planejar módulos, gerar arquitetura e evoluir código alinhado ao domínio SF Growth AI.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Planejado |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Engenharia |

## Escopo

- Planejamento de módulos
- Geração de arquitetura
- Integração com Executive Project Generator
- Governança e revisão humana (human-in-the-loop)

## Componentes

| Componente | Localização |
|------------|-------------|
| Domínio | `core/software-factory/` |
| Module planner | `core/software-factory/infrastructure/services/default-module-planner.ts` |
| Architecture generator | `core/software-factory/infrastructure/services/default-architecture-generator.ts` |
| Project generator | `core/executive-project-generator/` |

## Fluxo

```
Requisito executivo → Software Factory → Plano + arquitetura → Geração / scaffold → Revisão → Deploy
```

## Critérios de aceite

- [ ] Plano de módulo gerado a partir de requisito estruturado
- [ ] Output compatível com convenções `core/` e `features/`
- [ ] Nenhuma geração sem checkpoint de revisão

## Próximos passos

- [ ] Documentar contrato do module planner
- [ ] Definir limites de autonomia (o que pode ser gerado automaticamente)
- [ ] Alinhar com `blueprint/09_SOFTWARE_FACTORY.md`

## Referências

- `blueprint/09_SOFTWARE_FACTORY.md`
- `core/software-factory/`
- `docs/ARCHITECTURE.md`
