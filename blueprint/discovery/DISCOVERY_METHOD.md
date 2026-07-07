# Discovery Method — Como o Samuel Conhece uma Empresa

> **Projeto:** Piloto G02 — Grafgil Knowledge Acquisition  
> **Documento:** `blueprint/discovery/DISCOVERY_METHOD.md`  
> **Versão:** 1.0 · Julho 2026

---

## Propósito

Este documento descreve o **método oficial de descoberta empresarial** do SF Growth AI — o processo pelo qual Samuel AI conhece profundamente uma organização antes de administrá-la.

O módulo `core/company-discovery/` implementa esta arquitetura. Nenhuma API real é integrada nesta fase — apenas estrutura, fluxo e fontes preparadas.

---

## Princípio fundamental

> Samuel AI não pode administrar o que não conhece.  
> A descoberta empresarial é o primeiro passo obrigatório antes de ativar o Supercérebro.

---

## Visão geral do fluxo

```
Empresário inicia descoberta
        ↓
DiscoveryStarted
        ↓
Coleta multi-fonte (12 fontes preparadas)
        ↓
Análise e normalização de achados
        ↓
Construção do CompanyProfile (Business Twin™)
        ↓
Deteção de lacunas (GapDetected)
        ↓
Deteção de oportunidades (OpportunityDetected)
        ↓
Geração de score e relatório
        ↓
BusinessProfileUpdated
        ↓
DiscoveryCompleted
        ↓
Sincronização com engines executivos
```

---

## Passo a passo

### Passo 1 — Iniciar sessão de descoberta

**Quem:** CEO / empresário via Samuel AI  
**Engine:** `CompanyDiscoveryEngine.startDiscovery()`  
**Evento:** `DiscoveryStarted`

O empresário fornece:
- Nome da empresa
- Organization ID e Company ID
- Fontes a utilizar (default: todas as 12)

O sistema cria:
- `DiscoverySession` — sessão de descoberta
- `DiscoveryQuestionnaire` — questionário base com 5 perguntas essenciais
- Registo na `OrganizationBrain`

---

### Passo 2 — Coordenação de fontes

**Engine:** `DiscoveryCoordinator`  
**Entidade:** `DiscoverySource`

O coordenador itera pelas fontes solicitadas e delega a cada `DiscoverySourceProvider`:

| # | Fonte | Tipo | Dados esperados |
|---|---|---|---|
| 1 | Website | `website` | Nome, setor, serviços |
| 2 | Google Business | `google_business` | Localização, avaliações |
| 3 | Facebook | `facebook` | Presença social, seguidores |
| 4 | Instagram | `instagram` | Portfólio visual, engajamento |
| 5 | LinkedIn | `linkedin` | Colaboradores, posicionamento B2B |
| 6 | CRM | `crm` | Clientes, pipeline, recorrência |
| 7 | ERP | `erp` | Faturação, margens, stocks |
| 8 | Documentos | `documents` | Processos, contratos, SOPs |
| 9 | Funcionários | `employees` | Headcount, departamentos |
| 10 | Questionários | `questionnaires` | Respostas estruturadas |
| 11 | Entrevistas | `interviews` | Conhecimento tribal, gargalos |
| 12 | Arquivos enviados | `uploaded_files` | Catálogos, relatórios, planilhas |

Cada fonte produz `DiscoveryFinding`(s) com categoria, confiança e valor.

**Nota:** Nesta sprint, fontes usam dados preparados (templates). Integrações reais serão adicionadas em sprints futuras.

---

### Passo 3 — Análise de achados

**Engine:** `DiscoveryAnalyzer`

- Deduplica achados por categoria + chave
- Calcula confiança média
- Identifica categorias cobertas
- Normaliza dados para perfilagem

---

### Passo 4 — Construção do perfil empresarial

**Engine:** `BusinessProfiler`  
**Entidade:** `CompanyProfile`  
**Evento:** `BusinessProfileUpdated`

O profiler agrupa achados em secções:

| Secção | Categorias |
|---|---|
| Identidade | identity, market |
| Produtos | products |
| Clientes | customers |
| Operações | operations, processes |
| Finanças | finance |
| Comercial | commercial, sales |
| Tecnologia | technology |

Calcula **completeness score** (% de secções cobertas).

---

### Passo 5 — Análise de lacunas

**Engine:** `GapAnalyzer`  
**Entidade:** `DiscoveryGap`  
**Evento:** `GapDetected`

Detecta:
- Secções obrigatórias sem dados
- Secções com confiança < 50%
- Cobertura total insuficiente (< 10 achados)

