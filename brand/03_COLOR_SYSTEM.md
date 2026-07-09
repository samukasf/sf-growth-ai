# Color System — SF Growth AI

---

## Princípios

A paleta SF Growth AI transmite **confiança executiva**, **clareza tecnológica** e **premium minimalismo**.

- Fundos claros para legibilidade e sensação de espaço
- Azul primary como cor de inteligência e ação
- Slate secondary como âncora de seriedade
- Cores semânticas discretas, nunca saturadas em excesso

---

## Paleta oficial

### Primary — Inteligência & Ação

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#2563EB` | CTAs, links, destaque, símbolo SF |
| Primary Hover | `#1D4ED8` | Hover de botões primary |
| Primary Soft | `#EFF6FF` | Fundos de destaque, badges, símbolo SF |

### Secondary — Autoridade & Texto

| Token | Hex | Uso |
|-------|-----|-----|
| Secondary | `#0F172A` | Títulos, texto principal forte |
| Secondary Soft | `#1E293B` | Elementos escuros, dark mode futuro |

### Semânticas

| Token | Hex | Uso |
|-------|-----|-----|
| Success | `#16A34A` | Confirmações, estados saudáveis, progresso |
| Success Soft | `#F0FDF4` | Fundos de sucesso |
| Warning | `#F59E0B` | Alertas, atenção, onboarding |
| Warning Soft | `#FFFBEB` | Fundos de aviso |
| Danger | `#DC2626` | Erros, exclusão, riscos críticos |
| Danger Soft | `#FEF2F2` | Fundos de erro |

### Superfícies

| Token | Hex | Uso |
|-------|-----|-----|
| Background | `#F8FAFC` | Fundo de página |
| Surface | `#FFFFFF` | Cards, modais, painéis |
| Surface Muted | `#F1F5F9` | Headers de tabela, hover sutil |
| Border | `#E2E8F0` | Divisores, bordas de cards |
| Border Strong | `#CBD5E1` | Bordas em hover/focus |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| Text | `#0F172A` | Corpo principal |
| Text Muted | `#64748B` | Subtítulos, metadados |
| Text Subtle | `#94A3B8` | Placeholders, hints |
| Text Inverse | `#FFFFFF` | Texto sobre primary/dark |

---

## Proporção de uso

| Categoria | % recomendado |
|-----------|---------------|
| Background + Surface | 70–80% |
| Text + Border | 15–20% |
| Primary | 5–8% |
| Semânticas | 2–5% (apenas quando necessário) |

---

## Contraste e acessibilidade

- Texto principal sobre Surface: ratio mínimo **7:1** (AAA)
- Texto muted sobre Surface: ratio mínimo **4.5:1** (AA)
- Primary sobre branco: usar apenas para elementos interativos ≥ 14px bold ou 18px regular
- Nunca usar Warning ou Danger como cor de texto longo

---

## Modo escuro (futuro)

Reservado para telas legadas e variante dark do design system:

| Token dark | Hex |
|------------|-----|
| Background | `#050505` |
| Surface | `rgba(255,255,255,0.03)` |
| Border | `rgba(255,255,255,0.08)` |
| Accent | `#3B82F6` |

> Migração para light theme oficial ocorrerá gradualmente conforme Brand Roadmap.

---

## Associações de marca

| Cor | Sensação |
|-----|----------|
| Primary `#2563EB` | Confiança, tecnologia, clareza |
| Secondary `#0F172A` | Autoridade, seriedade, executivo |
| Background `#F8FAFC` | Espaço, calma, premium |
| Success `#16A34A` | Saúde empresarial, progresso |
| Warning `#F59E0B` | Atenção sem alarme |

---

## Implementação técnica

Tokens CSS com prefixo `--ds-*` em `styles/design-system/tokens.css`.

Referência completa: `DESIGN_SYSTEM.md`
