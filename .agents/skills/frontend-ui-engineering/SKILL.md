---
name: frontend-ui-engineering
description: >-
  Production-grade frontend UI engineering, design system enforcement, and anti-slop rules.
  Use whenever creating or modifying React/web UI, components, layouts, Tailwind styles, or views.
  Enforces atomic component decomposition, 5-state completeness, WCAG accessibility, and token efficiency.
---

# Frontend UI Engineering & Design System Protocol

## Purpose & Philosophy
This skill prevents **"AI Frontend Slop"** (monolithic 800-line JSX files, missing states, arbitrary hex codes, purple gradients, and raw inline SVG dumps) and maximizes **token efficiency** during UI development and refactoring.

---

## 1. Anti-Slop & Design Token Contract

1. **No Gradients, No Purple/Indigo Defaults:**
   * Never use multi-stop gradients for backgrounds, cards, or buttons. Use clean, solid semantic fills.
   * Do not default to generic AI purple/indigo styling. Keep one primary brand accent (e.g. Cobalt `#1E4FD6`) and lock status colors strictly to meaning:
     - `due` / warning: Amber (e.g., `#E8A013`)
     - `overdue` / error: Red (e.g., `#D64545`)
     - `won` / success: Green (e.g., `#189A5A`)
     - `neutral` / inactive: Slate/Gray
2. **Zero Inline SVG Dumps (Token Saver):**
   * Never generate 30–50 line raw SVG path strings inside JSX. This wastefully burns context tokens.
   * Always import named, tree-shakeable icons from standard icon packages (e.g. `lucide-react` or `@heroicons/react`):
     ```tsx
     // ❌ AI Slop: 40 tokens wasted on raw path coordinates
     <svg viewBox="0 0 24 24" ...><path d="M12 2L2 7l10 5 10-5-10-5z..." /></svg>

     // ✅ Clean & Token Efficient:
     import { Layers } from 'lucide-react';
     <Layers className="size-4 text-cobalt" />
     ```
3. **Zero Arbitrary Magic Numbers:**
   * Never write arbitrary hex values in class strings (`bg-[#1a2b3c]`, `text-[#4a5b6c]`).
   * Adhere strictly to the project's design tokens or semantic scale (`paper`, `card`, `line`, `wash`, `ink`, `sub`).
4. **Borders Over Drop Shadows:**
   * Define structural boundaries using hairlines/borders (`border border-line`) rather than heavy drop shadows.
   * Restrict `shadow-sm` or `shadow-md` strictly to floating elements (dropdowns, modals, bottom sheets).

---

## 2. Atomic Component Decomposition (<120 Lines Rule)

Monolithic components are the #1 cause of token burn in frontend development. If an agent writes a 600-line file, any minor tweak requires regenerating hundreds of lines.

### The Rule of Slicing:
Deconstruct all views into small, single-responsibility files under **120 lines**:
* **Atoms (Leaf Components):** `StatusPill.tsx`, `PrimaryButton.tsx`, `CurrencyText.tsx`.
* **Molecules:** `LeadRow.tsx`, `FilterDropdown.tsx`, `SearchBar.tsx`.
* **Organisms (Views/Sections):** `LeadsTable.tsx`, `PipelineHeader.tsx`.

### Token Savings in Practice:
* When a user requests: *"Change the pending status badge to amber"*, the agent edits only `StatusPill.tsx` (25 lines) using surgical diff replacement.
* The table structure, headers, and state management files remain untouched and out of the generation stream.

---

## 3. The 5-State Mandate

Every dynamic view or component that displays data must explicitly implement **all 5 states**. Never ship only the "happy path":

1. **Populated (Normal State):**
   * The standard view with real or mock data correctly rendered.
2. **Loading (Skeleton UI):**
   * Match the layout dimensions with pulse skeletons (`animate-pulse bg-wash rounded`).
   * Never use a jarring single spinner in the center of the screen that causes layout shift when data loads.
3. **Empty (Zero State):**
   * When data array is empty (`items.length === 0`), render a helpful illustration/icon, a descriptive headline ("No leads found"), and a primary call-to-action button ("Create your first lead").
4. **Error State:**
   * Inline alert container showing the failure message and a "Retry" button. Never fail silently with a blank white screen.
5. **Interactive States:**
   * Every clickable or interactive element must have defined `:hover`, `:focus-visible` (keyboard focus ring), and `:active` (pressed state).

---

## 4. Accessibility & Semantic HTML (WCAG 2.1 AA)

1. **Semantic Elements:**
   * Use `<button type="button">` for actions, `<a>` for navigation. Never `<div onClick={...}>`.
   * Use `<nav>`, `<main>`, `<aside>`, `<header>`, and `<section>` for document landmarks.
2. **Accessible Forms:**
   * Every `<input>`, `<select>`, and `<textarea>` must have a linked `<label htmlFor="...">`.
   * Include `aria-invalid={!!error}` and `aria-describedby` for validation errors.
3. **Keyboard Usability:**
   * Modals and slide-overs must support `Escape` key dismissal and focus trapping.
   * Interactive elements must have visible focus rings (`focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none`).

---

## 5. Typography, Data & Mobile Guidelines

1. **Tabular Numerals for Data:**
   * Any currency, percentages, counts, or table numbers must use `tabular-nums` (e.g., `font-mono tabular-nums` or `font-variant-numeric: tabular-nums`) to prevent jitter and maintain column alignment.
2. **Touch Targets:**
   * All interactive elements on mobile must have a minimum hit target of `44x44px` (`min-h-[44px] min-w-[44px]`).
3. **Truncation & Overflow:**
   * Prevent long strings (names, emails, titles) from breaking layouts using `truncate` or `line-clamp-2` with `title` tooltips.

---

## Decision & Quality Checklist

Before finalizing any frontend code:
- [ ] Is this file under 120 lines of code? If not, did I extract child components?
- [ ] Are all icons imported as components instead of raw inline SVGs?
- [ ] Are all 5 states (Populated, Skeleton, Empty, Error, Interactive) accounted for?
- [ ] Am I using semantic tokens instead of arbitrary hex codes and random gradients?
- [ ] Does every number in tables or KPIs use `tabular-nums`?
- [ ] Are buttons using `<button>` with explicit focus and hover styles?
