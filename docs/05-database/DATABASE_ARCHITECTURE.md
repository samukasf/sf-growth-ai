# SF Growth AI

# Database Architecture

Version: 1.0

---

# Philosophy

The database is not designed to store information.

It is designed to represent an entire company.

Every table has a single responsibility.

The Business Twin is the center of the system.

---

# Layer 01 — Foundation

Responsible for identity.

Tables:

- users
- companies
- company_members

---

# Layer 02 — Business

Responsible for understanding the company.

Tables:

- business_profiles
- business_goals
- business_challenges
- business_assets
- business_processes

---

# Layer 03 — Intelligence

Responsible for AI understanding.

Tables:

- business_twins
- executive_reports
- growth_scores
- growth_plans

---

# Layer 04 — Executive AI

Responsible for Executive System.

Tables:

- executive_memory
- executive_conversations
- executive_decisions
- executive_tasks

---

# Layer 05 — Knowledge

Responsible for company knowledge.

Tables:

- documents
- document_chunks
- embeddings
- sources

---

# Layer 06 — Automation

Responsible for execution.

Tables:

- automations
- workflows
- workflow_runs

---

# Layer 07 — Analytics

Responsible for measurements.

Tables:

- events
- metrics
- executive_metrics
- growth_history

---

# Golden Rule

Every table has one responsibility.

No duplicated information.

Business Twin is the center of the architecture.

Everything connects to it.
