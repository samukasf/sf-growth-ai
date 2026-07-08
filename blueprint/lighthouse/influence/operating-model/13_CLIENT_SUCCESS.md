# Influence — Client Success

> **Processo:** 13 — Client Success  
> **Documento:** `blueprint/lighthouse/influence/operating-model/13_CLIENT_SUCCESS.md`

---

## Objetivo

Monitorizar continuamente a saúde de cada cliente da Influence — satisfação, aderência ao plano, resultados e risco de churn — e intervir proativamente antes de problemas escalarem.

---

## Entradas

- Relatórios mensais (processo 12)
- KPIs de execução (processo 05)
- Feedback do Account Manager
- NPS e pesquisas de satisfação
- Health score histórico do cliente
- Sinais de risco (atrasos, reclamações, queda de engagement)

---

## Saídas

- Health score atualizado por cliente (0–100)
- Plano de ação para clientes em risco
- Registo de intervenções na Executive Timeline
- Alertas no Executive Inbox da agência
- Inputs para retenção (16) e renovação (14)

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Client Success Manager | Dono do health score e intervenções |
| Account Manager | Feedback qualitativo e relação diária |
| CCO (via Conselho) | Define critérios de saúde e SLAs |
| Diretor de operações | Escala recursos para clientes em risco |
| Empresário (cliente) | Participa em check-ins quando solicitado |

---

## KPIs

| KPI | Meta |
|---|---|
| Health score médio da carteira | > 75/100 |
| Clientes em risco (score < 60) | < 10% da carteira |
| Tempo de resposta a alerta de risco | < 24h |
| NPS médio da carteira | > 50 |
| Taxa de intervenção bem-sucedida | > 80% (score recupera em 30 dias) |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Cálculo de health score | Relatório mensal ou evento crítico | CDO atualiza score composto |
| Alerta de risco | Score < 60 ou queda > 15 pts | Executive Inbox notifica CSM |
| Check-in automático | Cliente sem contacto > 14 dias | CSM agenda touchpoint |
| Detecção de churn signal | 2+ KPIs abaixo do target | CCO escala para Account Manager |
| Registo de intervenção | Ação tomada | Timeline + Memory atualizados |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **CCO** | Define health score, SLAs e experiência do cliente |
| **CDO** | Calcula score com dados objetivos de performance |
| **COO** | Aloca recursos para recuperação de clientes em risco |
| **CRO** | Identifica risco comercial e oportunidade de expansão |
| **Samuel AI** | Prioriza clientes em risco no Executive Inbox da agência |

---

## Fluxo operacional

```
Monitorização contínua (execução · relatórios · feedback)
  ↓
Health score calculado (mensal ou por evento)
  ↓
Score ≥ 75 → manutenção · check-in trimestral
Score 60–74 → plano de melhoria · Account Manager intensifica contacto
Score < 60 → intervenção CSM · escalation COO
  ↓
Plano de ação definido e executado
  ↓
Reavaliação em 30 dias
  ↓
Recuperação → normal · Persistência → retenção (16) ou offboarding (17)
```

---

## Riscos

- **Health score reativo** — score calculado tarde demais para prevenir churn.
- **Account Manager sobrecarregado** — sem CSM dedicado, clientes em risco passam despercebidos.
- **Intervenção genérica** — plano de ação não personalizado ao contexto do cliente.
- **Falta de dados qualitativos** — score baseado só em métricas ignora insatisfação silenciosa.

---

## Oportunidades

- Health score como capacidade core da Agency Platform reutilizável.
- Predição de churn via Executive Forecast antes do cliente comunicar intenção.
- Playbook de recuperação por tipo de risco (performance · relacionamento · budget).
- Client Success como diferencial vs. agências que só entregam relatórios.
