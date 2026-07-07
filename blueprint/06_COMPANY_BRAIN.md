# Company Brain

## Objetivo

Definir o cérebro factual da empresa — memória persistente, dados internos e contexto operacional que fundamenta todas as decisões do Samuel AI.

## Responsabilidades

- Armazenar e recuperar fatos sobre a empresa
- Enriquecer contexto de cada solicitação ao Orchestrator
- Conectar dados estruturados com engines de conhecimento
- Evitar alucinação — Business Twin apresenta fatos, não opina

## Componentes

- **Business Twin™** — Memória factual (CDO digital)
- **Company Profile** — Perfil, setor, modelo de negócio
- **Operational Data** — Métricas, processos, sistemas
- **Knowledge Graph** — Relações entre entidades da empresa
- **Integration Adapters** — ERP, CRM, planilhas, APIs

## Fluxo

```
Fontes de dados
      ↓
Company Brain (indexação)
      ↓
Executive Knowledge + Memory
      ↓
Orchestrator (enriquecimento de contexto)
      ↓
Resposta fundamentada em fatos
```

## Integrações

- [04_ENTERPRISE_BRAIN.md](./04_ENTERPRISE_BRAIN.md)
- Executive Knowledge (`core/executive-knowledge/`)
- Executive Memory (planejado)
- `COMPANY_BRAIN.md` (raiz)

## Futuro

RAG corporativo, sincronização bidirecional com ERPs, memória vetorial e atualização contínua em background.
