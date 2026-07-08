# Influence — Retenção

> **Processo:** 16 — Retention  
> **Documento:** `blueprint/lighthouse/influence/operating-model/16_RETENTION.md`

---

## Objetivo

Intervir proativamente quando um cliente apresenta sinais de churn — antes da decisão de não renovar — recuperando a relação e o valor entregue.

---

## Entradas

- Health score em queda (processo 13)
- Sinais de churn (reclamações, atrasos de pagamento, desengagement)
- Feedback negativo do empresário
- Comparativo de performance vs. expectativas
- Histórico de intervenções anteriores
- Proposta de renovação pendente ou recusada (processo 14)

---

## Saídas

- Plano de retenção personalizado
- Ações corretivas executadas
- Health score recuperado ou confirmação de churn
- Registo na Executive Memory (aprendizados)
- Handoff para offboarding (17) se retenção falhar

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Client Success Manager | Dono do plano de retenção |
| Account Manager | Relação direta e execução de ações |
| Diretor de operações | Aloca recursos extras se necessário |
| CCO (via Conselho) | Define estratégia de recuperação |
| CRO | Avalia se vale a pena reter (LTV vs. custo) |
| Diretor Comercial | Aprova concessões comerciais (desconto, escopo) |

---

## KPIs

| KPI | Meta |
|---|---|
| Taxa de recuperação de clientes em risco | > 60% |
| Tempo de resposta a sinal de churn | < 48h |
| Churn rate anual | < 12% |
| Custo de retenção vs. LTV | < 10% do LTV |
| NPS pós-intervenção | Recuperação para > 7/10 |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Alerta de churn | Health score < 50 ou queda > 20 pts | CSM recebe prioridade no Inbox |
| Plano de retenção | Alerta confirmado | Template com ações por tipo de risco |
| Escalation | Sem melhoria em 14 dias | COO e Diretor Comercial envolvidos |
| Concessão comercial | Churn iminente e LTV alto | CRO propõe desconto ou escopo extra |
| Registo de outcome | 30 dias pós-intervenção | Memory atualizada (sucesso ou churn) |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **CCO** | Lidera estratégia de recuperação e experiência |
| **CRO** | Avalia viabilidade comercial da retenção |
| **COO** | Aloca recursos e corrige falhas operacionais |
| **CDO** | Identifica causas objetivas (performance · dados) |
| **Samuel AI** | Recomenda abordagem personalizada ao empresário |

---

## Fluxo operacional

```
Sinal de churn detectado (score · feedback · pagamento · desengagement)
  ↓
CSM + Account Manager avaliam causa raiz
  ↓
CRO valida se retenção é viável (LTV · histórico · potencial)
  ↓
Plano de retenção definido (ações · prazos · owners)
  ↓
Execução (correções · reunião · concessões · recursos extras)
  ↓
Reavaliação em 30 dias
  ↓
Recuperação → health score normalizado → ciclo normal
  ou
Churn confirmado → offboarding (17)
```

---

## Riscos

- **Intervenção tardia** — cliente já decidiu sair quando CSM actua.
- **Concessão sem causa corrigida** — desconto retém contrato mas não resolve insatisfação.
- **Retenção de cliente tóxico** — LTV negativo consome recursos da agência.
- **Falta de aprendizagem** — churn ocorre sem registo de causa na Memory.

---

## Oportunidades

- Playbook de retenção por tipo de risco reutilizável na Agency Platform.
- Análise de churn na Executive Learning melhora prevenção futura.
- Retenção bem-sucedida gera case de Client Success para novos prospects.
- Early warning via Forecast Engine antes do cliente comunicar intenção.
