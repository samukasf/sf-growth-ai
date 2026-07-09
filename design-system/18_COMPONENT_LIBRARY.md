# Component Library — SF Growth AI

---

## Visão geral

Biblioteca oficial de componentes React e tokens CSS do SF Growth AI.

| Camada | Localização |
|--------|-------------|
| Documentação | `design-system/` (este diretório) |
| Tokens CSS | `styles/design-system/` |
| Componentes React | `components/design-system/` |
| Referência rápida | `DESIGN_SYSTEM.md` |

---

## Import

```tsx
import {
  DsButton,
  DsCard,
  DsInput,
  DsTextarea,
  DsSelect,
  DsBadge,
  DsAvatar,
  DsTable,
  DsSidebar,
  DsTopNavigation,
  DsStatCard,
  DsMetricCard,
  DsActionCard,
  DsModal,
  DsNotification,
  DsLoading,
  DsEmptyState,
} from "@/components/design-system";
```

---

## Catálogo completo

| # | Componente | Doc | Status |
|---|------------|-----|--------|
| 1 | `DsButton` | `07_BUTTONS.md` | ✅ |
| 2 | `DsCard` | `09_CARDS.md` | ✅ |
| 3 | `DsInput` | `08_INPUTS.md` | ✅ |
| 4 | `DsTextarea` | `08_INPUTS.md` | ✅ |
| 5 | `DsSelect` | `08_INPUTS.md` | ✅ |
| 6 | `DsBadge` | `13_BADGES.md` | ✅ |
| 7 | `DsAvatar` | — | ✅ |
| 8 | `DsTable` | `10_TABLES.md` | ✅ |
| 9 | `DsSidebar` | `11_SIDEBAR.md` | ✅ |
| 10 | `DsTopNavigation` | `12_TOPBAR.md` | ✅ |
| 11 | `DsStatCard` | `09_CARDS.md` | ✅ |
| 12 | `DsMetricCard` | `09_CARDS.md` | ✅ |
| 13 | `DsActionCard` | `09_CARDS.md` | ✅ |
| 14 | `DsModal` | `14_MODALS.md` | ✅ |
| 15 | `DsNotification` | `15_NOTIFICATIONS.md` | ✅ |
| 16 | `DsLoading` | `17_LOADING.md` | ✅ |
| 17 | `DsEmptyState` | `16_EMPTY_STATES.md` | ✅ |

---

## Tokens globais

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--ds-radius-sm` | 6px | Micro elementos |
| `--ds-radius-md` | 8px | Buttons, inputs |
| `--ds-radius-lg` | 12px | Notifications |
| `--ds-radius-xl` | 16px | Cards, modals |
| `--ds-radius-full` | 9999px | Badges, avatars |

### Shadows

| Token | Valor | Uso |
|-------|-------|-----|
| `--ds-shadow-xs` | `0 1px 2px rgba(15,23,42,0.04)` | Buttons |
| `--ds-shadow-sm` | `0 1px 3px + 0 1px 2px` | Cards |
| `--ds-shadow-md` | `0 4px 12px rgba(15,23,42,0.08)` | Dropdowns |
| `--ds-shadow-lg` | `0 12px 32px rgba(15,23,42,0.1)` | Modals |

### Motion

| Token | Valor |
|-------|-------|
| `--ds-transition` | 150ms cubic-bezier(0.4, 0, 0.2, 1) |

---

## Temas

### Light (oficial)

```css
background: var(--ds-background);  /* #F8FAFC */
color: var(--ds-text);               /* #0F172A */
```

### Dark (legado / futuro)

```css
background: var(--ds-dark-background);  /* #050505 */
color: var(--ds-dark-text);             /* #FAFAFA */
```

Ativação futura: `data-theme="dark"` no root.

---

## Tipografia & Ícones

| Recurso | Especificação |
|---------|---------------|
| Font | **Inter** — `05_TYPOGRAPHY.md` |
| Icons | **Lucide Icons** — `06_ICONS.md` |
| Grid | **8px base** — `02_GRID.md`, `03_SPACING.md` |

---

## Página mínima de exemplo

```tsx
<div className="ds-root flex min-h-dvh bg-[var(--ds-background)]">
  <DsSidebar title="SF Growth AI" items={[...]} />
  <div className="flex flex-1 flex-col">
    <DsTopNavigation title="Influence Publicidade" subtitle="Executive Home" />
    <main className="ds-container ds-section">
      <div className="ds-grid ds-grid-4">
        <DsStatCard label="Clientes" value={0} />
        <DsStatCard label="Projetos" value={0} />
      </div>
      <DsActionCard
        title="Próximo passo"
        description="Cadastre o primeiro cliente."
        actionLabel="Novo Cliente"
        href="/agency-workspace"
      />
    </main>
  </div>
</div>
```

---

## Roadmap da biblioteca

| Fase | Entrega |
|------|---------|
| ✅ Foundation | Tokens + 17 componentes |
| 🔲 Lucide integration | Instalar `lucide-react` |
| 🔲 Storybook | Playground visual |
| 🔲 Dark theme tokens | `[data-theme="dark"]` |
| 🔲 Combobox, Tabs, Tooltip | Componentes avançados |
| 🔲 Migration | Telas legadas → light theme |

---

## Documentação relacionada

| Doc | Path |
|-----|------|
| Design Principles | `00_DESIGN_PRINCIPLES.md` |
| Brand Book | `brand/` |
| Design System (técnico) | `DESIGN_SYSTEM.md` |
