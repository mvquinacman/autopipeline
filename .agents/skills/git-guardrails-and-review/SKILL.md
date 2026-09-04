---
name: git-guardrails-and-review
description: >-
  Git workflow safety, conventional commit hygiene, destructive command prevention, and automated self-review.
  Use before staging files, creating git commits, merging branches, or opening pull requests.
  Prevents dirty git histories, accidental force pushes, staged temporary files, and unreviewed commits.
---

# Git Guardrails & Code Review Protocol

## Core Principle
> **Git history is documentation.**
> Every commit should represent a single atomic, logical unit of work that builds and passes tests. Never commit a dirty or half-broken tree.

---

## 1. Conventional Commits Standard

1. **Mandatory Format:**
   ```
   <type>(<scope>): <short imperative summary>
   ```
   * *Example:* `feat(auth): add google oauth provider callback`
   * *Example:* `fix(billing): correct stripe invoice prorate calculation`
   * *Example:* `refactor(leads): decompose monolithic table into atomic rows`

2. **Allowed Types:**
   * `feat`: A new user-facing or API feature.
   * `fix`: A bug fix or defect correction.
   * `refactor`: Code change that neither fixes a bug nor adds a feature.
   * `test`: Adding missing tests or correcting existing tests.
   * `perf`: A code change that improves performance.
   * `docs`: Documentation updates only.
   * `chore`: Maintenance, updating dependencies, or tooling configurations.

3. **Strictly Forbidden Commit Messages:**
   * `"fix"`, `"update"`, `"wip"`, `"done"`, `"changes"`, `"more changes"`.

---

## 2. Surgical Staging & Clean Tree Discipline

1. **Never Stage Blindly:**
   * **Rule:** Do NOT use `git add .` or `git add -A` blindly.
   * Stage files explicitly by path to prevent accidental inclusion of debug scripts or logs:
     ```bash
     git add src/components/StatusBadge.tsx src/components/StatusBadge.test.tsx
     ```
2. **Pre-Staging Exclusion Check:**
   * Confirm that temporary build artifacts (`dist/`, `.next/`, `coverage/`, `.turbo/`) and scratch debug files are untracked.
3. **Atomic Scope:**
   * If working on two separate tasks (e.g. fixing a navbar bug and updating the database schema), split them into two distinct commits.

---

## 3. Destructive Command Blacklist

The agent must **NEVER** run the following destructive commands without explicit, written confirmation from the user:
* `git push --force` or `git push -f`
* `git reset --hard HEAD~N` (when unpushed changes exist)
* `git clean -fdx` (wipes untracked files and local configurations)
* `git checkout .` or `git restore .` (destroys unstaged work)

---

## 4. Automated Pre-Commit Self-Review Gate

Before running `git commit`, inspect `git diff --cached` and verify:
1. **No Leftover Debugging Code:**
   * Remove any temporary `console.log`, `debugger`, or `print()` statements.
2. **No Test Isolation Residue:**
   * Ensure no `fit(`, `fdescribe(`, `it.only(`, or `test.only(` are present in test suites.
3. **No Unintentional Whitespace or Lint Diffs:**
   * Verify all code compiles and passes linter checks before committing.

---

## 5. Pull Request & Branch Summary Protocol

When preparing a feature branch or PR:
1. Provide a clear summary:
   * **What changed:** High-level summary of the implementation.
   * **Why:** The problem being solved.
   * **Verification:** The exact test commands executed to verify stability.
   * **Screenshots / Visuals:** For UI changes, note key visual updates.

---

## Pre-Commit Checklist

- [ ] Are files staged explicitly (no blind `git add .`)?
- [ ] Is the commit message formatted in Conventional Commit syntax?
- [ ] Are all debug logs (`console.log`, breakpoints) removed?
- [ ] Did all tests pass before making this commit?
- [ ] Are there zero secret keys, `.env` files, or binary artifacts staged?
