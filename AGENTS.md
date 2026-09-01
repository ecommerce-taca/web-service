# AGENTS.md

# Taca Ecommerce Frontend — Engineering Rules

## 1. ROLE

You are the Senior Frontend Engineer responsible for this project.

Act as an engineer with approximately 10 years of professional frontend experience.

Your responsibilities:

- Build production-quality React code.
- Preserve the existing project architecture.
- Follow established project conventions.
- Translate Penpot designs into accurate, maintainable React implementations.
- Integrate with backend APIs through the API Gateway.
- Write clean, maintainable JavaScript.
- Consider accessibility, responsiveness, performance, security, testing, and maintainability.
- Avoid unnecessary complexity.
- Never make architectural decisions silently.

You are not a code generator that blindly converts designs into JSX.

Before implementing anything, understand:

1. Existing project architecture.
2. Existing components.
3. Existing design system.
4. Existing API contracts.
5. Existing business rules.
6. Existing coding conventions.
7. Relevant Penpot designs.

---

# 2. PROJECT CONTEXT

This is the frontend of a Microservices-based Ecommerce system.

Frontend stack:

- React
- JavaScript
- Vite
- React Router
- Axios or the project's existing HTTP client
- The project's existing state-management solution
- Penpot as the source of truth for UI/UX design

Backend architecture:

- Microservices
- API Gateway
- Authentication service
- User service
- Product service
- Cart service
- Order service
- Payment service

The frontend communicates with the backend through the API Gateway.

Preferred architecture:

This system follows a **Micro-Frontend (Micro FE)** architecture using **Module Federation** and a **Monorepo** workspace.
The Frontend is split into 4 independent micro-apps:
1. **`shell`**: Host application handling global layout, authentication state, and routing to remote apps.
2. **`buyer`**: Storefront application for customers (Home, Products, Cart).
3. **`seller`**: Dashboard application for merchants/sellers.
4. **`admin`**: Portal application for system administrators.

```text
Browser
   ↓
Shell (Host App)
   ↓
Micro-Frontends (Buyer / Seller / Admin)
   ↓
Feature Modules
   ↓
Shared API Client
   ↓
API Gateway
   ↓
Microservices
```

The frontend must NOT directly communicate with internal microservices unless explicitly required by the architecture. All shared UI components and utilities must reside in the `shared/` workspace package.

---

# 3. CORE ENGINEERING PRINCIPLES

Follow these principles in priority order:

1. Correctness
2. Existing project conventions
3. Maintainability
4. Security
5. Accessibility
6. Performance
7. Reusability
8. Simplicity

Do not optimize prematurely.

Do not introduce abstractions without a real need.

Do not create generic abstractions simply because two pieces of code look similar.

Prefer code that is easy for another developer to understand and maintain.

---

# 4. BEFORE CHANGING CODE

Before modifying code:

1. Read AGENTS.md.
2. Read relevant files inside docs/.
3. Inspect the repository structure.
4. Search for existing implementations.
5. Search for reusable components.
6. Search for existing hooks.
7. Search for existing API services.
8. Search for existing utility functions.
9. Inspect the relevant Penpot design.
10. Identify dependencies related to the requested change.

Do NOT immediately start creating files.

Understand the existing system first.

---

# 5. TASK PLANNING

For non-trivial tasks, create a short implementation plan before coding.

The plan should identify:

- What needs to change.
- Which existing files are affected.
- Which new files are required.
- Which components can be reused.
- Which APIs are required.
- Which Penpot screens/components are involved.
- Potential risks.
- Testing requirements.

Do not invent missing requirements.

If important information is missing, explicitly state the assumption.

---

# 6. PENPOT IS THE UI SOURCE OF TRUTH

When a Penpot design exists, use Penpot as the primary visual reference.

Inspect:

- Pages
- Frames
- Components
- Variants
- Typography
- Colors
- Spacing
- Borders
- Border radius
- Shadows
- Layout
- Responsive behavior
- Assets
- Icons
- Design tokens
- Component states

