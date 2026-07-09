# Colors — SF Growth AI

---

## Light Theme (oficial)

Tema padrão para novas telas e materiais.

### Brand

| Token | Hex | Uso |
|-------|-----|-----|
| `--ds-primary` | `#2563EB` | CTAs, links, focus |
| `--ds-primary-hover` | `#1D4ED8` | Hover primary |
| `--ds-primary-soft` | `#EFF6FF` | Fundos de destaque |
| `--ds-secondary` | `#0F172A` | Texto forte, headers |
| `--ds-secondary-soft` | `#1E293B` | Elementos dark accent |

### Semânticas

| Token | Hex | Uso |
|-------|-----|-----|
| `--ds-success` | `#16A34A` | Sucesso, saudável |
| `--ds-success-soft` | `#F0FDF4` | Fundo sucesso |
| `--ds-warning` | `#F59E0B` | Alerta, onboarding |
| `--ds-warning-soft` | `#FFFBEB` | Fundo aviso |
| `--ds-danger` | `#DC2626` | Erro, exclusão |
| `--ds-danger-soft` | `#FEF2F2` | Fundo erro |

### Superfícies

| Token | Hex | Uso |
|-------|-----|-----|
| `--ds-background` | `#F8FAFC` | Fundo de página |
| `--ds-surface` | `#FFFFFF` | Cards, modais |
| `--ds-surface-muted` | `#F1F5F9` | Hover, headers |
| `--ds-border` | `#E2E8F0` | Bordas padrão |
| `--ds-border-strong` | `#CBD5E1` | Hover/focus border |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `--ds-text` | `#0F172A` | Corpo principal |
| `--ds-text-muted` | `#64748B` | Subtítulos |
| `--ds-text-subtle` | `#94A3B8` | Placeholders |
| `--ds-text-inverse` | `#FFFFFF` | Sobre primary |

---

## Dark Theme

Tema para telas legadas e variante futura.

| Token | Hex | Uso |
|-------|-----|-----|
| `--ds-dark-background` | `#050505` | Fundo |
| `--ds-dark-surface` | `rgba(255,255,255,0.03)` | Cards |
| `--ds-dark-surface-muted` | `rgba(255,255,255,0.06)` | Hover |
| `--ds-dark-border` | `rgba(255,255,255,0.08)` | Bordas |
| `--ds-dark-text` | `#FAFAFA` | Texto |
| `--ds-dark-text-muted` | `#A1A1AA` | Muted |
| `--ds-dark-accent` | `#3B82F6` | Ação (legado) |

> Ativação: `[data-theme="dark"]` ou classe `.ds-dark` (roadmap).

---

## Proporção de uso

| Categoria | % |
|-----------|---|
| Background + Surface | 70–80% |
| Text + Border | 15–20% |
| Primary | 5–8% |
| Semânticas | 2–5% |

---

## Acessibilidade

- Texto principal sobre Surface: **7:1** (AAA)
- Text muted sobre Surface: **4.5:1** (AA)
- Primary button text: branco sobre `#2563EB` — AA ✓

---

## Referências

- Brand Book: `brand/03_COLOR_SYSTEM.md`
- Tokens CSS: `styles/design-system/tokens.css`
