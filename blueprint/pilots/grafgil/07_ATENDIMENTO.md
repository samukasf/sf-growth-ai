# Grafgil Digital Twin — Atendimento

> **Camada:** Business Twin™ — Relacionamento e suporte  
> **Documento:** `blueprint/pilots/grafgil/07_ATENDIMENTO.md`

---

## Estado Atual

| Canal | Volume/mês | Tempo resposta | Satisfação |
|---|---|---|---|
| Telefone | 320 chamadas | Imediato | 7/10 |
| Email | 480 emails | 8h (média) | 6/10 |
| WhatsApp | 1.200 msgs | 2h (média) | 7/10 |
| Presencial (showroom) | 45 visitas | — | 8/10 |
| Website (formulário) | 12 leads | 36h | 4/10 |

**Equipa:** Sofia (escalation) · Assistente comercial · Vendedores (cada um gere os seus).

Sem central de atendimento, sem SLA definido, sem base de conhecimento para FAQs.

---

## Objetivos

1. Definir SLAs de atendimento por canal e segmento de cliente.
2. Reduzir tempo de resposta a leads para <2h.
3. Criar base de FAQs no Executive Knowledge.
4. Modelar fluxo de reclamações com SLA e aprendizagem.
5. Separar atendimento tático (WhatsApp) de decisões (Supercérebro).

---

## Problemas

- Lead web demora 36h para primeira resposta humana.
- WhatsApp mistura pessoal e profissional (120+ msgs/dia no grupo produção).
- Sem registo unificado de interações por cliente.
- Reclamações sem SLA — resolução média 8 dias.
- Cliente liga 2,3× por pedido para saber estado ("onde está?").

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Resposta lenta a leads web | 35% dos leads esfriam |
| Sem CRM de atendimento | Histórico fragmentado |
| Reclamações sem dono claro | Retrabalho e insatisfação |

---

## Oportunidades

- Resposta automática imediata a leads (confirmação + SLA).
- Portal do cliente para tracking de pedidos.
- Notificações proativas em cada marco (produção, expedição, instalação).
- Base de conhecimento para 80% das perguntas frequentes.
- NPS pós-entrega automatizado.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Confirmação de lead | Formulário web | Email/SMS imediato + notifica vendedor |
| Alerta SLA | Sem resposta >4h | Escala para Sofia |
| Notificação de estado | Marco de produção | Cliente recebe update automático |
| NPS pós-entrega | Job concluído | Survey automático em 24h |
| Registo de reclamação | Ticket aberto | Timeline + SLA 48h |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Tempo resposta lead | 36h | 2h |
| Contactos "onde está?" / cliente | 2,3 | 0,4 |
| NPS | 62 | 74 |
| SLA reclamações (48h) | 40% | 90% |
| Resolução reclamações | 8 dias | 4 dias |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Atendimento comercial | Sofia Gil + assistente |
| Reclamações | Sofia Gil |
| Atendimento operacional | Paulo Ferreira (produção) |
| Curadoria no Twin | CRO + Executive Memory |

---

## Integrações futuras

| Integração | Finalidade |
|---|---|
| Website / formulários | Leads em tempo real |
| Email | Histórico de interações |
| WhatsApp Business API | Mensagens estruturadas |
| Portal do cliente | Self-service e tracking |
| Executive Knowledge | FAQs e SOPs de atendimento |
