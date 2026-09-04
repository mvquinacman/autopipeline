---
name: spec-first-architect
description: >-
  Pre-code architectural planning, data modeling, and specification design.
  Use before writing code for any new feature, project, API, or complex refactor.
  Eliminates architectural restarts, resolves ambiguity, and prevents token-wasting rewrites.
---

# Spec-First Architecture Protocol

## The Core Principle
> **Never write implementation code on an unverified architecture.**
> Resolving ambiguity, data models, and edge cases in a structured 500-token specification prevents burning 20,000+ tokens on scrapped code and rollback loops.

---

## When to Activate This Skill
* Starting a new project, service, or major feature.
* Designing or modifying database schemas, tables, or relationships.
* Creating new API endpoints, contracts, or state machine flows.
* Making complex refactors that cross multiple module boundaries.

---

## The 4-Phase Architectural Specification Process

### Phase 1: Clarification & Boundary Definition
Before drawing schemas or writing code:
1. **Identify the Core Invariant:** What single business problem does this solve?
2. **Surface Unstated Assumptions:**
   * What are the inputs, constraints, and volume expectations?
   * What permissions or roles are required to access or mutate this resource?
3. **Explicit Non-Goals:** Explicitly declare what this feature will **NOT** do in this iteration to prevent scope creep.

### Phase 2: Data Modeling & State Contracts
1. **Schema & Relationships (Normalized First):**
   * Define table names, column types, primary keys, foreign keys, and indexes.
   * Document cascade rules (`ON DELETE CASCADE` vs `SET NULL`).
   * Detail Row Level Security (RLS) policies: who can `SELECT`, `INSERT`, `UPDATE`, `DELETE`?
2. **Interface & Validation Contracts:**
   * Define TypeScript interfaces / Zod schemas for request payloads and return types.
   * Never leave payload shapes implicit or loosely typed (`any` / `Record<string, unknown>`).
3. **State Machine Transitions:**
   * For dynamic entities (e.g. leads, orders, tasks), map every valid transition:
     `Draft` $\rightarrow$ `Pending` $\rightarrow$ `Approved` / `Rejected`.
   * Explicitly disallow illegal state jumps.

### Phase 3: Failure Mode & Edge Case Interrogation
Document how the system handles the "Unhappy Paths":
* **Concurrency & Race Conditions:** What happens if two updates occur simultaneously? (Use optimistic locking or database transactions).
* **Network & Third-Party Failures:** How are timeouts, retries, and rate limits handled?
* **Empty / Zero States:** What does the API or UI return when no records exist?
* **Idempotency:** Can this action be safely called multiple times without duplicate side-effects?

### Phase 4: Phased Task Decomposition (Surgical Execution Plan)
Break the build into small, dependency-ordered milestones:
1. **Milestone 1:** Database migration, RLS policies, and data types.
2. **Milestone 2:** Backend services, validation schemas, and endpoint tests.
3. **Milestone 3:** UI components (Atoms $\rightarrow$ Molecules $\rightarrow$ Views) following `frontend-ui-engineering`.
4. **Milestone 4:** End-to-end verification and regression checks.

---

## Token & Efficiency Rules

1. **Keep Specs Concise:** Use bullet points, concise type definitions, and state diagrams. Avoid long prose.
2. **Zero Code Prototyping:** Do not generate speculative implementation code during Phase 1–3. Keep the context clean until the plan is locked.
3. **User Alignment Gate:** Present the core plan to the user. Proceed to execution only once the architectural boundaries are agreed upon.

---

## Architectural Decision Checklist

Before declaring the specification complete:
- [ ] Are all database foreign keys, indexes, and RLS policies defined?
- [ ] Are input/output contracts strictly typed with validation schemas?
- [ ] Have all valid and invalid state transitions been enumerated?
- [ ] Are error codes, empty states, and concurrency edge cases addressed?
- [ ] Is the implementation broken into small, independently testable milestones?
