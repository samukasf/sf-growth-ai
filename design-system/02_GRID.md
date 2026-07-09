# Grid — SF Growth AI

---

## Sistema base: 8px

Todo espaçamento, dimensão e alinhamento derivam de múltiplos de **8px**.

| Unidade | Valor |
|---------|-------|
| Base unit | 8px |
| Half unit | 4px (uso excepcional: ícones inline, micro-ajustes) |

---

## Grid de colunas

### 12 colunas (desktop)

```
|--|--|--|--|--|--|--|--|--|--|--|--|
```

| Propriedade | Valor |
|-------------|-------|
| Colunas | 12 |
| Gap | 24px (`--ds-grid-gap`) |
| Margem lateral | 24px |

### Classes utilitárias

| Classe | Comportamento |
|--------|---------------|
| `.ds-grid` | `display: grid; gap: 24px` |
| `.ds-grid-12` | 12 colunas iguais |
| `.ds-grid-4` | 4 colunas (stat cards) |
| `.ds-grid-3` | 3 colunas |
| `.ds-grid-2` | 2 colunas |
| `.ds-col-span-12` | Largura total |
| `.ds-col-span-6` | Metade |
| `.ds-col-span-4` | Terço |
| `.ds-col-span-3` | Quarto |

---

## Responsividade do grid

| Breakpoint | Grid 4 col | Grid 3 col | Grid 2 col |
|------------|------------|------------|------------|
| ≥ 1024px | 4 colunas | 3 colunas | 2 colunas |
| 640–1023px | 2 colunas | 2 colunas | 2 colunas |
| < 640px | 1 coluna | 1 coluna | 1 coluna |

---

## Alinhamento

- Conteúdo textual: **left-aligned** (LTR)
- Números em tabelas: **right-aligned** quando comparativos
- Ações de formulário: **right-aligned**
- Empty states: **center-aligned**

---

## Exemplos de uso

| Contexto | Grid |
|----------|------|
| Stat cards (4 KPIs) | `.ds-grid-4` |
| Formulário | `.ds-grid-2` (2 colunas, textarea span 2) |
| Dashboard | `.ds-grid-12` com spans variados |
| Lista de clientes | 1 coluna (stack) |

---

## Implementação

CSS: `styles/design-system/grid.css`
