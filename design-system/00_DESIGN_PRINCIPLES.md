# Design Principles — SF Growth AI

> Product Design Phase · Task 02 — Design System  
> Fundamentos que governam todas as decisões visuais da plataforma.

---

## Propósito

O Design System SF Growth AI traduz a promessa da marca — **Toda empresa precisa de um Supercérebro** — em uma linguagem visual consistente, premium e executiva.

---

## Princípios

### 1. Clareza acima de tudo
Uma intenção por tela. Hierarquia tipográfica guia o olhar. Ruído visual é eliminado.

### 2. Premium minimalista
Whitespace generoso. Elementos essenciais apenas. Qualidade percebida em cada pixel.

### 3. Executivo e tecnológico
Tom de boardroom, não de startup ruidosa. Precisão geométrica. Confiança visual.

### 4. Consistência sistémica
Tokens, componentes e padrões reutilizáveis. Nenhuma tela inventa UI ad-hoc.

### 5. Acessibilidade por padrão
Contraste AA mínimo. Focus visível. Semântica HTML correta. Navegação por teclado.

### 6. Responsividade fluida
Mobile-first na estrutura. Desktop expande capacidade, não complexidade.

### 7. Tema consciente
Light theme oficial para novas telas. Dark theme para legado e preferência futura.

---

## Referências visuais

| Referência | Absorver |
|------------|----------|
| **Apple** | Restrição, acabamento, foco |
| **Linear** | Precisão, velocidade, tipografia |
| **Stripe** | Confiança, documentação limpa |
| **Notion** | Simplicidade, hierarquia de conteúdo |
| **Vercel** | Premium developer, dark/light balance |

---

## Stack visual oficial

| Elemento | Escolha |
|----------|---------|
| Tipografia | **Inter** |
| Ícones | **Lucide Icons** |
| Grid base | **8px** |
| Tema padrão | **Light** |
| Tema alternativo | **Dark** |

---

## Relação com outros documentos

| Documento | Função |
|-----------|--------|
| `brand/` | Identidade, tom, percepção |
| `design-system/` | Especificação visual detalhada (este diretório) |
| `styles/design-system/` | Implementação CSS (tokens) |
| `components/design-system/` | Implementação React (componentes) |
| `DESIGN_SYSTEM.md` | Referência técnica rápida |

---

## Checklist de decisão

Antes de criar qualquer elemento visual:

- [ ] Serve a uma intenção clara?
- [ ] Usa tokens oficiais?
- [ ] Existe componente `Ds*` equivalente?
- [ ] Funciona em mobile?
- [ ] Contraste AA verificado?
- [ ] Alinhado ao Brand Book?