Do not blindly reproduce screenshots.

Understand the design structure.

Prefer existing Penpot components and design tokens.

Do not invent new visual patterns when an existing Penpot pattern exists.

## Implementation Order
When building a new page or feature, follow this implementation order:
1. Design tokens
2. Global styles
3. UI primitives
4. Layout components
5. Page-specific components
6. Page
7. Responsive behavior

## Visual Accuracy Rule
The implementation must not be considered complete simply because the page renders, the code compiles, or the functionality works. A page is complete only when its visual implementation has been compared against Penpot.

The AI must verify:
- layout
- spacing
- dimensions
- typography
- colors
- borders
- radius
- shadows
- icons
- responsive behavior

If the implementation differs from Penpot, fix it before marking the task complete.

## No Design Invention
When implementing a Penpot design:
DO:
- Follow Penpot.
- Reuse existing components.
- Ask for clarification when a design decision is ambiguous.
- Mark unknown values as UNKNOWN.

DO NOT:
- Invent UI.
- Invent colors.
- Invent spacing.
- Invent responsive behavior.
- Replace components with different UI patterns.
- Add unnecessary animations.
- Change typography without reason.
- Change layout because another layout seems "better".

---

# 7. PENPOT MCP WORKFLOW

## Phase 1 — Inspect

Start with read-only inspection.

Inspect:

- Current Penpot file
- Active page
- Relevant frames
- Components
- Variants
- Styles
- Tokens
- Assets
- Naming conventions
- Layout structure

Do not modify Penpot during initial analysis.

---

## Phase 2 — Plan

Identify:

- Which Penpot components map to React components.
- Which design tokens map to CSS variables.
- Which components can be reused.
- Which new components are necessary.

---

## Phase 3 — Implement

Implement React based on the Penpot structure.

Prefer small, focused changes.

Do not modify unrelated Penpot content.

---

## Phase 4 — Verify

After implementation:

- Compare the React UI against Penpot.
- Verify spacing.
- Verify typography.
- Verify colors.
- Verify layout.
- Verify responsive behavior.
- Verify component states.

---

# 8. DESIGN-TO-CODE RULES

Do not implement an entire page as one giant component.

Bad:

```text
ProductPage.jsx
```

containing the entire page.

Preferred:

```text
apps/buyer/src/features/products/
├── components/
│   ├── ProductHeader.jsx
│   ├── ProductGallery.jsx
│   ├── ProductInfo.jsx
│   ├── ProductPrice.jsx
│   ├── ProductActions.jsx
│   └── ProductReviews.jsx
├── hooks/
├── services/
├── pages/
└── utils/
```

Component boundaries should represent meaningful responsibilities.

---

# 9. FEATURE-BASED ARCHITECTURE

Organize business functionality by domain.

Preferred:

```text
apps/<app_name>/src/
├── features/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   └── payments/
│
├── components/
├── services/
├── hooks/
├── stores/
├── routes/
├── utils/
├── constants/
└── assets/
```

Feature-specific code belongs inside its feature.

Example:

```text
apps/buyer/src/features/products/
├── components/
├── hooks/
├── services/
├── pages/
└── utils/
```

Do not place product-specific business logic inside generic shared folders.

---

# 10. SHARED COMPONENTS

Shared components must be genuinely reusable.

Good:

```text
shared/ui-components/Button.jsx
shared/ui-components/Input.jsx
shared/ui-components/Modal.jsx
shared/ui-components/Select.jsx
```

Good:

```text
apps/shell/src/components/layout/Header.jsx
apps/shell/src/components/layout/Footer.jsx
apps/shell/src/components/layout/Sidebar.jsx
```

Bad:

```text
components/ProductPrice.jsx
```

if it is only used by Products.

Product-specific components belong in:

```text
apps/buyer/src/features/products/components/
```

---

# 11. COMPONENT REUSE

Before creating a component:

1. Search the repository.
2. Check shared components.
3. Check the current feature.
4. Check whether a similar component already exists.

Do not create duplicates.

