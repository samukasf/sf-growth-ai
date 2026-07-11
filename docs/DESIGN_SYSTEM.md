# DESIGN SYSTEM — SF Growth AI

## Objetivo

Estabelecer princípios visuais, tokens, componentes e padrões de experiência do SF Growth AI. Garantir consistência entre Samuel AI, dashboards executivos e futuras superfícies de produto.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Em definição |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Design / Produto |

## Princípios de experiência

- **Clareza executiva** — Informação densa, hierarquia visual clara
- **Confiança** — Fatos do Company Brain distinguidos de recomendações da IA
- **Organização primeiro** — Contexto sempre ligado à empresa, não ao usuário isolado
- **Progressão** — Assistido → autonomia, com feedback visível

## Stack de UI

| Item | Escolha |
|------|---------|
| **Framework CSS** | Tailwind CSS 4 |
| **Tipografia** | Geist (via `next/font`) |
| **Componentes** | React 19; evolução para biblioteca compartilhada |

## Tokens (inicial)

| Token | Uso |
|-------|-----|
| **Superfície primária** | Backgrounds de workspace e dashboards |
| **Acento executivo** | CTAs, estados ativos, Samuel AI |
| **Semântica** | Sucesso, alerta, erro, informação factual vs. recomendação |

> Detalhamento de cores, espaçamento e tipografia será expandido conforme componentes forem consolidados.

## Superfícies de produto

- **Samuel AI** — `features/samuel-ai/`, rota `/samuel-ai`
- **Debug / Dev** — `app/debug/` (não exposto em produção)

## Próximos passos

- [ ] Inventariar componentes existentes em `features/samuel-ai/components/`
- [ ] Definir paleta e tokens Tailwind oficiais
- [ ] Sincronizar com `docs/SF_GROWTH_AI_EXPERIENCE_PRINCIPLES.md`

## Referências

- `docs/SF_GROWTH_AI_EXPERIENCE_PRINCIPLES.md`
- `blueprint/02_PRINCIPIOS.md`
