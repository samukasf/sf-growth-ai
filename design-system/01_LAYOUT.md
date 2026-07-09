# Layout — SF Growth AI

---

## Estrutura padrão

```
┌──────────────────────────────────────────────────┐
│ Topbar (64px)                                    │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│ Sidebar    │  Content Area                       │
│ (256px)    │  max-width: 1280px                  │
│            │  padding: 24px                      │
│            │                                     │
└────────────┴─────────────────────────────────────┘
```

---

## Dimensões oficiais

| Token | Valor | Uso |
|-------|-------|-----|
| `--ds-topbar-height` | 64px (8×8) | Barra superior |
| `--ds-sidebar-width` | 256px (8×32) | Navegação lateral |
| `--ds-container-max` | 1280px | Largura máxima do conteúdo |
| `--ds-grid-gap` | 24px (8×3) | Gap padrão entre colunas |

---

## Content area

- Padding horizontal: **24px** (desktop), **16px** (mobile)
- Padding vertical: **24px**
- Conteúdo centralizado com `max-width: 1280px`
- Stack vertical entre seções: **24px** (`--ds-space-6`)

---

## Breakpoints

| Nome | Largura | Comportamento |
|------|---------|---------------|
| `sm` | ≥ 640px | Grid 2 colunas |
| `md` | ≥ 768px | Sidebar colapsável |
| `lg` | ≥ 1024px | Sidebar fixa visível |
| `xl` | ≥ 1280px | Layout completo |

---

## Padrões de página

### Executive Home
- Topbar + Sidebar + Content centralizado
- Uma mensagem hero, um CTA primário, cards de resumo

### Listagem (Clientes, Projetos)
- Topbar + Sidebar + Content com filtros no topo
- Lista ou tabela abaixo

### Detalhe
- Botão "Voltar" + painel de detalhes
- Ações no rodapé ou header do card

### Formulário
- Card único com campos em grid 2 colunas
- Ações alinhadas à direita no rodapé

---

## Z-index

| Camada | Valor | Uso |
|--------|-------|-----|
| Base | 0 | Conteúdo |
| Sticky topbar | 30 | Header fixo |
| Sidebar overlay | 40 | Mobile menu |
| Modal | 50 (`--ds-z-modal`) | Diálogos |
| Notification | 60 (`--ds-z-notification`) | Toasts |

---

## Wrapper obrigatório

Novas telas com design system:

```html
<div class="ds-root bg-[var(--ds-background)] min-h-dvh">
  <!-- layout -->
</div>
```

Referência: `18_COMPONENT_LIBRARY.md`
