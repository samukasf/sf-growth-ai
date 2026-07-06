# SF Growth AI — Company Brain

> Versão: 1.0  
> Sprint: 45A — Project Foundation  
> Data: Julho 2026  
> Status: Especificação arquitetural (visão futura)

---

## O que é

O **Company Brain** é a camada unificada de inteligência organizacional do SF Growth AI.

Enquanto as Executive Engines processam dados em pipeline sequencial e os Executive Modules fornecem visões de domínio, o Company Brain representa o **cérebro vivo da empresa** — um grafo integrado de contexto, memória, conhecimento, aprendizagem e sabedoria que permite ao Samuel AI compreender, decidir e evoluir como um conselho executivo real.

```
                    ┌─────────────────────┐
                    │    Samuel AI™       │
                    │  (Presidente Exec.) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   COMPANY BRAIN     │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │   Contexto    │  │
                    │  ├───────────────┤  │
                    │  │   Memória     │  │
                    │  ├───────────────┤  │
                    │  │ Conhecimento  │  │
                    │  ├───────────────┤  │
                    │  │ Aprendizagem  │  │
                    │  ├───────────────┤  │
                    │  │   Sabedoria   │  │
                    │  └───────────────┘  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   Executive Engines    Executive Modules    Executive Watchers
```

---

## Objetivo

Centralizar toda a inteligência da empresa em uma única fonte de verdade consultável, evitando:

- Fragmentação de contexto entre engines e módulos
- Perda de memória entre sessões
- Decisões desconectadas do histórico e aprendizados
- Repetição de análises já realizadas
- Respostas genéricas sem personalização empresarial

O Company Brain permite que Samuel AI **nunca comece do zero** e que cada decisão seja informada por tudo que o sistema sabe sobre a empresa.

---

## Arquitetura

### Camadas do Company Brain

| Camada | Função | Estado atual |
|---|---|---|
| **Context** | Estado atual da empresa (perfil, métricas, objetivos) | Implementado via `buildExecutiveContext` |
| **Memory** | Registro temporal de decisões, conversas e eventos | Parcial — `executive-memory-engine` |
| **Knowledge** | Base estruturada de fatos, playbooks e referências | Parcial — `executive-knowledge` |
| **Learning** | Padrões derivados de experiência e resultados | Heurístico — `executive-learning.service` |
| **Wisdom** | Princípios e heurísticas validadas por resultados | Planejado |

### Fluxo de consulta

```
1. Samuel AI recebe intenção do usuário
2. Company Brain é consultado:
   a. Context  → estado atual
   b. Memory   → decisões e eventos relevantes
   c. Knowledge → fatos e playbooks aplicáveis
   d. Learning → padrões e insights
   e. Wisdom   → princípios validados
3. Engines e módulos são acionados com contexto enriquecido
4. Resposta é gerada e registrada no Company Brain
5. Learning e Wisdom são atualizados com o resultado
```

### Relação com Business Twin™

O Business Twin™ é a representação factual da empresa (dados, histórico, perfil). O Company Brain é a **camada de inteligência** que interpreta, conecta e aprende com o Business Twin™ e com todas as outras fontes.

```
Business Twin™ (dados)  →  Company Brain (inteligência)  →  Samuel AI (decisão)
```

---

## Domínios

O Company Brain organiza conhecimento por domínios executivos, alinhados ao Conselho Executivo:

| Domínio | Especialista | Escopo |
|---|---|---|
| **Finanças** | CFO | Caixa, margem, ROI, investimentos, custos |
| **Marketing** | CMO | Marca, campanhas, aquisição, CAC, conteúdo |
| **Operações** | COO | Processos, produtividade, eficiência, SLA |
| **Vendas** | CRO | Pipeline, conversão, CRM, receita |
| **Tecnologia** | CTO | Sistemas, automação, infraestrutura, dados |
| **Pessoas** | RH | Equipe, cultura, capacidade, retenção |
| **Jurídico** | Legal | Compliance, contratos, legislação, riscos |
| **Mercado** | Market Intelligence | Concorrentes, tendências, economia, oportunidades |
| **Estratégia** | CEO | Visão, prioridades, saúde geral, direção |

Cada domínio possui:

- Memórias específicas do domínio
- Base de conhecimento com playbooks
- Padrões de aprendizagem
- Watchers dedicados (quando aplicável)

---

## Memória

### Tipos de memória

| Tipo | Escopo | Retenção | Exemplo |
|---|---|---|---|
| **Curta** | Sessão atual | Minutos/horas | Última conversa, contexto imediato |
| **Longa** | Histórico da empresa | Permanente | Decisões passadas, campanhas, resultados |
| **Negócio** | Entidades do domínio | Permanente | Perfil de cliente, histórico de deal |
| **Aprendizagem** | Padrões derivados | Evolutiva | "Campanhas de email convertem 3x mais às terças" |
| **Relacionamento** | Interações e confiança | Evolutiva | Preferências do empresário, tom de comunicação |

### Ciclo de vida

Implementado parcialmente em `features/executive-memory-engine/`:

```
Criação → Ativa → Reutilizada → Promovida → Arquivada → Obsoleta
```

Cada memória possui scores de:

- **Freshness** — Quão recente é a informação
- **Relevance** — Quão relevante para a consulta atual
- **Confidence** — Quão confiável é a informação
- **Reuse** — Quantas vezes foi reutilizada com sucesso

---

## Conhecimento

### Estrutura

O conhecimento executivo é organizado em registros estruturados:

