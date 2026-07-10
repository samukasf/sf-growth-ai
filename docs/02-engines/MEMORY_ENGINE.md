# Memory Engine

Version: 1.0 (Foundation)

---

## Objetivo

O Memory Engine é responsável por armazenar, organizar, recuperar e resumir todo o conhecimento de cada empresa no SF Growth AI.

Esta versão inicial define apenas a arquitetura e os contratos. Não inclui IA, embeddings ou integrações com OpenAI.

---

## Arquitetura

```
apps/web/src/core/memory/
├── memory.types.ts       # Tipos e interfaces do domínio
├── memory.constants.ts   # Tipos de memória, pesos e defaults
├── memory.repository.ts  # Contrato de persistência
├── memory.search.ts      # Busca por palavras-chave (scaffold)
├── memory.ranking.ts     # Ranking por importância e recência
├── memory.summary.ts     # Resumo estrutural (scaffold)
├── memory.service.ts     # Orquestração da API pública
└── index.ts              # Barrel export
```

### Camadas

| Camada | Responsabilidade |
|--------|------------------|
| **Types** | Modelo de dados: `Memory`, `MemoryInput`, `MemorySearch`, `MemorySummary` |
| **Repository** | Contrato de persistência (Supabase no futuro) |
| **Search** | Filtragem e scoring textual |
| **Ranking** | Priorização por importância e recência |
| **Summary** | Agregação estatística do conhecimento da empresa |
| **Service** | API unificada consumida pelos demais engines |

---

## Fluxo

```
Consumer (Samuel / Brain / Council)
        │
        ▼
  MemoryService
        │
   ┌────┴────┬──────────┬──────────┐
   ▼         ▼          ▼          ▼
Repository  Search    Ranking   Summary
   │
   ▼
 Supabase (futuro)
```

### Operações

1. **create** — Registra nova memória com tipo, importância e tags.
2. **update** — Atualiza conteúdo ou metadados.
3. **delete** — Remove memória obsoleta.
4. **findById** — Recupera memória específica.
5. **search** — Busca por query, tipo, tags e importância.
6. **listByCompany** — Lista todas as memórias de uma empresa.
7. **summarize** — Gera visão agregada do conhecimento.
8. **rank** — Retorna memórias mais relevantes para contexto.

---

## Tipos de memória

| Tipo | Uso |
|------|-----|
| NOTE | Anotações gerais |
| CONVERSATION | Histórico de conversas |
| DOCUMENT | Documentos e arquivos |
| CUSTOMER | Dados de clientes |
| PROJECT | Projetos em andamento |
| TASK | Tarefas e ações |
| MEETING | Reuniões |
| DISCOVERY | Descobertas de mercado |
| ASSESSMENT | Avaliações e diagnósticos |
| MARKETING | Campanhas e conteúdo |
| FINANCIAL | Dados financeiros |
| STRATEGY | Decisões estratégicas |

---

## Como será usado pelo Samuel AI

Samuel AI consulta o Memory Engine antes de responder ao empresário:

- **search** — Recupera contexto relevante da conversa atual.
- **rank** — Seleciona as memórias mais importantes para a decisão.
- **create** — Persiste aprendizados e decisões após cada interação.
- **summarize** — Obtém visão geral do conhecimento acumulado.

---

## Como será usado pelo Company Brain

O Company Brain (Business Twin + Business DNA) alimenta e consome o Memory Engine:

- **create** — Registra mudanças no estado do negócio.
- **listByCompany** — Monta o perfil completo da empresa.
- **summarize** — Gera snapshot do conhecimento para dashboards.
- **search** — Cruza memórias por tipo (CUSTOMER, FINANCIAL, MARKETING).

---

## Como será usado pelo Executive Council

O Conselho Executivo usa o Memory Engine para debates informados:

- **rank** — Prioriza memórias estratégicas (STRATEGY, ASSESSMENT, FINANCIAL).
- **search** — Busca precedentes e decisões anteriores.
- **summarize** — Fornece briefing consolidado antes de cada sessão.
- **create** — Registra decisões e recomendações do conselho.

---

## Próximos passos

- Implementar `MemoryRepository` com Supabase.
- Adicionar embeddings e busca semântica.
- Integrar resumo com LLM.
- Conectar com `enterprise-memory-runtime` existente.
