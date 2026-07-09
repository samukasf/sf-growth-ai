# Empty States — SF Growth AI

---

## Componente: `DsEmptyState`

Import: `@/components/design-system`

---

## Anatomia

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│         [ icon ]              │
│         Title                 │
│         Description           │
│         [ Action Button ]     │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## Especificação

| Elemento | Valor |
|----------|-------|
| Border | 1px dashed `--ds-border` |
| Radius | `--ds-radius-xl` |
| Padding | 48px 24px |
| Background | `--ds-surface` |
| Align | center |
| Icon circle | 48px, bg surface-muted |
| Title | 18px semibold |
| Description | 14px muted, max 384px |

---

## Copy (tom de voz)

| Contexto | Title | Description |
|----------|-------|-------------|
| Sem clientes | Nenhum cliente cadastrado | Comece pelo primeiro. |
| Pesquisa vazia | Nenhum resultado | Ajuste os termos da pesquisa. |
| Sem projetos | Nenhum projeto | Projetos aparecerão aqui. |

---

## Ação opcional

- CTA primary quando há próximo passo claro
- Omitir botão quando não há ação disponível

---

## Ícone

Lucide recomendado: `Inbox`, `Search`, `FolderOpen`

---

## Regras

- ✅ Sempre que lista/tabela pode estar vazia
- ✅ Diferenciar "vazio" de "sem resultados de pesquisa"
- ❌ Empty state genérico sem contexto
- ❌ Ilustrações pesadas

---

## CSS patterns

Class: `.ds-empty`, `.ds-empty-icon`  
File: `styles/design-system/patterns.css`

---

## Implementação

`components/design-system/EmptyState.tsx`
