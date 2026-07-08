# Influence — Offboarding

> **Processo:** 17 — Offboarding  
> **Documento:** `blueprint/lighthouse/influence/operating-model/17_OFFBOARDING.md`

---

## Objetivo

Encerrar a relação comercial com clientes que não renovam ou rescindem contrato — de forma controlada, profissional e com transferência completa de ativos e conhecimento.

---

## Entradas

- Decisão de não renovação ou rescisão (processos 14 ou 16)
- Contrato e cláusulas de rescisão (CLO)
- Inventário de ativos do cliente (contas, conteúdos, acessos)
- Pendências financeiras (CFO)
- Feedback de saída (exit interview)

---

## Saídas

- Offboarding concluído em prazo contratual
- Ativos transferidos ao cliente
- Acessos revogados pela agência
- Tenant arquivado (não eliminado — retenção legal)
- Exit interview registada na Executive Memory
- Aprendizados de churn documentados

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Account Manager | Conduz offboarding com cliente |
| COO | Coordena checklist e prazos |
| CLO (via Conselho) | Valida cláusulas e obrigações legais |
| CFO | Quitação financeira e faturação final |
| CTO | Revoga acessos e transfere ativos técnicos |
| CSM | Exit interview e registo de aprendizados |

---

## KPIs

| KPI | Meta |
|---|---|
| Offboarding concluído no prazo contratual | 100% |
| Ativos transferidos completamente | 100% |
| Acessos revogados | 100% em 48h após término |
| Exit interview realizada | > 80% dos offboardings |
| Pendências financeiras | 0 após encerramento |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Checklist de offboarding | Rescisão confirmada | COO cria tarefas com prazos legais |
| Inventário de ativos | Offboarding iniciado | Lista automática de contas e conteúdos |
| Alerta de prazo | Item pendente > 50% do prazo | Notifica Account Manager e COO |
| Revogação de acessos | Data de término | CTO revoga credenciais da agência |
| Arquivo de tenant | Offboarding concluído | Tenant movido para estado archived |
| Registo de aprendizado | Exit interview concluída | Memory atualizada com causa de churn |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **COO** | Orquestra checklist e cumprimento de prazos |
| **CLO** | Garante conformidade legal e cláusulas contratuais |
| **CFO** | Quitação financeira e faturação final |
| **CTO** | Transferência técnica e revogação de acessos |
| **CCO** | Exit interview e experiência de saída |
| **Samuel AI** | Regista aprendizados para prevenção futura de churn |

---

## Fluxo operacional

```
Decisão de encerramento (não renovação · rescisão · retenção falhou)
  ↓
CLO valida cláusulas e prazo de aviso
  ↓
Checklist de offboarding iniciado
  ├── Inventário de ativos
  ├── Transferência de contas e conteúdos
  ├── Faturação final e quitação (CFO)
  └── Exit interview (CSM)
  ↓
Transferência de ativos ao cliente
  ↓
Revogação de acessos da agência (CTO)
  ↓
Tenant arquivado (retenção legal conforme GDPR)
  ↓
Aprendizados registados na Memory
  ↓
Encerramento formal comunicado ao cliente
```

---

## Riscos

- **Ativos retidos** — cliente reclama de conteúdos ou acessos não transferidos.
- **Acessos ativos pós-contrato** — risco de segurança e uso indevido.
- **Offboarding conflictivo** — má experiência de saída gera reputação negativa.
- **Aprendizados perdidos** — causa de churn não registada impede melhoria.

---

## Oportunidades

- Offboarding profissional mantém porta aberta para retorno futuro.
- Exit interview alimenta Executive Learning com padrões de churn.
- Processo padronizado reutilizável para todos os clientes da agência.
- Arquivo de tenant preserva dados para analytics anonimizados cross-cliente.