| Campo | Descrição |
|---|---|
| `category` | Domínio executivo (finanças, marketing, etc.) |
| `origin` | Fonte (interna, externa, inferida, playbook) |
| `content` | Conteúdo do conhecimento |
| `evaluation` | Avaliação de qualidade e confiabilidade |
| `scores` | Freshness, relevance, confidence, reuse |

### Playbooks

Conjuntos de conhecimento estruturado por cenário:

- "Como responder a queda de conversão"
- "Checklist de lançamento de campanha"
- "Protocolo de análise de concorrente"
- "Framework de decisão de investimento"

Implementados parcialmente em `executive-playbook.service.ts`.

### Retrieval

Fluxo de busca de conhecimento:

1. Consulta chega ao Company Brain
2. `resolveKnowledgeQuery` identifica domínio e intenção
3. `searchKnowledgeBase` busca registros relevantes
4. `canAnswerFromInternalKnowledge` determina se há resposta suficiente
5. Se insuficiente, aciona pesquisa externa ou LLM

---

## Aprendizagem

### Eventos de aprendizagem

Registrados via `executive-learning-events.service.ts`:

| Tipo | Descrição |
|---|---|
| `decision_outcome` | Resultado de uma decisão executiva |
| `campaign_result` | Resultado de campanha ou ação |
| `pattern_detected` | Padrão identificado nos dados |
| `feedback_received` | Feedback do empresário |
| `watcher_alert` | Alerta de watcher que gerou ação |
| `knowledge_validated` | Conhecimento confirmado por resultado |

### Learning Engine

A `executive-learning.service.ts` analisa eventos e produz:

- **Insights** — Descobertas acionáveis
- **Patterns** — Tendências recorrentes
- **Rules** — Regras heurísticas derivadas
- **Evolution** — Medida de evolução da inteligência

### Feedback loop

```
Ação → Resultado → Evento de Aprendizagem → Padrão → Regra → Sabedoria
```

---

## Sabedoria

A camada de **Executive Wisdom** representa o mais alto nível de inteligência do Company Brain — conhecimento destilado, validado e generalizado.

### Características

- Derivada de centenas de eventos de aprendizagem
- Validada por resultados mensuráveis (não apenas frequência)
- Aplicável a múltiplos contextos dentro da empresa
- Capaz de generalizar entre empresas (anonimizado, futuro)

### Exemplos

- "Empresas deste segmento com Growth Score abaixo de 400 devem priorizar presença digital antes de investir em ads pagos"
- "Decisões de precificação tomadas sem análise de concorrente têm 70% de taxa de reversão"
- "Campanhas sazonais planejadas com 30+ dias de antecedência performam 2.5x melhor"

### Diferença entre Knowledge e Wisdom

| Knowledge | Wisdom |
|---|---|
| Fato ou procedimento | Princípio validado |
| Específico de contexto | Generalizável |
| Pode ser importado | Deve ser vivido |
| "O CAC médio do setor é R$45" | "CAC acima de 30% da margem indica modelo insustentável" |

---

## Integração Futura

### Com o pipeline SSR

```
app/samuel-ai/page.tsx
    │
    ├── buildCompanyBrain(context)     ← NOVO
    │       ├── loadMemory(companyId)
    │       ├── loadKnowledge(companyId)
    │       ├── loadLearning(companyId)
    │       └── loadWisdom(companyId)
    │
    ├── buildExecutiveIntelligence(context, brain)
    ├── buildExecutiveDecisions(intelligence, brain)
    └── ... (todas as engines recebem brain como input)
```

### Com Samuel AI (chat)

```
Usuário pergunta
    → Company Brain consultado (memory + knowledge + wisdom)
    → Orchestrator seleciona especialistas com contexto enriquecido
    → LLM gera resposta informada
    → Resposta registrada no Company Brain
    → Learning atualizado
```

### Com Watchers

```
Watcher detecta sinal
    → Company Brain avalia relevância (memory + knowledge)
    → Se relevante: gera alerta + recomendação
    → Se padrão recorrente: atualiza learning
    → Se validado: promove a wisdom
```

### Com Software Factory (futuro)

```
Company Brain identifica gap de software
    → Wisdom sugere tipo de solução
    → Knowledge fornece especificações base
    → Memory fornece contexto histórico
    → Software Factory produz solução
    → Resultado alimenta Company Brain
```

---

## Implementação Atual vs. Futuro

| Componente | Atual | Futuro |
|---|---|---|
| Context | `buildExecutiveContext` (Supabase) | Integrado ao Company Brain |
| Memory | `executive-memory-engine` (serviços definidos) | Pipeline SSR + persistência Supabase |
| Knowledge | `executive-knowledge` (serviços definidos) | Retrieval funcional + playbooks |
| Learning | `executive-learning.service` (heurístico) | Feedback loop com eventos reais |
| Wisdom | Não implementado | Derivado de learning + knowledge |
| Company Brain API | Não existe | `buildCompanyBrain()` unificador |

---

## Documentos Relacionados

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitetura geral
- [ROADMAP.md](./ROADMAP.md) — Fase 2: Company Brain
- [SOFTWARE_FACTORY.md](./SOFTWARE_FACTORY.md) — Integração futura
- `docs/SAMUEL_AI_EXECUTIVE_BRAIN.md` — Pipeline de decisão
- `features/executive-memory-engine/` — Implementação parcial de memória
- `features/executive-knowledge/` — Implementação parcial de conhecimento
