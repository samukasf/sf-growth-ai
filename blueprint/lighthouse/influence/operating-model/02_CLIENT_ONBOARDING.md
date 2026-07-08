# Influence — Onboarding de Clientes

> **Processo:** 02 — Client Onboarding  
> **Documento:** `blueprint/lighthouse/influence/operating-model/02_CLIENT_ONBOARDING.md`  
> **Fases cobertas:** Fechamento → Tenant → Company Brain

---

## Objetivo

Integrar o novo cliente na operação da Influence em até 10 dias úteis, configurando tenant, Business Twin™ (Company Brain), equipa responsável e acessos necessários para iniciar planejamento e execução.

---

## Entradas

- Contrato assinado (processo 01)
- Brief de descoberta e diagnóstico inicial (processo 03)
- Dados da empresa cliente (NIF, morada, contactos, segmento)
- Escopo contratado (serviços, investimento, KPIs acordados)
- Documentos legais (NDA, autorização de acesso a contas)

---

## Saídas

- Tenant do cliente criado na Agency Platform
- Business Twin™ mínimo configurado (Company Brain)
- Account Manager designado
- Kickoff realizado com cliente
- Checklist de onboarding 100% concluído
- Plano de 30 dias definido

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Account Manager | Dono do onboarding; ponto de contacto do cliente |
| COO | Coordena checklist e prazos internos |
| CDO | Configura Business Twin™ e fontes de dados |
| CTO | Provisiona acessos técnicos (contas, domínios, APIs) |
| Diretor Comercial | Valida handoff comercial → operação |
| Cliente (empresário) | Fornece materiais, acessos e participa do kickoff |

---

## KPIs

| KPI | Meta |
|---|---|
| Tempo de onboarding (contrato → kickoff) | ≤ 10 dias úteis |
| Checklist concluído no prazo | 100% |
| Business Twin™ mínimo ativo | ≤ 7 dias úteis |
| NPS do kickoff | > 8/10 |
| Time-to-first-deliverable | ≤ 21 dias após kickoff |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Criação de tenant | Contrato assinado | COO dispara provisionamento multi-tenant |
| Checklist de onboarding | Tenant criado | Lista de tarefas com owners e prazos |
| Alerta de atraso | Item pendente > 48h | Executive Inbox notifica Account Manager |
| Solicitação de acessos | Kickoff agendado | Email automático ao cliente com lista de credenciais |
| Ativação do Company Brain | Dados mínimos recebidos | CDO configura Business Twin™ |
| Handoff para planejamento | Checklist 100% | CSO recebe sinal para iniciar processo 04 |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **COO** | Orquestra checklist, prazos e handoffs entre equipas |
| **CDO** | Estrutura Business Twin™ com dados iniciais da empresa |
| **CTO** | Valida requisitos técnicos e acessos |
| **CCO** | Define expectativas de experiência e SLAs com o cliente |
| **Samuel AI** | Apresenta resumo do cliente ao Conselho no kickoff interno |

---

## Fluxo operacional

```
Contrato assinado (processo 01)
  ↓
COO cria tenant na Agency Platform
  ↓
Account Manager designado
  ↓
Checklist de onboarding iniciado
  ├── Dados da empresa
  ├── Acessos (GA, Meta, GBP, website)
  ├── Brand assets (logo, guidelines, tom de voz)
  └── Contactos e aprovadores
  ↓
CDO configura Business Twin™ mínimo (Company Brain)
  ↓
Kickoff com cliente (presencial ou video)
  ↓
Plano de 30 dias acordado
  ↓
Handoff para Diagnóstico completo (03) e Planejamento (04)
```

---

## Riscos

- **Atraso por falta de acessos do cliente** — onboarding trava sem credenciais de GA, Meta ou GBP.
- **Business Twin™ incompleto** — execução inicia sem contexto suficiente, gerando retrabalho.
- **Expectativas desalinhadas** — escopo comercial não comunicado claramente na transição.
- **Account Manager sobrecarregado** — onboarding simultâneo de múltiplos clientes degrada qualidade.

---

## Oportunidades

- Checklist padronizado reutilizável para todos os clientes da Influence.
- Template de kickoff com agenda e entregáveis pré-definidos.
- Business Twin™ mínimo como gate obrigatório antes de qualquer execução.
- Onboarding como produto white-label para outras agências da plataforma.
