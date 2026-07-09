# UI Style — SF Growth AI

---

## Princípios de interface

### 1. Uma tela, uma intenção
Cada view responde a uma pergunta clara. Executive Home pergunta: "Por onde começo?" Client List pergunta: "Quem são meus clientes?"

### 2. Progressão natural
O usuário avança em etapas lógicas: Home → Clientes → Detalhes → Supercérebro. Nunca salta etapas sem contexto.

### 3. Valor antes de complexidade
Mostrar o essencial primeiro. Detalhes expandem sob demanda. Dashboards revelam profundidade gradualmente.

### 4. Consistência absoluta
Mesmos componentes, mesmos espaçamentos, mesmos padrões de interação em toda a plataforma.

### 5. Feedback imediato
Toda ação tem resposta visual: loading, sucesso, erro ou empty state. Silêncio é proibido.

---

## Layout padrão

```
┌─────────────────────────────────────────────┐
│ Topbar (logo, empresa, saudação, ações)     │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Content Area                    │
│ (nav)    │  (cards, forms, tables)          │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

| Elemento | Especificação |
|----------|---------------|
| Sidebar width | 256px (`--ds-sidebar-width`) |
| Topbar height | 64px (`--ds-topbar-height`) |
| Content padding | 24px (desktop), 16px (mobile) |
| Max content width | 1280px (`--ds-container-max`) |
| Grid gap | 24px |

---

## Componentes oficiais

Usar exclusivamente componentes `Ds*` do design system:

| Componente | Uso |
|------------|-----|
| `DsButton` | Todas as ações |
| `DsCard` | Containers de conteúdo |
| `DsInput` / `DsTextarea` / `DsSelect` | Formulários |
| `DsBadge` | Status e etiquetas |
| `DsStatCard` / `DsMetricCard` | Métricas e KPIs |
| `DsActionCard` | CTAs com contexto |
| `DsTable` | Dados tabulares |
| `DsSidebar` / `DsTopNavigation` | Layout |
| `DsModal` | Confirmações |
| `DsNotification` | Alertas inline |
| `DsLoading` | Estados de carregamento |
| `DsEmptyState` | Listas vazias |

Referência técnica: `DESIGN_SYSTEM.md`

---

## Padrões de interação

### Formulários
- Labels acima do campo
- Campos obrigatórios marcados com `*`
- Validação inline abaixo do campo
- Botão primário à direita, secundário à esquerda
- Cancelar sempre visível

### Listas
- Pesquisa no topo
- Ordenação ao lado da pesquisa
- Clique na linha abre detalhes
- Contador de resultados no rodapé

### Navegação
- Sidebar: item ativo com fundo Primary Soft
- Breadcrumb implícito via botão "Voltar"
- Placeholders de menu desabilitados visualmente (opacity 40%)

### Ações destrutivas
- Botão Danger (vermelho)
- Confirmação via Modal
- Nunca como ação primária default

---

## Estados de interface

| Estado | Tratamento |
|--------|------------|
| **Loading** | Spinner + label ("A carregar...") |
| **Empty** | Ícone + título + descrição + CTA opcional |
| **Error** | Notification danger + ação de retry |
| **Success** | Notification success, auto-dismiss |
| **Disabled** | Opacity 50%, cursor not-allowed |

---

## Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| ≥ 1280px | Layout completo (sidebar + content) |
| 1024–1279px | Sidebar colapsável |
| 640–1023px | Sidebar oculta, hamburger menu |
| < 640px | Stack vertical, cards full-width |

---

## Dark vs. Light

| Fase | Tema |
|------|------|
| Atual (legado) | Dark theme nas telas existentes |
| Oficial (Brand Book) | Light theme `#F8FAFC` / `#FFFFFF` |
| Futuro | Toggle ou preferência por organização |

Novas telas devem adotar o **light theme oficial** conforme Brand Roadmap.

---

## Acessibilidade mínima

- Contraste AA em todos os textos
- Focus ring visível em elementos interativos
- Labels em todos os inputs
- `aria-*` em modais, loading e notifications
- Navegação por teclado funcional

---

## Anti-padrões de UI

- ❌ Múltiplos CTAs primários na mesma tela
- ❌ Modais sobre modais
- ❌ Tabelas sem empty state
- ❌ Formulários sem feedback de erro
- ❌ Sidebar com mais de 8 itens sem agrupamento
- ❌ Métricas sem label ou contexto