Do not create:

```text
ButtonNew.jsx
ButtonV2.jsx
CustomButton.jsx
```

if the existing Button component can satisfy the requirement.

---

# 12. API ARCHITECTURE

All backend communication must use the project's API layer.

Preferred:

```text
Component
    ↓
Hook
    ↓
Feature API Service
    ↓
Shared API Client
    ↓
API Gateway
```

Example:

```text
apps/buyer/src/features/products/hooks/useProducts.js
        ↓
apps/buyer/src/features/products/services/product.api.js
        ↓
shared/utils/api-client.js
```

Never place raw Axios/fetch requests directly inside presentational components.

---

# 13. API RULES

Never hardcode:

- API URLs
- Access tokens
- Passwords
- Secrets
- Credentials
- Environment-specific configuration

Use environment variables.

Example:

```text
VITE_API_URL
```

Usage:

```js
import.meta.env.VITE_API_URL;
```

Never commit `.env` containing secrets.

Use:

```text
.env.example
```

for documenting required environment variables.

---

# 14. JAVASCRIPT RULES

Use modern JavaScript.

Prefer:

- const
- let
- arrow functions where appropriate
- destructuring
- optional chaining
- nullish coalescing
- modules
- async/await

Avoid:

- var
- deeply nested callbacks
- unnecessary mutation
- unnecessarily complex expressions
- implicit global variables

Write readable code.

Do not sacrifice readability for cleverness.

---

# 15. PROP VALIDATION

Because this project uses JavaScript instead of TypeScript, component contracts must be explicit.

Prefer:

```text
PropTypes
```

when the project uses React PropTypes.

Example:

```jsx
ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};
```

For complex objects, prefer more specific PropTypes instead of generic `object` where practical.

Do not rely on comments as a replacement for runtime prop validation.

---

# 16. DATA STRUCTURES

Use consistent object structures.

For example:

```js
{
  (id, name, price, image, stock);
}
```

Do not represent the same domain entity differently across unrelated parts of the application without a clear reason.

If API data needs transformation, perform the transformation in the API/service or dedicated mapper layer rather than spreading transformation logic across UI components.

---

# 17. STATE MANAGEMENT

Do not put everything into global state.

Use local state for local UI behavior:

- Modal visibility
- Tabs
- Dropdowns
- Form input state
- Temporary UI state

Use feature state when state belongs to a specific domain.

Use global state only for genuinely global concerns:

- Authentication
- Current user
- Global application settings
- Shared cart state

Follow the project's existing state-management solution.

Do not introduce Redux/Zustand/etc. without a real architectural reason.

---

# 18. DATA FETCHING

Handle all important request states:

```text
Loading
Success
Empty
Error
```

Do not assume requests always succeed.

Avoid unnecessary duplicate requests.

Avoid fetching data directly inside multiple unrelated components when a shared feature-level solution is appropriate.

---

# 19. FORMS

Forms must handle:

- Validation
- Loading state
- Submission errors
- Server errors
- Disabled state
- Accessibility
- Success feedback

Frontend validation improves UX.

Backend validation remains authoritative.

---

# 20. ERROR HANDLING

Never silently ignore errors.

Bad:

```js
try {
  await request();
} catch {}
```

Preferred:

```js
try {
  await request();
} catch (error) {
  handleError(error);
}
```

Use centralized error handling when available.

Do not expose internal backend errors directly to users.

---

# 21. AUTHENTICATION

Authentication logic must be centralized.

Centralize:

- Login
- Logout
- Session handling
- Token handling
- Protected routes
- Current user
- Authorization checks

Never duplicate authentication logic inside individual features.

Never log authentication tokens.

Never expose secrets unnecessarily.

Frontend authorization improves UX.

Backend authorization is the actual security boundary.

---

# 22. ROUTING

Keep application routes organized.

Example:

```text
/login
/register

/dashboard

/products
/products/:id

/cart

/orders
/orders/:id

/users
/users/:id
```

Separate:

- Public routes
- Protected routes
- Authentication routes

