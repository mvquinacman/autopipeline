---
name: test-driven-development
description: >-
  Strict Test-Driven Development (TDD) workflow enforcing Red-Green-Refactor cycles.
  Use when implementing new features, adding business logic, creating API endpoints, or handling edge cases.
  Eliminates speculative coding, provides deterministic stopping criteria, and guarantees regression-free code.
---

# Test-Driven Development (TDD) Protocol

## The Iron Rule of TDD
> **No production code is written without a failing test first.**
> If you write production code before writing and observing a failing test, you do not know if your test actually tests the feature or if it passes by coincidence.

---

## Why TDD Transforms Coding Agents

Default LLM coding is **speculative**:
* It writes 100 lines of code, guessing how edge cases will behave.
* It often skips testing edge cases, leaving hidden bugs.
* It has no deterministic stopping condition, so it continues rambling or adding unnecessary boilerplate.

**TDD gives the agent a mathematical stopping gate**:
$$\text{RED (Test Fails)} \longrightarrow \text{GREEN (Test Passes)} \longrightarrow \text{REFACTOR (Clean up under test)} \longrightarrow \text{STOP}$$

This eliminates over-engineering, prevents hallucinations, and saves thousands of tokens per feature.

---

## The 3-Phase Red-Green-Refactor Cycle

### Phase 1: RED (Write the Failing Test)
1. **Define the Single Requirement:** Identify the exact function, endpoint, or behavior to implement.
2. **Write a Minimal Unit or Integration Test:**
   * Test the public contract/interface, not internal implementation details.
   * Write one test case at a time.
3. **Execute & Watch it Fail:**
   * Run *only* the new test file or test case (isolated execution):
     ```bash
     # Good: fast, quiet, token-efficient
     npm test -- -t "should reject invalid email format"
     pytest tests/test_auth.py::test_invalid_email -q
     go test -run TestInvalidEmail ./auth/...
     ```
4. **Verify the Failure Reason:**
   * Confirm the test failed for the **expected reason** (e.g., function undefined, assertion failed, status 400 instead of 200).
   * If it failed due to a syntax error in the test itself, fix the test before proceeding.

### Phase 2: GREEN (Write Minimal Passing Code)
1. **Implement the Absolute Minimum:**
   * Write only the code required to make the failing test pass.
   * Do not anticipate future requirements or add extra "nice-to-have" helpers.
   * Keep it simple, even if the implementation feels trivial.
2. **Re-run the Targeted Test:**
   * Execute the test again and verify it turns green.

### Phase 3: REFACTOR (Clean Up Under Test Coverage)
1. **Improve Code Quality:**
   * Remove duplication, extract constants, or refine naming.
   * Ensure adherence to project design patterns and type safety.
2. **Verify Stability:**
   * Re-run the targeted test to ensure it remains green.
   * Run the module's regression test suite to ensure no existing tests broke.

---

## Testing Anti-Patterns to Strictly Avoid

1. **Tautological Testing (Testing Code After the Fact):**
   * Never write 200 lines of application code and then write tests that merely assert whatever the code returned. That tests what the code *does*, not what it *should do*.
2. **Implementation Testing:**
   * Do not test private variables or internal mock calls. Test inputs and observable outputs/state changes.
3. **Monolithic Test Runs (Token Drain):**
   * Never run the entire test suite on every loop. Run only the active test during Red/Green phases. Run the broader suite only at the final verification step.

---

## Decision & Quality Checklist

Before moving to the next task or declaring a feature complete:
- [ ] Did I watch the test fail before writing the implementation?
- [ ] Did the test fail for the expected business logic reason?
- [ ] Did I write the absolute minimum code to turn it green?
- [ ] Did I run the test suite to ensure zero regressions?
- [ ] Are all mock data and assertions cleanly structured?
