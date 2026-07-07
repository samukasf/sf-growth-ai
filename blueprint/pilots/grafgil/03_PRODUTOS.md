# Grafgil Digital Twin — Produtos

> **Camada:** Business Twin™ — Catálogo e portfólio  
> **Documento:** `blueprint/pilots/grafgil/03_PRODUTOS.md`

---

## Estado Atual

| Linha | % Receita | Margem bruta | Capacidade/mês |
|---|---|---|---|
| Print Digital (vinil, lona, canvas) | 38% | 44% | ~85 jobs |
| Sinalética (letras, totens, wayfinding) | 32% | 48% | ~55 jobs |
| Decoração Comercial | 12% | 46% | ~25 jobs |
| Stands & Eventos | 14% | 35% | ~18 jobs |
| Promocional (flyers, brindes) | 11% | 40% | ~40 jobs |
| Instalação & Manutenção | 5% | 52% | ~28 instalações |

**Equipamento:** 2 impressoras UV · 1 CNC · 1 plotter · 1 laminadora · 400m² montagem.

Catálogo não existe online. Pricing manual por vendedor. Zero produtos empacotados.

---

## Objetivos

1. Modelar cada linha de produto com specs, tempos, materiais e margem mínima.
2. Criar pacotes empacotados no Executive Knowledge ("Loja Pronta", "Evento Completo").
3. Permitir que Supercérebro valide margem antes de aprovar orçamento.
4. Identificar produtos com margem <25% para descontinuação ou repricing.
5. Habilitar cross-sell automático por segmento de cliente.

---

## Problemas

- Pricing inconsistente — mesma peça orçamentada com 15–25 pp de diferença entre vendedores.
- Stands/eventos frequentemente com margem negativa real.
- Sem matriz produto × material × tempo padrão.
- Cross-sell inexistente (cliente de flyers nunca recebe proposta de sinalética).
- Materiais obsoletos ainda orçamentados.

---

## Gargalos

| Gargalo | Impacto |
|---|---|
| Orçamento manual (3,5h médio) | Comercial gasta 40% do tempo em admin |
| CNC como bottleneck | 30% dos dias com fila de espera |
| Falta de configurator | Cliente não consegue estimativa preliminar |

---

## Oportunidades

- 4 pacotes empacotados com preço e prazo fixos.
- Configurador online de orçamento preliminar (fase 2).
- Linha eco/sustentável (materiais recicláveis).
- Contratos de manutenção de sinalética como produto recorrente.
- Serviço premium: instalação noturna.

---

## Automações possíveis

| Automação | Trigger | Ação |
|---|---|---|
| Validação de margem mínima | Orçamento criado | Bloqueia se margem <30% sem aprovação CEO |
| Sugestão de cross-sell | Cliente identificado | CRO sugere produtos complementares |
| Alerta produto não rentável | Margem <25% em 3 jobs | CFO recomenda repricing ou descontinuação |
| Cálculo de prazo real | Produto + capacidade | COO valida antes de prometer ao cliente |

---

## Indicadores

| KPI | Atual | Meta |
|---|---|---|
| Produtos empacotados | 0 | 4 |
| Tempo médio de orçamento | 3,5h | 45min |
| Cross-sell rate | 8% | 22% |
| Linhas com margem <25% | 2 | 0 |
| Receita de manutenção | €42k/ano | €110k/ano |

---

## Responsáveis

| Função | Responsável |
|---|---|
| Catálogo e pricing | Sofia Gil |
| Specs técnicas e tempos | Paulo Ferreira |
| Margens e rentabilidade | Ana Gil |
| Curadoria no Twin | CBO + Executive Knowledge |
| Validação de novos produtos | Ricardo Gil (CEO) |

---

## Integrações futuras

| Integração | Dados |
|---|---|
| Executive Knowledge | Catálogo vivo: produtos, specs, margens |
| PHC | Custos de materiais, histórico de vendas por produto |
| Configurador web (fase 2) | Pricing dinâmico self-service |
| ERP produção | Tempos reais vs padrão por produto |
