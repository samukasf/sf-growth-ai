# Loading — SF Growth AI

---

## Componente: `DsLoading`

Import: `@/components/design-system`

---

## Variantes

| Modo | Uso |
|------|-----|
| Inline | Dentro de botão ou seção |
| Full screen | Carregamento de página (`fullScreen`) |

---

## Anatomia

```
[ spinner ]  A carregar...
```

---

## Especificação

| Elemento | Valor |
|----------|-------|
| Spinner size | 16px |
| Spinner border | 2px, top color primary |
| Animation | 0.7s linear infinite |
| Label | 14px muted |
| Gap | 12px |
| Full screen bg | background 80% + blur |

---

## Copy padrão

| Contexto | Label |
|----------|-------|
| Genérico | A carregar... |
| Salvando | A guardar... |
| Pesquisando | A pesquisar... |

---

## Acessibilidade

- `role="status"`
- `aria-live="polite"`
- Spinner: `aria-hidden="true"`

---

## Regras

- ✅ Loading em toda operação async > 300ms
- ✅ Desabilitar botão durante submit
- ❌ Loading sem label
- ❌ Skeleton screens (roadmap, não MVP)

---

## Lucide alternativo

`Loader2` com `animate-spin` quando Lucide instalado.

---

## CSS patterns

Classes: `.ds-loading`, `.ds-spinner`  
File: `styles/design-system/patterns.css`

---

## Implementação

`components/design-system/Loading.tsx`
