# SF Growth AI — Design System

> Story 000.0 · Design System Foundation  
> Base visual oficial para todas as telas futuras da plataforma.

## Princípios

1. **Premium & minimalista** — interfaces limpas, hierarquia clara, sem ruído visual.
2. **Executivo & tecnológico** — tom profissional, confiança e precisão.
3. **Consistência** — tokens e componentes reutilizáveis em toda a plataforma.
4. **Acessibilidade** — contraste adequado, foco visível, semântica HTML correta.
5. **Responsividade** — grid adaptável e componentes fluidos.

Inspirado em: Linear, Stripe, Notion, Vercel e Apple.

---

## Estrutura

```
styles/design-system/
├── index.css        # Entry point
├── tokens.css       # Cores, tipografia, espaçamentos, sombras
├── typography.css   # Classes tipográficas
├── grid.css         # Grid e layout
└── patterns.css     # Modal, notification, loading, empty state

components/design-system/
├── Button.tsx
├── Card.tsx
├── Input.tsx
├── Textarea.tsx
├── Select.tsx
├── Badge.tsx
├── Avatar.tsx
├── Table.tsx
├── Sidebar.tsx
├── TopNavigation.tsx
├── StatCard.tsx
├── MetricCard.tsx
├── ActionCard.tsx
├── Modal.tsx
├── Notification.tsx
├── Loading.tsx
├── EmptyState.tsx
└── index.ts
```

O design system é importado globalmente via `styles/globals.css` sem alterar o tema escuro existente das telas atuais. Os tokens usam prefixo `--ds-*` para evitar conflitos.

---

## Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--ds-primary` | `#2563EB` | Ações principais, links, destaque |
| `--ds-secondary` | `#0F172A` | Texto forte, headers |
| `--ds-success` | `#16A34A` | Confirmações, estados positivos |
| `--ds-warning` | `#F59E0B` | Alertas, atenção |
| `--ds-danger` | `#DC2626` | Erros, ações destrutivas |
| `--ds-background` | `#F8FAFC` | Fundo de página |
| `--ds-surface` | `#FFFFFF` | Cards, painéis |
| `--ds-border` | `#E2E8F0` | Divisores, bordas |

---

## Tipografia

**Fonte oficial:** Inter

| Classe | Tamanho | Peso | Uso |
|--------|---------|------|-----|
| `.ds-display` | 30px | 600 | Títulos hero |
| `.ds-title` | 24px | 600 | Títulos de página |
| `.ds-heading` | 18px | 600 | Títulos de seção |
| `.ds-body` | 16px | 400 | Texto padrão |
| `.ds-body-sm` | 14px | 400 | Texto secundário |
| `.ds-caption` | 12px | 500 | Labels, metadados |
| `.ds-label` | 14px | 500 | Labels de formulário |

---

## Espaçamentos

Escala base (tokens `--ds-space-*`):

| Token | Valor |
|-------|-------|
| `--ds-space-1` | 4px |
| `--ds-space-2` | 8px |
| `--ds-space-3` | 12px |
| `--ds-space-4` | 16px |
| `--ds-space-6` | 24px |
| `--ds-space-8` | 32px |
| `--ds-space-12` | 48px |
| `--ds-space-16` | 64px |

Utilitários de stack: `.ds-stack-2`, `.ds-stack-4`, `.ds-stack-6`.

---

## Grid

- **12 colunas** — `.ds-grid.ds-grid-12`
- **Gap padrão** — `24px` (`--ds-grid-gap`)
- **Container** — `.ds-container` (max-width 1280px)
- **Responsivo** — colunas colapsam em mobile

---

## Componentes

Importação:

```tsx
import { DsButton, DsCard, DsInput } from "@/components/design-system";
```

| Componente | Descrição |
|------------|-----------|
| `DsButton` | Botão com variantes: primary, secondary, ghost, danger |
| `DsCard` | Container base com borda e sombra suave |
| `DsInput` | Campo de texto com label, hint e erro |
| `DsTextarea` | Área de texto multilinha |
| `DsSelect` | Select nativo estilizado |
| `DsBadge` | Etiqueta de status |
| `DsAvatar` | Avatar com iniciais ou imagem |
| `DsTable` | Tabela com header e hover |
| `DsSidebar` | Navegação lateral |
| `DsTopNavigation` | Barra superior |
| `DsStatCard` | Card de estatística simples |
| `DsMetricCard` | Card de métrica com delta/trend |
| `DsActionCard` | Card com CTA |
| `DsModal` | Modal de confirmação |
| `DsNotification` | Alerta inline |
| `DsLoading` | Spinner com label |
| `DsEmptyState` | Estado vazio com ação opcional |

### Exemplo

```tsx
<div className="ds-root bg-[var(--ds-background)] min-h-dvh p-6">
  <DsTopNavigation title="Influence Publicidade" subtitle="Executive Home" />
  <div className="ds-grid ds-grid-4 mt-6">
    <DsStatCard label="Clientes" value={0} />
    <DsStatCard label="Projetos" value={0} />
  </div>
  <DsActionCard
    title="Próximo passo"
    description="Cadastre o primeiro cliente."
    actionLabel="Novo Cliente"
    href="/agency-workspace"
  />
</div>
```

---

## Padrões visuais

### Modais
Classe `.ds-modal-overlay` + `.ds-modal-panel` ou componente `DsModal`.

### Notificações
Classe `.ds-notification` com variantes success, warning, danger.

### Loading
Classe `.ds-loading` + `.ds-spinner` ou componente `DsLoading`.

### Empty States
Classe `.ds-empty` ou componente `DsEmptyState`.

---

## Uso em novas telas

1. Envolva a página com `className="ds-root"` e fundo `bg-[var(--ds-background)]`.
2. Use componentes `Ds*` para manter consistência visual.
3. Referencie tokens `--ds-*` para customizações pontuais.
4. Não altere tokens globais dark existentes (`--background`, `--foreground`) nas telas legadas até migração formal.

---

## Roadmap

- [ ] Migrar Executive Home para design system light
- [ ] Migrar Agency Workspace
- [ ] Tema dark variant (`--ds-*-dark`)
- [ ] Storybook / playground de componentes
