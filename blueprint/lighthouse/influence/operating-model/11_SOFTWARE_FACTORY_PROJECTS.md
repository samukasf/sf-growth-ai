# Influence — Projetos Software Factory

> **Processo:** 11 — Software Factory Projects  
> **Documento:** `blueprint/lighthouse/influence/operating-model/11_SOFTWARE_FACTORY_PROJECTS.md`

---

## Objetivo

Identificar, especificar, desenvolver e implantar soluções de software personalizadas para clientes da Influence — quando o diagnóstico revela necessidade que ferramentas genéricas não resolvem.

---

## Entradas

- Oportunidade identificada no diagnóstico (03) ou upsell (15)
- Business Twin™ e contexto operacional do cliente (Company Brain)
- Especificação funcional aprovada
- Budget e prazo acordados
- Stack e constraints técnicos (CTO)
- Integrações necessárias com sistemas do cliente

---

## Saídas

- Especificação técnica e funcional
- Arquitetura da solução
- Código desenvolvido e testado
- Solução implantada em produção
- Documentação e handoff para manutenção
- Registo na Executive Memory como case de sucesso

---

## Responsáveis

| Papel | Responsabilidade |
|---|---|
| Product Owner (Account Manager) | Requisitos e validação com cliente |
| CTO / Tech Lead | Arquitetura, stack e qualidade técnica |
| Developer(s) | Implementação |
| QA | Testes e aceitação |
| COO | Cronograma e capacidade |
| Cliente (empresário) | Validação funcional e go-live |

---

## KPIs

| KPI | Meta |
|---|---|
| Entrega no prazo | > 85% |
| Bugs críticos pós-implantação | 0 em 60 dias |
| Adoção pelo cliente (se aplicável) | > 70% em 90 dias |
| ROI documentado | Positivo em 12 meses |
| Reutilização de componentes | > 40% do código base |

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Detecção de oportunidade | Diagnóstico concluído | CSO sugere projeto software se gap identificado |
| Geração de spec | Oportunidade validada | Software Factory gera especificação inicial |
| Validação de arquitetura | Spec aprovada | CTO revisa e aprova stack |
| Pipeline CI/CD | Commit em branch | Testes automáticos e deploy staging |
| Alerta de desvio | Sprint > 20% atrasado | COO escala para Account Manager |

---

## IA responsável

| Executivo | Atuação |
|---|---|
| **CTO** | Arquitetura, stack, segurança e qualidade de código |
| **CSO** | Valida fit estratégico e ROI do projeto |
| **CFO** | Aprova investimento e modelo de pricing |
| **COO** | Orquestra sprints e entregáveis |
| **CDO** | Garante integração com Business Twin™ e dados |
| **Samuel AI** | Sintetiza progresso e recomenda go/no-go |

---

## Fluxo operacional

```
Oportunidade identificada (03 · 15 · Executive Inbox)
  ↓
Validação comercial e técnica (CRO + CTO + CFO)
  ↓
Especificação funcional elaborada
  ↓
Arquitetura e estimativa (Software Factory)
  ↓
Aprovação do cliente e contrato adicional
  ↓
Desenvolvimento em sprints
  ↓
QA e homologação com cliente
  ↓
Deploy em produção
  ↓
Monitorização 60 dias → manutenção ou evolução
  ↓
Case registado na Memory para reutilização
```

---

## Riscos

- **Projeto mal scoped** — expectativas do cliente excedem budget e prazo.
- **Stack proprietária** — solução não reutilizável para outros clientes.
- **Dependência de integrações legadas** — APIs instáveis do cliente bloqueiam entrega.
- **Falta de adoção** — software entregue mas não utilizado pelo cliente.

---

## Oportunidades

- Software Factory como diferencial competitivo da Influence vs. agências tradicionais.
- Componentes reutilizáveis entre clientes (portals, dashboards, automações).
- Projetos software como receita de alto valor e margem superior.
- Alinhamento direto com `core/software-factory/` da plataforma SF Growth AI.