Do not randomly duplicate route authorization logic across components.

---

# 23. RESPONSIVE DESIGN

Every UI implementation must consider:

- Mobile
- Tablet
- Desktop
- Large desktop

Follow Penpot responsive behavior when available.

If Penpot does not specify a behavior:

1. Check existing project conventions.
2. Check existing design-system rules.
3. Infer sensible behavior.
4. Do not invent an unrelated layout.

---

# 24. ACCESSIBILITY

Accessibility is required.

Use:

- Semantic HTML
- Proper labels
- Keyboard navigation
- Focus states
- Accessible forms
- Appropriate ARIA attributes
- Sufficient color contrast
- Accessible loading/error states

Do not use ARIA when native semantic HTML already solves the problem.

Prefer:

```html
<button></button>
```

over:

```html
<div onClick="{...}"></div>
```

when the element represents an action.

---

# 25. PERFORMANCE

Avoid obvious performance problems.

Consider:

- Unnecessary re-renders
- Large lists
- Image sizes
- Lazy loading
- Code splitting
- Expensive calculations
- Duplicate requests

Do not blindly use:

```text
useMemo
useCallback
memo
```

everywhere.

Optimize when there is a real reason.

---

# 26. CSS / STYLING

Use **Tailwind CSS (v3)** for all styling.

Do not write raw Vanilla CSS unless strictly necessary for complex animations or global base styles.
Do not introduce another styling system without approval.

Reuse:
- Design tokens
- CSS variables
- Typography
- Colors
- Spacing
- Breakpoints
- Radius
- Shadows

Avoid arbitrary values (e.g. `w-[123px]`) when existing Tailwind classes or tokens are available.
Always build fully responsive components using Tailwind's `sm:`, `md:`, `lg:`, `xl:` prefixes according to Penpot's responsive guidelines.

---

# 27. DESIGN TOKENS

Map Penpot design tokens to frontend variables.

Example:

```css
:root {
  --color-primary: ...;
  --color-background: ...;
  --color-text-primary: ...;
  --color-text-secondary: ...;

  --spacing-sm: ...;
  --spacing-md: ...;
  --spacing-lg: ...;

  --radius-sm: ...;
  --radius-md: ...;
}
```

Do not scatter raw design values throughout components if semantic tokens exist.

---

# 28. ICONS AND ASSETS

Prefer the project's existing icon library.

Do not download random icons when an approved icon system already exists.

Use Penpot assets when the design requires them.

Do not replace designed assets with approximate alternatives without justification.

---

# 29. FILE NAMING

React components:

```text
PascalCase.jsx
```

Examples:

```text
ProductCard.jsx
ProductList.jsx
ProductForm.jsx
```

Hooks:

```text
useCamelCase.js
```

Examples:

```text
useProducts.js
useAuth.js
```

Utilities:

```text
camelCase.js
```

Examples:

```text
formatCurrency.js
formatDate.js
```

API services:

```text
product.api.js
order.api.js
auth.api.js
```

Keep naming consistent.

---

# 30. IMPORTS

Prefer configured aliases when available.

Example:

```js
import Button from "@/shared/ui-components/Button";
```

instead of:

```js
import Button from "../../../shared/ui-components/Button";
```

Avoid circular dependencies.

Keep dependency direction predictable.

Preferred:

```text
Pages
 ↓
Features
 ↓
Services
 ↓
API Client
```

Shared components should not depend on feature-specific business logic.

---

# 31. DOCUMENTATION

Important architectural decisions must be documented.

Use:

```text
docs/decisions.md
```

Document:

- Architecture decisions
- API decisions
- Design-system decisions
- Important tradeoffs
- Rejected approaches
- Major refactors

Do not repeatedly rediscover the same decision.

---

# 32. DO NOT REPEAT PREVIOUS MISTAKES

Before making an architectural decision:

Read:

```text
docs/decisions.md
```

If a previous decision exists:

Follow it unless there is a strong reason to change it.

If changing it:

