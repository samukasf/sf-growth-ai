# Influence — Execução Operacional

> **Processo:** 05 — Execution  
> **Documento:** `blueprint/lighthouse/influence/operating-model/05_EXECUTION.md`

---

## Objetivo

Orquestrar a entrega contínua de todos os serviços contratados — conteúdo, mídia, social, GBP, web e software — garantindo qualidade, prazos e alinhamento com o plano estratégico.

---

## Entradas

- Plano estratégico trimestral aprovado (processo 04)
- Business Twin™ ativo (Company Brain)
- Cronograma de entregáveis por canal
- Recursos alocados (equipa, budget, ferramentas)
- SLAs contratuais com o cliente
- Aprovações pendentes do cliente

---

## Saídas

- Entregáveis publicados ou entregues por canal
- Registo de execução no Executive Timeline
- Desvios identificados e corrigidos
- Dados de performance para relatório mensal (processo 12)
- Aprendizados registados na Executive Memory

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| COO (operacional) | Orquestra execução cross-canal |
| Account Manager | Interface com cliente; gere aprovações |
| Team leads por canal | Donos de conteúdo, mídia, social, web |
| Especialistas | Produzem e publicam entregáveis |
| CCO | Monitora satisfação e SLAs de entrega |

---

## KPIs

| KPI | Meta |
|---|---|
| Entregáveis no prazo | > 95% |
| Taxa de retrabalho | < 10% |
| Tempo médio de aprovação do cliente | < 48h |
| Aderência ao plano estratégico | > 85% |
| Utilização de capacidade da agência | 75–85% |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Kanban de entregáveis | Plano aprovado | COO cria tarefas por canal e prazo |
| Alerta de prazo | Entregável vence em 48h | Notifica owner e Account Manager |
| Escalation de aprovação | Cliente sem resposta > 72h | CCO contacta cliente |
| Registo de conclusão | Entregável publicado | Timeline atualizada automaticamente |
| Detecção de desvio | Aderência < 70% | COO convoca revisão de plano |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **COO** | Orquestra fluxo, prazos, capacidade e handoffs |
| **CMO** | Supervisiona entregáveis de marketing e conteúdo |
| **CTO** | Supervisiona projetos web e software |
| **CCO** | Garante SLAs e experiência do cliente |
| **Samuel AI** | Sintetiza estado de execução no Executive Inbox |

---

## Fluxo operacional

```
Plano estratégico aprovado (processo 04)
  ↓
COO decompõe plano em entregáveis por canal
  ↓
Execução paralela
  ├── Conteúdo (06)
  ├── Mídia paga (07)
  ├── Social media (08)
  ├── Google Business (09)
  ├── Website (10)
  └── Software Factory (11)
  ↓
Aprovação do cliente (quando aplicável)
  ↓
Publicação / entrega
  ↓
Registo na Timeline + Memory
  ↓
Dados alimentam Relatório Mensal (12) e Client Success (13)
```

---

## Riscos

- **Gargalo de aprovação** — cliente lento bloqueia publicação e compromete KPIs.
- **Silos entre canais** — conteúdo, mídia e social desalinhados geram mensagem inconsistente.
- **Capacidade estourada** — múltiplos clientes com entregas na mesma semana degradam qualidade.
- **Execução sem consulta ao Company Brain** — decisões tácticas contradizem estratégia do cliente.

---

## Oportunidades

- Dashboard unificado de execução cross-canal por cliente na Agency Platform.
- Templates de entregáveis reutilizáveis entre clientes da mesma vertical.
- Automação de handoffs entre canais reduz retrabalho.
- Executive Watchers detectam atrasos antes do cliente reclamar.
