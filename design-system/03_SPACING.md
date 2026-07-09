# Spacing — SF Growth AI

---

## Escala 8px

Todos os espaçamentos seguem múltiplos de 4px/8px.

| Token | Valor | Multiplicador | Uso típico |
|-------|-------|---------------|------------|
| `--ds-space-1` | 4px | 0.5× | Gap mínimo, ícone inline |
| `--ds-space-2` | 8px | 1× | Gap entre ícone e texto |
| `--ds-space-3` | 12px | 1.5× | Padding interno compacto |
| `--ds-space-4` | 16px | 2× | Padding de card sm |
| `--ds-space-5` | 20px | 2.5× | — |
| `--ds-space-6` | 24px | 3× | Gap de seção, padding md |
| `--ds-space-8` | 32px | 4× | Padding de card lg |
| `--ds-space-10` | 40px | 5× | — |
| `--ds-space-12` | 48px | 6× | Empty state padding |
| `--ds-space-16` | 64px | 8× | Seções hero |

---

## Regras de aplicação

### Padding interno (cards)
| Tamanho | Padding |
|---------|---------|
| sm | 16px |
| md | 20px |
| lg | 24px |

### Gap entre elementos
| Relação | Gap |
|---------|-----|
| Label → Input | 6px (12px token -2px visual) |
| Input → Input (form) | 16px |
| Card → Card | 24px |
| Seção → Seção | 24–32px |

### Stack utilities
| Classe | Gap |
|--------|-----|
| `.ds-stack-2` | 8px |
| `.ds-stack-3` | 12px |
| `.ds-stack-4` | 16px |
| `.ds-stack-6` | 24px |

---

## Margens de página

| Contexto | Valor |
|----------|-------|
| Mobile padding | 16px |
| Desktop padding | 24px |
| Container max | 1280px centered |

---

## Proibido

- ❌ Valores arbitrários (13px, 27px, 35px)
- ❌ Margens negativas em componentes do DS
- ❌ Padding inconsistente entre cards do mesmo tipo

---

## Implementação

Tokens: `styles/design-system/tokens.css`
