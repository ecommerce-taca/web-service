# decisions.md

## Architectural Decisions Record

* **ADR-001 — Single React Frontend**: The project uses a single React application. Micro Frontends are not used unless explicitly required.
* **ADR-002 — Feature-Based Architecture**: Business functionality is organized by domain in `src/features/`.
* **ADR-003 — API Gateway**: The frontend communicates with backend microservices exclusively via the API Gateway.
* **ADR-004 — Penpot as UI Source of Truth**: UI/UX patterns and design tokens must follow Penpot designs.
* **ADR-005 — JavaScript Instead of TypeScript**: The project uses modern JavaScript (`.js`/`.jsx`) and ESLint. TypeScript is not used.
* **ADR-006 — AI-Assisted Development**: Follow `AGENTS.md` guidelines for development workflow and documentation.
* **ADR-007 — Tailwind CSS Integration**: Replaced custom Vanilla CSS approach with Tailwind CSS (v3) to accelerate responsive UI development (Mobile-first) while maintaining adherence to Penpot design tokens.