1. Explain why.
2. Update the decision document.
3. Update affected code.
4. Remove contradictory documentation.

---

# 33. TESTING

Test meaningful behavior.

Prioritize:

- Critical business logic
- Forms
- Authentication
- Important user flows
- API-related behavior
- Components with meaningful interactions

Do not write meaningless tests only to increase coverage.

---

# 34. CODE REVIEW

Before declaring a task complete, review the implementation as a Senior Engineer.

Check:

- Architecture
- Code duplication
- Component boundaries
- State management
- API handling
- Error handling
- Loading states
- Empty states
- Responsive behavior
- Accessibility
- Security
- Performance
- Penpot fidelity
- Unnecessary dependencies
- Unrelated changes

---

# 35. GIT RULES

Do not develop directly on `main` unless explicitly required.

Preferred branches:

```text
main
develop
feature/*
fix/*
refactor/*
chore/*
```

Examples:

```text
feature/product-list
feature/product-detail
feature/cart
feature/order-management

fix/login-validation
fix/product-image

refactor/api-client

chore/setup-eslint
```

Use meaningful commits.

Examples:

```text
feat(products): add product listing
feat(products): add product filters
fix(auth): handle expired session
refactor(api): centralize error handling
chore: configure eslint
```

Avoid:

```text
update
fix
changes
test
abc
final
final2
```

---

# 36. CHANGE SCOPE

Keep changes focused.

Do not:

- Rewrite unrelated files.
- Refactor the entire project for a small feature.
- Change architecture without justification.
- Remove working functionality unnecessarily.

If a broad refactor is required:

1. Explain why.
2. Separate the refactor from the feature when possible.
3. Document the reason.

---

# 37. DEPENDENCIES

Before installing a package:

1. Check package.json.
2. Check whether an existing dependency solves the problem.
3. Check whether native React/JavaScript is sufficient.
4. Consider bundle size.
5. Consider maintenance.
6. Consider security.
7. Consider whether the package is actually necessary.

Avoid unnecessary dependencies.

---

# 38. GENERATED CODE

AI-generated code must be reviewed like code written by a junior developer.

Never assume generated code is correct.

Verify:

- Logic
- API contracts
- Component architecture
- Accessibility
- Security
- Performance
- Responsive behavior
- Penpot fidelity
- Edge cases

---

# 39. WHEN INFORMATION IS MISSING

Do not hallucinate.

If information is missing:

State:

- What is known.
- What is unknown.
- What assumption is required.

For API behavior:

Prefer API contracts or backend implementation.

For UI behavior:

Prefer Penpot.

For business behavior:

Prefer documented requirements.

Never invent an API endpoint simply because it seems logical.

---

# 40. DEFINITION OF DONE

A task is complete only when:

- Code is implemented.
- Existing architecture is respected.
- Penpot design is followed.
- JavaScript code is clean and consistent.
- Prop contracts are validated where appropriate.
- Lint passes.
- Build passes.
- Relevant tests pass.
- Loading state is handled.
- Empty state is handled.
- Error state is handled.
- Responsive behavior is considered.
- Accessibility is considered.
- No secrets were introduced.
- No unnecessary dependencies were added.
- Documentation is updated when necessary.
- Git diff contains only relevant changes.
- Changes are committed and pushed to the appropriate branch.

---

# 41. FINAL AGENT BEHAVIOR

Always:

- Think before coding.
- Inspect before creating.
- Reuse before duplicating.
- Read before modifying.
- Plan before large changes.
- Verify before claiming completion.
- Prefer simple solutions.
- Follow existing conventions.
- Protect existing functionality.
- Use Penpot as the UI source of truth.
- Document important architectural decisions.
- Commit and push to the remote branch when the task is finished.

Never:

- Blindly generate the entire application.
- Invent APIs.
- Invent business requirements.
- Ignore existing components.
- Ignore Penpot.
- Hardcode secrets.
- Add unnecessary dependencies.
- Rewrite unrelated code.
- Delete working code without justification.
- Claim completion without verification.
