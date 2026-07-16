# SF Growth AI — Roadmap

> Versão: 1.0  
> Sprint: 45A — Project Foundation  
> Data: Julho 2026  
> Status: Documentação oficial de evolução

---

## Visão do Roadmap

O SF Growth AI evolui em seis fases progressivas — de workspace executivo funcional a sistema operacional empresarial completo. Cada fase constrói sobre a anterior, aumentando autonomia, inteligência e capacidade de execução.

```
Fase 1                Fase 2              Fase 3
Executive Workspace → Company Brain    → Executive Intelligence
     │                      │                    │
     ▼                      ▼                    ▼
Fase 4                Fase 5              Fase 6
Executive Innovation → AI Software Factory → Enterprise OS
```

---

## Fase 1 — Executive Workspace

**Status:** Em andamento (protótipo avançado)

### Objetivo

Estabelecer a interface executiva principal e o pipeline SSR de engines como fundação do produto.

### Entregas

- [x] Rota `/samuel-ai` com pipeline SSR completo
- [x] 13 Executive Engines em sequência determinística
- [x] 12 Executive Modules (negócio + integrações)
- [x] Executive Watchers (Core, Market, SEO)
- [x] Executive Inbox como centro de comando
- [x] Executive Workspace com 19 seções de navegação
- [x] Dashboard executivo com seções especializadas
- [x] Chat com Samuel AI ligado ao Samuel Runtime e Responses API
- [x] Integrações: Google Analytics, Search Console, Google Business, Meta
- [x] Supabase como fonte de dados primária

### Pendências

- [x] Persistência da Executive Inbox com fallback local e sincronização remota
- [x] AI Provider real no chat e orquestrador
- [x] Market Watcher com dados reais (NewsAPI + memórias/contexto; sem mock)
- [x] LinkedIn integration (API live via token de servidor)
- [x] Onboarding e rotas de produto além de `/samuel-ai` (`/login`, `/onboarding`, connects)
- [x] CRM na navegação do Workspace
- [x] Remover modo demonstração das integrações (empty state honesto + OAuth Google/Meta)
- [ ] Popular tokens/contas em produção (ver `SETUP.md`)
- [ ] Unificar GA/GBP/GSC no mesmo OAuth Google Workspace

### Critério de conclusão

Produto demonstrável comercialmente com dados reais em todas as seções visíveis, chat funcional com LLM e persistência de ações.

---

## Fase 2 — Company Brain

**Status:** Especificado

### Objetivo

Unificar toda a inteligência executiva em uma camada organizacional coerente — o Company Brain.

### Entregas

- [ ] Arquitetura do Company Brain integrada ao pipeline SSR
- [ ] Grafo de decisão unificando engines, módulos e watchers
- [ ] Executive Memory em produção (lifecycle, scoring, persistência)
- [ ] Executive Knowledge com retrieval funcional
- [ ] Sincronização Business Twin™ com Company Brain
- [ ] API interna de consulta ao cérebro organizacional
- [ ] Dashboard de saúde do Company Brain

### Dependências

- Fase 1 concluída (pipeline SSR estável)
- Schema de memória e conhecimento no Supabase
- AI Provider Layer básica

### Critério de conclusão

Samuel AI consulta Company Brain antes de cada resposta; memória persiste entre sessões; conhecimento é reutilizado em decisões.

---

## Fase 3 — Executive Intelligence

**Status:** Planejado

### Objetivo

Elevar o raciocínio executivo de heurísticas para inteligência real — com LLMs, pesquisa externa e análise profunda.

### Entregas

- [ ] AI Provider Layer com roteamento multi-modelo
- [ ] Reasoning Engine com LLM (hipóteses, evidências, conclusões reais)
- [ ] Conselho Executivo com personalidades e domínios especializados
- [ ] Pesquisa externa automatizada (mercado, concorrentes, tendências)
- [ ] Competitor Engine com dados reais
- [ ] Forecast Engine com modelos preditivos
- [ ] Learning Engine com feedback loop de resultados
- [ ] Executive Wisdom — padrões derivados de experiência acumulada

### Dependências

- Fase 2 concluída (Company Brain operacional)
- Contratos com provedores de IA
- Infraestrutura de pesquisa externa

### Critério de conclusão

Respostas do Samuel AI são geradas por raciocínio real, consultam especialistas com LLM e melhoram com cada interação.

