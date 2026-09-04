---
name: backend-database-patterns
description: >-
  Production-grade backend architecture, database schema design, safe migrations, and RLS security.
  Use whenever creating or modifying database schemas, writing migrations, building APIs, or configuring Row Level Security.
  Prevents data loss, multi-tenant leaks, N+1 query bottlenecks, and runtime API failures.
---

# Backend & Database Engineering Protocol

## Core Principle
> **Data integrity is irreversible.**
> Code can be redeployed in seconds; corrupted, leaked, or locked database state causes permanent damage. All database and backend changes must follow safe, non-destructive patterns.

---

## 1. Safe, Non-Destructive Database Migrations

1. **The Expand/Contract Pattern (Zero-Downtime Migrations):**
   * Never rename or drop a column in a single migration while production code is running.
   * **Phase 1 (Expand):** Add the new nullable column or table. Deploy code that writes to both old and new columns.
   * **Phase 2 (Backfill):** Run a background script or migration backfilling historical data.
   * **Phase 3 (Contract):** Deploy code that reads only from the new column. Finally, drop or archive the old column.
2. **Migration Safety Rules:**
   * Always set statement timeouts on migrations to avoid locking production tables.
   * Add new columns as `NULLABLE` or with a safe default value.
   * Create indexes concurrently when supported by the database engine (e.g. `CREATE INDEX CONCURRENTLY` in PostgreSQL).

---

## 2. Row Level Security (RLS) & Multi-Tenant Isolation

For PostgreSQL, Supabase, or multi-tenant architectures:

1. **Mandatory RLS Activation:**
   * Every newly created public table must have RLS explicitly enabled:
     ```sql
     ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
     ```
2. **The Multi-Tenant Isolation Invariant:**
   * Every query, insert, update, and delete policy must strictly enforce tenant and user boundaries:
     ```sql
     -- Good: strict tenant scoping using auth token
     CREATE POLICY "Tenant isolation for leads" ON public.leads
       FOR ALL
       TO authenticated
       USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
       WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
     ```
   * Never create permissive `USING (true)` policies for authenticated users on sensitive business data.
3. **Service Role Discipline:**
   * The database `service_role` (admin key) must **never** be used in client-side code or unauthenticated handlers. It is reserved exclusively for background cron workers and webhook processors.

---

## 3. Query Optimization & Eliminating N+1 Bottlenecks

1. **Relational Eager Loading:**
   * Never query relations inside a loop (`leads.forEach(async (lead) => fetchCustomer(lead.customer_id))`).
   * Use SQL joins, ORM `include`/`with` relations (Prisma/Drizzle), or Supabase relational queries:
     ```typescript
     // Good: single round-trip relational fetch
     const { data } = await supabase
       .from('leads')
       .select('id, amount, customer:customers(id, name, email)')
       .eq('tenant_id', tenantId);
     ```
2. **Mandatory Indexing:**
   * Add B-tree indexes to all Foreign Keys (`customer_id`, `tenant_id`).
   * Add composite indexes on columns frequently filtered or sorted together (e.g. `[tenant_id, created_at DESC]`).

---

## 4. Type-Safe APIs & Input Validation at the Edge

1. **Zero Unvalidated Inputs:**
   * Every API route, Server Action, or RPC handler must validate incoming request payloads using a runtime schema validator (e.g. Zod):
     ```typescript
     import { z } from 'zod';

     export const CreateLeadSchema = z.object({
       customer_id: z.string().uuid(),
       amount: z.number().positive(),
       status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']),
     });

     export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
     ```
2. **Idempotency for Mutations:**
   * Webhook handlers (e.g. Stripe, SendGrid) and payment/order creation endpoints must verify or require an `Idempotency-Key` or store processed webhook event IDs to prevent duplicate charging or duplicate record generation.
3. **Database Transactions:**
   * Any operation that modifies multiple related tables (e.g. creating an order and deducting inventory) must execute inside a database transaction (`BEGIN ... COMMIT`).

---

## Decision & Safety Checklist

Before committing backend or database code:
- [ ] Is RLS enabled with explicit tenant-isolation policies on all new tables?
- [ ] Are all foreign keys and filter/sort columns indexed?
- [ ] Are migrations non-destructive and backward-compatible?
- [ ] Is every API payload validated with Zod schemas?
- [ ] Are multi-table writes wrapped in database transactions?
- [ ] Is the service role key completely shielded from client code?
