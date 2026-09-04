---
name: systematic-debugging
description: >-
  Rigorous root-cause analysis and surgical debugging methodology.
  Use whenever encountering bugs, failing tests, unexpected errors, crashes,
  build failures, or runtime exceptions. Prevents shotgun debugging, saves tokens,
  and ensures deterministic, regression-free fixes.
---

# Systematic Debugging Protocol

## The Iron Law of Debugging
> **No code modifications without verified root cause investigation first.**
> You must NEVER attempt a fix based on symptom observation alone. Masking a symptom (e.g. blindly adding a null check or try/catch) without identifying why the invariant broke is strictly prohibited.

---

## Why This Protocol Matters

Default LLM debugging behavior defaults to **"Shotgun Debugging"**:
* Modifying lines near the crash point without understanding upstream state.
* Running full test suites repeatedly, generating tens of thousands of tokens of redundant logs.
* Masking bugs with defensive guards that cause silent data corruption later.
* Filling the context window with failed attempts, triggering hallucination and context rot.

**Systematic Debugging** turns debugging from an expensive probabilistic guess into a deterministic 4-phase engineering discipline. It resolves defects in 1–2 turns and cuts token consumption by 60–80%.

---

## The 4-Phase Protocol

### Phase 1: Reproduction & Isolation
Before inspecting or touching application source code:
1. **Formulate Minimal Reproduction:** Identify or create the smallest possible test, command, or script that consistently demonstrates the failure.
   * Do NOT run the entire test suite if a single test file or test case reproduces the failure. Run *only* the specific target:
     ```bash
     # Good: fast, isolated, token-efficient
     npm test -- -t "should calculate tax correctly"
     pytest tests/test_billing.py::test_calculate_tax
     
     # Avoid: slow, dumps huge logs into context
     npm test
     pytest
     ```
2. **Capture Concrete Facts:** Record the exact error message, stack trace, and the line where execution halted.
3. **Check Recent Changes:** Run `git diff` or inspect recently touched files to identify if a recent commit or edit introduced the regression.

### Phase 2: Root-Cause Trace
Work backward from the failure point to the origin of invalid state:
1. **Differentiate Point of Failure vs. Point of Origin:**
   * *Point of Failure:* Where the exception/error was thrown (e.g. `TypeError: Cannot read property 'id' of undefined`).
   * *Point of Origin:* Where the variable became `undefined` (e.g. an unhandled promise rejection, an unsaved database transaction, or a typo in a payload key).
2. **Inspect Upstream Callers:** Trace data flow upstream using targeted line-range reads or grep. Avoid loading entire files into context.
3. **Verify Assumptions:**
   * What was the function expecting?
   * What did it actually receive?
   * Why did the caller provide that unexpected input?

### Phase 3: Hypothesis Formulation & Validation
Before writing any patch:
1. **Formulate Explicit Hypothesis:**
   * Write down: *"The error occurs because `[Component A]` passes `[State X]` when `[Condition Y]` occurs, violating `[Contract Z]`."*
2. **Test the Hypothesis:**
   * Can this hypothesis be verified with a log, an assertion, or a minimal test assertion?
   * If the hypothesis is wrong, discard it and return to Phase 2. Do not start making speculative code edits.

### Phase 4: Surgical Implementation & Verification
Once the root cause is proven:
1. **Apply the Minimal Viable Fix:**
   * Target the **origin of the defect**, not the crash site.
   * Edit only the specific lines responsible. Never rewrite untouched functions, files, or surrounding logic.
   * Use surgical hunk/diff replacements (`replace_file_content`) instead of whole-file overwrites.
2. **Verify Against Reproduction:**
   * Run the minimal reproduction test created in Phase 1. Confirm that it now passes.
3. **Regression Safety Check:**
   * Run the relevant test suite for the modified module to confirm zero side-effects.
4. **Clean Up:**
   * Remove any temporary debug logs or scratch scripts created during Phase 1–3.

---

## Token & Speed Optimization Guidelines

1. **Targeted Reading:**
   * Never view entire 1,000-line files to find a bug.
   * Use `grep_search` to find symbols or error strings.
   * View only the relevant function's line slice (e.g. lines 45–95).
2. **Quiet Execution:**
   * Pipe or filter noisy shell commands (e.g. `pytest -q`, `npm test -- --silent`).
   * Avoid dumping megabytes of logs into the prompt context.
3. **Subagent Offloading:**
   * For complex multi-file searches or extensive log analysis, spin up an isolated `research` subagent to investigate and return only the concise conclusion.

---

## Quick Decision Checklist

When you see a bug or test failure:
- [ ] Have I reproduced it with a single, fast command?
- [ ] Do I know *why* the data was invalid, or am I just looking at where it crashed?
- [ ] Have I stated a testable hypothesis?
- [ ] Is my proposed fix fewer than 15 lines of code?
- [ ] Does the reproduction pass after the fix?
- [ ] Have I verified that adjacent tests still pass?