---

## Fase 4 — Executive Innovation

**Status:** Planejado

### Objetivo

Transformar o SF Growth AI de sistema reativo em sistema proativo — detectando oportunidades, inovando estratégias e executando autonomamente.

### Entregas

- [ ] Opportunity Engine — detecção proativa de oportunidades
- [ ] Watchers autônomos com triggers e ações automáticas
- [ ] Execution Engine — geração de assets (posts, campanhas, relatórios)
- [ ] Growth Score Engine — cálculo de maturidade 0–1000
- [ ] Decision Engine — próxima melhor ação com impacto mensurável
- [ ] Automações executivas (agendamento, publicação, relatórios)
- [ ] Simulação de cenários (what-if analysis)
- [ ] Alertas preditivos e missões diárias

### Dependências

- Fase 3 concluída (inteligência real)
- Integrações de execução (Meta Ads API, Google Ads, email)
- Métricas de resultado para feedback loop

### Critério de conclusão

O sistema detecta oportunidades antes do usuário perguntar, executa ações automaticamente e mede resultados.

---

## Fase 5 — AI Software Factory

**Status:** Visão documentada

### Objetivo

Capacitar o Samuel AI de identificar necessidades de software, projetar soluções e produzi-las autonomamente.

### Entregas

- [ ] Identificação automática de oportunidades de software
- [ ] Geração de especificações e arquitetura
- [ ] Coordenação de agentes especializados (design, backend, frontend, QA)
- [ ] Geração de código e testes automatizados
- [ ] Pipeline de deploy e monitoramento
- [ ] Acompanhamento de resultados pós-implantação

Ver [SOFTWARE_FACTORY.md](./SOFTWARE_FACTORY.md) para detalhes.

### Dependências

- Fase 4 concluída (execução autônoma)
- Infraestrutura de CI/CD para projetos gerados
- Sandbox de execução seguro para código gerado

### Critério de conclusão

Samuel AI identifica uma necessidade, gera especificação, produz aplicação funcional, implanta e monitora resultados — com supervisão humana.

---

## Fase 6 — Enterprise Operating System

**Status:** Visão de longo prazo

### Objetivo

Posicionar o SF Growth AI como o sistema operacional completo para PMEs — substituindo dezenas de ferramentas fragmentadas por uma plataforma unificada de inteligência e execução.

### Entregas

- [ ] Multi-tenant com isolamento completo por empresa
- [ ] Marketplace de módulos e integrações
- [ ] API pública para ecossistema de parceiros
- [ ] White-label para consultorias e franquias
- [ ] Mobile app executivo
- [ ] Compliance e segurança enterprise (SOC 2, LGPD, GDPR)
- [ ] Billing e planos comerciais
- [ ] Analytics de plataforma e métricas de negócio
- [ ] Onboarding inteligente com diagnóstico automático
- [ ] Central de Crescimento como home page do produto

### Dependências

- Fases 1–5 concluídas
- Infraestrutura cloud escalável
- Equipe comercial e de suporte

### Critério de conclusão

Milhares de empresas operando no SF Growth AI como sistema principal de gestão, crescimento e inteligência executiva.

---

## Cronograma Indicativo

| Fase | Período estimado | Marco |
|---|---|---|
| Fase 1 — Executive Workspace | Q3 2026 | Produto demonstrável |
| Fase 2 — Company Brain | Q4 2026 | Memória e conhecimento em produção |
| Fase 3 — Executive Intelligence | Q1–Q2 2027 | IA real em todas as decisões |
| Fase 4 — Executive Innovation | Q3–Q4 2027 | Autonomia e execução proativa |
| Fase 5 — AI Software Factory | 2028 | Geração autônoma de software |
| Fase 6 — Enterprise OS | 2028–2029 | Escala global |

> Os prazos são indicativos e serão refinados conforme progresso e prioridades de negócio.

---

## Documentos Relacionados

- [VISION.md](./VISION.md) — Visão estratégica
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitetura técnica
- [COMPANY_BRAIN.md](./COMPANY_BRAIN.md) — Fase 2 em detalhe
- [SOFTWARE_FACTORY.md](./SOFTWARE_FACTORY.md) — Fase 5 em detalhe
- `docs/00-master/SF_GROWTH_AI_3_YEAR_VISION.md` — Visão de 3 anos
