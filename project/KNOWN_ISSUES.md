# KNOWN ISSUES — SF Growth AI

## Objetivo

Rastrear problemas conhecidos, débitos técnicos e bloqueios ativos. Evitar redescoberta de issues entre sprints, agentes de IA e desenvolvedores.

## Status

| Campo | Valor |
|-------|-------|
| **Status** | Ativo |
| **Última atualização** | 2026-07-11 |
| **Responsável** | Engenharia |

---

## Issues ativas

| ID | Severidade | Descrição | Workaround | Story / Sprint |
|----|------------|-----------|------------|----------------|
| KI-001 | Baixa | Documentação legada em `docs/00-master/`, `docs/03-architecture/` duplica conteúdo do novo OS | Usar `docs/VISION.md`, `docs/ARCHITECTURE.md` como fonte | 000.2 |
| KI-002 | Baixa | `.next/` no working tree (build artifacts) | Adicionar ao `.gitignore` se necessário | — |
| KI-003 | Média | Deploy não configurado | Desenvolvimento local apenas | Futuro |

---

## Débito técnico

| ID | Área | Descrição | Prioridade |
|----|------|-----------|------------|
| DT-001 | Testes | Cobertura Vitest limitada aos módulos existentes | Média |
| DT-002 | Design System | Tokens e componentes não centralizados | Baixa |
| DT-003 | Specs | Contratos de API não documentados em detalhe | Alta |

---

## Resolvidos (recente)

_Nenhum issue resolvido registrado ainda._

---

## Próximos passos

- [ ] Validar issues após build/lint da Story 000.1
- [ ] Promover DT-003 para NEXT no backlog
- [ ] Fechar KI-001 após Story 000.2

## Referências

- `project/BACKLOG.md`
- `project/SPRINT.md`
