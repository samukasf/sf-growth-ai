# Organization Brain

## Objetivo

Descrever a inteligência organizacional que permite ao SF Growth AI operar para a **organização** — multiusuário, multinível e multi-tenant ready.

## Responsabilidades

- Gerenciar estrutura hierárquica da empresa
- Controlar papéis, permissões e políticas de acesso
- Resolver identidade executiva por membro
- Definir limites de aprovação e autoridade de decisão
- Personalizar dashboards por cargo e departamento
- Registrar auditoria de todas as ações

## Componentes

| Componente | Código |
|------------|--------|
| Organization Intelligence Platform | `core/organization/` |
| Organization, Member, Department | Entidades de domínio |
| Role, Permission, AccessPolicy | Controle de acesso |
| DecisionAuthority, ApprovalLevel | Limites de aprovação |
| ExecutiveIdentity | Identidade no conselho |
| AuditEntry, AuditService | Trilha de auditoria |

## Fluxo

```
Membro autenticado
      ↓
IdentityResolver
      ↓
AccessPolicyEngine (permissões)
      ↓
DecisionAuthorityEngine (aprovações)
      ↓
Dashboard personalizado
      ↓
Executive Orchestrator (com contexto org)
```

## Integrações

- [08_EXECUTIVE_ENGINES.md](./08_EXECUTIVE_ENGINES.md)
- [13_SECURITY_AND_GOVERNANCE.md](./13_SECURITY_AND_GOVERNANCE.md)
- Executive Orchestrator (`core/executive-orchestrator/`)

## Futuro

SSO, SCIM, multi-tenant completo, políticas customizáveis por indústria e compliance automatizado (GDPR, SOC2).
