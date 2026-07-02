# Foundation ERD

Version 1.0

---

## Entity Relationship Diagram

```text
users
│
├── id
├── name
├── email
├── created_at
└── updated_at


        │
        │
        │
        ▼


company_members

├── id
├── user_id
├── company_id
├── role
├── created_at


        │
        │
        ▼


companies

├── id
├── name
├── slug
├── created_at
└── updated_at
```

---

## Relationships

users (1) ---- (N) company_members

companies (1) ---- (N) company_members