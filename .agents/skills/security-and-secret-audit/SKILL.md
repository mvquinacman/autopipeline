---
name: security-and-secret-audit
description: >-
  Security hardening, credential leak prevention, and OWASP vulnerability auditing.
  Use before committing code, deploying services, exposing API endpoints, or handling authentication and user inputs.
  Prevents credential exposure, SQL injection, XSS, broken access control, and data breaches.
---

# Security & Secret Audit Protocol

## Core Principle
> **Assume zero trust at all boundaries.**
> A single leaked API key or unescaped query can compromise an entire organization. Security is not an afterthought; it is a non-negotiable verification gate before code is committed.

---

## 1. Zero-Leak Credential & Secret Defense

1. **Strict `.gitignore` Enforcement:**
   * Never track or commit environment files (`.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, `id_rsa`).
   * Verify `.gitignore` contains all standard secret patterns before staging files:
     ```gitignore
     .env
     .env*.local
     *.pem
     *.key
     service-account*.json
     ```
2. **Pre-Commit Diffs Secret Scan:**
   * Scan every `git diff` for hardcoded keys, tokens, or hashes matching:
     - Stripe secret keys (`sk_live_...`, `rk_live_...`)
     - Supabase service role keys (`eyJh...`)
     - AWS access keys (`AKIA[0-9A-Z]{16}`)
     - GitHub Personal Access Tokens (`ghp_...`)
     - OpenAI API keys (`sk-...`)
   * If any secret string is detected in a staged diff, **immediately halt execution** and instruct the user to rotate the key and inject it via environment variables.

---

## 2. OWASP Top 10 Inoculation Rules

1. **SQL & Query Injection:**
   * **Rule:** Never concatenate or interpolate user-supplied strings directly into SQL queries:
     ```typescript
     // ❌ Critical Vulnerability: SQL Injection
     await db.query(`SELECT * FROM users WHERE email = '${inputEmail}'`);

     // ✅ Secure: Parameterized queries or type-safe query builders
     await db.query('SELECT * FROM users WHERE email = $1', [inputEmail]);
     await db.select().from(users).where(eq(users.email, inputEmail));
     ```
2. **Cross-Site Scripting (XSS):**
   * Never use `dangerouslySetInnerHTML` in React or unescaped HTML interpolation with raw user input.
   * If rendering user-provided markdown/HTML is required, sanitize with a battle-tested library (e.g. `DOMPurify` / `sanitize-html`).
3. **Command & Shell Injection:**
   * Never pass unvalidated user input into shell commands (`exec`, `spawn`, `powershell`, or `bash`).
   * Pass arguments strictly as arrays to parameterized process runners.

---

## 3. Authorization & Access Control (Broken Object Level Authorization)

1. **Verify Authorization at the Handler Level:**
   * Never rely on the client or UI to enforce permissions.
   * Every backend endpoint or Server Action must independently verify:
     1. Is the requester authenticated?
     2. Does the requester own or have role-based permission (`admin`, `manager`, `agent`) to access this specific entity ID?
2. **Secure Cookies & Session Storage:**
   * Session tokens and JWTs must be stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
   * Never store auth tokens in `localStorage` where they are vulnerable to XSS exfiltration.

---

## 4. API Hardening & Rate Limiting

1. **Rate Limiting on Sensitive Endpoints:**
   * Enforce rate limiting on authentication routes (login, register, forgot-password, OTP verification) to prevent brute-force attacks.
2. **Strict CORS Policy:**
   * Disallow wildcard `Access-Control-Allow-Origin: *` on endpoints handling authenticated requests or cookies. Explicitly whitelist trusted production domains.

---

## Pre-Commit Security Checklist

Before finalizing any commit or deployment:
- [ ] Are `.env` files and private keys excluded by `.gitignore`?
- [ ] Have all staged files been checked for hardcoded API keys or secrets?
- [ ] Are all database queries parameterized or managed by a safe ORM?
- [ ] Are permissions verified on every backend mutation?
- [ ] Are session cookies marked `HttpOnly` and `Secure`?
- [ ] Is raw user input sanitized before rendering or processing?
