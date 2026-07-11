# Spec — Marketing

## Objetivo

Especificar a camada de **Marketing Intelligence** do SF Growth AI: watchers de mercado e SEO, recomendações de crescimento, branding e ações mensuráveis para PMEs.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Planejado |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Produto / Engenharia |

## Escopo

- Market watcher e SEO watcher
- Recomendações de marketing integradas ao Samuel AI
- Métricas e oportunidades de crescimento
- Integração com Executive Opportunity (futuro)

## Componentes

| Componente | Localização |
|------------|-------------|
| Market watcher | `features/watchers/market/` |
| SEO watcher | `features/watchers/seo/` |
| Executive Opportunity | `core/executive-opportunity/` |

## Fluxo

```
Sinais externos (mercado, SEO) → Watchers → Oportunidades → Samuel AI / Council → Plano de ação
```

## Critérios de aceite

- [ ] Watchers executáveis com output estruturado
- [ ] Recomendações visíveis no workspace executivo
- [ ] Rastreabilidade de fonte dos sinais

## Próximos passos

- [ ] Inventariar capacidades atuais dos watchers
- [ ] Definir MVP de recomendações no dashboard
- [ ] Alinhar com proposta de valor em `docs/PRODUCT.md`

## Referências

- `docs/PRODUCT.md`
- `core/executive-opportunity/`
- `features/watchers/`
