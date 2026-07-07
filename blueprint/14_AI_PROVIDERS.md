# AI Providers

## Objetivo

Definir a camada de provedores de IA — abstração que permite trocar modelos (GPT, Claude, Gemini, etc.) sem alterar engines ou UI.

## Responsabilidades

- Abstrair chamadas a LLMs e serviços de IA
- Permitir fallback e roteamento entre providers
- Controlar custos, rate limits e quotas
- Garantir que engines não dependam de provider específico

## Componentes

- **AIProviderPort** — Interface comum em cada engine
- **Provider Registry** — Cadastro de providers disponíveis
- **Routing Policy** — Qual provider para qual tarefa
- **Cost Tracker** — Monitoramento de tokens/custo
- **Noop Adapters** — Desenvolvimento sem IA externa (atual)

## Fluxo

```
Engine / Orchestrator
      ↓
AI Provider Layer (port)
      ↓
Provider selecionado (policy)
      ↓
LLM API
      ↓
Resposta normalizada
```

## Integrações

- [08_EXECUTIVE_ENGINES.md](./08_EXECUTIVE_ENGINES.md)
- [09_SOFTWARE_FACTORY.md](./09_SOFTWARE_FACTORY.md)
- Todos os `noop-*-adapter` nos engines

## Futuro

Suporte a GPT, Claude, Gemini, modelos locais, fine-tuning por organização e cache semântico.

**Nota:** Nesta fase, nenhum provider externo está integrado — apenas a arquitetura de ports.