Cada lacuna inclui severidade, impacto e recomendação.

---

### Passo 6 — Deteção de oportunidades

**Engine:** `OpportunityDetector`  
**Entidade:** `DiscoveryOpportunity`  
**Evento:** `OpportunityDetected`

Identifica oportunidades como:
- Estruturar pipeline comercial
- Automatizar processos operacionais
- Integrar sistemas existentes
- Ativar Business Twin™ completo

Cada oportunidade inclui prioridade, impacto estimado e ROI.

---

### Passo 7 — Score e relatório

**Entidade:** `DiscoveryScore`  
**Engine:** `DiscoveryReporter`

Gera:
- Score geral (0–100)
- Dimensões ponderadas (identidade, operações, comercial, finanças)
- Profile completeness, data quality, readiness score
- Relatório com resumo e próximos passos

---

### Passo 8 — Conclusão e sincronização

**Evento:** `DiscoveryCompleted`

Sincroniza com engines executivos (quando disponíveis):

| Engine | Dados sincronizados |
|---|---|
| **Enterprise Brain** | CompanyProfile completo |
| **Organization Brain** | Registo organizacional |
| **Executive Memory** | Insights e aprendizados |
| **Executive Knowledge** | Perfil como base de conhecimento |
| **Executive Innovation** | Oportunidades detectadas |
| **Executive Project Generator** | Projetos a partir de lacunas |

---

## Arquitetura do módulo

```
core/company-discovery/
├── domain/
│   ├── entities/          # 8 entidades
│   ├── events/            # 5 eventos
│   └── ports/             # 7 engines + repository
├── application/
│   ├── use-cases/         # start + run pipeline
│   ├── services/          # CompanyDiscoveryEngineService
│   └── ports/integration/ # 6 integrações futuras
├── infrastructure/
│   ├── data-sources/      # 12 fontes preparadas
│   ├── services/          # 7 implementações default
│   ├── persistence/       # InMemoryDiscoveryRepository
│   └── factories/         # createCompanyDiscovery()
└── shared/
    ├── types/             # IDs, scores, result
    ├── events/            # DomainEvent base
    └── errors/            # Erros de domínio
```

---

## Como usar (código)

```typescript
import { createCompanyDiscovery } from "@/core/company-discovery";

const discovery = createCompanyDiscovery();

// 1. Iniciar descoberta
const { session } = await discovery.startDiscovery({
  organizationId: "org-grafgil",
  companyId: "grafgil",
  companyName: "Grafgil Comunicação Visual",
  initiatedBy: "ricardo-gil",
});

// 2. Executar pipeline completo
const result = await discovery.runDiscovery({
  sessionId: session.id,
  context: { enableAllSources: true },
});

// 3. Consultar perfil e relatório
const profile = await discovery.getProfile("grafgil");
const report = await discovery.getReport(session.id);
```

---

## Reutilização

Este módulo é **agnóstico de organização**. Qualquer empresa pode ser descoberta:

1. Criar `DiscoverySession` com IDs da organização
2. Configurar fontes disponíveis via `context`
3. Executar pipeline
4. Perfil alimenta o Supercérebro

Para a Grafgil (Piloto G01), as fontes preparadas já incluem dados do blueprint `blueprint/pilots/grafgil/`.

---

## Evolução futura

| Fase | Entrega |
|---|---|
| **Atual (G02)** | Arquitetura + fluxo + fontes preparadas |
| **G03** | Integração PHC (ERP) e website |
| **G04** | Questionários interativos na UI |
| **G05** | Entrevistas guiadas por Samuel AI |
| **G06** | APIs sociais (Google, LinkedIn, Instagram) |
| **G07** | Descoberta contínua (watchers de mudança) |

---

## Relação com o Gêmeo Digital

| Camada | Documento Twin | Alimentado por |
|---|---|---|
| Empresa | `00_EMPRESA.md` | DiscoverySession + CompanyProfile |
| Identidade | `01_IDENTIDADE.md` | website, linkedin, documents |
| Produtos | `03_PRODUTOS.md` | erp, uploaded_files |
| Clientes | `04_CLIENTES.md` | crm, questionnaires |
| Finanças | `11_FINANCEIRO.md` | erp, documents |
| Oportunidades | `17_OPORTUNIDADES.md` | OpportunityDetector |
| Supercérebro | `19_SUPERCEREBRO.md` | DiscoveryCompleted → sync |

---

> *"Antes de administrar, conhecer. Antes de decidir, descobrir."*  
> — Método de Descoberta Empresarial, SF Growth AI
