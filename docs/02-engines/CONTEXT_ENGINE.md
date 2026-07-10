# Context Engine

Version: 1.0 (Foundation)

---

## Objetivo

O Context Engine transforma dados brutos de múltiplas fontes em contexto estruturado para o Samuel AI e demais consumidores da plataforma.

Esta versão inicial define apenas a arquitetura e os contratos. Não inclui IA, LLM ou integrações com OpenAI.

---

## Arquitetura

```
apps/web/src/core/context/
├── context.types.ts      # Tipos e interfaces do domínio
├── context.constants.ts  # Fontes, prioridades e defaults
├── context.resolver.ts   # Resolução de fontes por input/query
├── context.builder.ts    # Montagem do contexto a partir das fontes
├── context.priority.ts   # Priorização por relevância e recência
├── context.timeline.ts   # Visão cronológica dos fragmentos
├── context.summary.ts    # Resumo estrutural (scaffold)
├── context.service.ts    # Orquestração da API pública
└── index.ts              # Barrel export
```

### Camadas

| Camada | Responsabilidade |
|--------|------------------|
| **Types** | Modelo: `Context`, `ContextInput`, `ContextOutput`, `ContextSource`, `ContextPriority` |
| **Resolver** | Decide quais fontes carregar com base no input e na query |
| **Builder** | Agrega fragmentos de cada `ContextSourceProvider` |
| **Priority** | Ordena fragmentos por prioridade e recência |
| **Timeline** | Organiza eventos cronologicamente |
| **Summary** | Agregação estatística do contexto montado |
| **Service** | API unificada consumida pelo Samuel e demais engines |

---

## Fluxo

```
Consumer (Samuel / Council / Future AI)
        │
        ▼
  ContextService
        │
   resolve() ──► determina fontes (Memory, Brain, Projects, ...)
        │
   build() ──► ContextSourceProvider[] ──► Context
        │
   ┌────┴────┬──────────┬──────────┐
   ▼         ▼          ▼          ▼
merge()  prioritize() timeline() summarize()
        │
        ▼
  ContextOutput
```

### Fontes suportadas

| Fonte | Origem |
|-------|--------|
| MEMORY | Memory Engine |
| COMPANY_BRAIN | Company Brain (Business Twin + DNA) |
| PROJECTS | Projetos da empresa |
| CLIENTS | Base de clientes |
| AGENDA | Compromissos e reuniões |
| FINANCIAL | Dados financeiros |
| MARKETING | Campanhas e conteúdo |
| DOCUMENTS | Documentos e arquivos |
| CONVERSATIONS | Histórico de conversas |
| EXECUTIVE_COUNCIL | Decisões e debates do conselho |

### Operações

1. **resolve** — Identifica quais fontes consultar.
2. **build** — Monta o `Context` a partir das fontes resolvidas.
3. **merge** — Combina múltiplos contextos sem duplicatas.
4. **prioritize** — Ordena fragmentos por relevância.
5. **summarize** — Gera visão agregada do contexto.
6. **timeline** — Retorna sequência cronológica de eventos.

---

## Como o Samuel utilizará o contexto

Antes de responder ao empresário, o Samuel AI:

1. Chama **resolve** com a query da conversa atual.
2. Executa **build** para reunir fragmentos de Memory, Company Brain e Conversas.
3. Aplica **prioritize** para selecionar o que é mais relevante.
4. Usa **summarize** para obter visão rápida do estado da empresa.
5. Consulta **timeline** para entender a sequência de eventos recentes.

O contexto estruturado alimenta o raciocínio do Samuel sem expor dados brutos ao usuário.

---

## Como o Executive Council utilizará o contexto

O Conselho Executivo usa o Context Engine para debates informados:

1. **build** com fontes EXECUTIVE_COUNCIL, FINANCIAL, STRATEGY e PROJECTS.
2. **prioritize** com filtro de prioridade HIGH e CRITICAL.
3. **timeline** para revisar decisões e eventos anteriores.
4. **merge** de contextos de diferentes áreas (Marketing + Financeiro + Operações).

Cada executivo recebe o mesmo contexto base, priorizado por sua área de responsabilidade.

---

## Como futuras IAs utilizarão o contexto

Engines futuros (Reasoning, Decision, Growth Score) consumirão o Context Engine como camada de entrada:

- **Reasoning Engine** — Recebe `ContextOutput` priorizado como input de raciocínio.
- **Decision Engine** — Cruza contexto de FINANCIAL + MARKETING + EXECUTIVE_COUNCIL.
- **Growth Score Engine** — Usa **summarize** para avaliar maturidade com base no contexto acumulado.
- **Embeddings (futuro)** — Fragmentos de contexto serão indexados semanticamente via Memory Engine.

O Context Engine permanece agnóstico à IA: entrega dados estruturados; os consumidores decidem como processá-los.

---

## Próximos passos

- Implementar `ContextSourceProvider` para cada fonte (Memory, Brain, CRM, etc.).
- Conectar com Memory Engine (`apps/web/src/core/memory/`).
- Adicionar cache de contexto por sessão.
- Integrar resumo com LLM quando a camada de IA estiver disponível.
