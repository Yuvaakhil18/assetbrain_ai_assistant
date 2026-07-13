# Contributing to Unified Asset Reasoning Layer

Welcome to the team! Before writing any code, please read and understand the following five standing rules. These are non-negotiable for this project.

## 1. Code Quality
- **Single Responsibility:** Write small, single-responsibility modules.
- **Strict Typing:** All TypeScript code must use strict typing. All Python code must include type hints and pass `mypy`.
- **No Magic Strings:** Define constants or enums instead of scattering magic strings throughout the codebase.
- **Documentation:** Every public function, class, and module must have a clear docstring.
- **Formatting:** Our linter and formatter are configured. Run them before ending any work phase. Code must pass all checks.

## 2. Efficiency
- **State Your Costs:** For any LLM-in-a-loop code, document the expected cost-per-call.
- **Batch Processing:** Always batch operations instead of looping per-item.
- **Caching:** Cache expensive operations such as embeddings generation and graph queries.

## 3. Security
- **No Secrets in Code:** Never hardcode secrets. Use `.env` (which must be gitignored) and provide a `.env.example`.
- **Sanitize Input:** Sanitize all user inputs before they reach an LLM prompt or a database query.
- **Zero-Trust for Documents:** Treat every ingested document as untrusted content. They must never be able to steer the agent or execute prompt injection attacks.

## 4. Testing
- **Test in Sync:** Every module must ship with its tests in the same PR or turn it is created.
- **Mock External APIs:** Mock LLM calls in tests. Do not burn API budget on every test run.

## 5. Accessibility
- **Keyboard Navigation:** The application must be fully keyboard-navigable.
- **Screen Reader Support:** Ensure proper labeling for screen readers.
- **Contrast & Color:** Meet WCAG 2.1 AA contrast standards. Status information must never be conveyed by color alone (always pair with an icon or text).
