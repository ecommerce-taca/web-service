# Taca Ecommerce - Git & GitHub Workflow

This document outlines the branching strategy, commit conventions, and Pull Request requirements for the Taca Ecommerce project. All engineers must adhere strictly to these rules to maintain a clean, traceable, and secure codebase.

## 1. Protected Branches & Branching Strategy

The repository follows a structured workflow with two main protected branches:
- **`main`**: Represents the production-ready code. **Never develop directly on `main`.**
- **`develop`**: Represents the staging/integration environment. **Never develop directly on `develop`.**

### Feature & Task Branches
Every task, bug fix, or chore must get its own branch created from `develop` (or `main` if `develop` does not exist yet).
- **Format**: `type/short-description`
- **Allowed Types**:
  - `feature/*` (e.g., `feature/product-list`)
  - `fix/*` (e.g., `fix/login-validation`)
  - `refactor/*` (e.g., `refactor/api-client`)
  - `chore/*` (e.g., `chore/setup-eslint`)

*Do not use generic branch names like `update`, `fix`, `changes`, `test`, `abc`, `final`.*

## 2. Commit Conventions

We strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Commit messages are enforced locally via `commitlint` and `husky`.

**Format**: `<type>(<optional scope>): <description>`

**Examples**:
- `feat(products): add product listing`
- `fix(auth): handle expired session`
- `refactor(api): centralize error handling`
- `chore: configure eslint`

## 3. Pull Request (PR) Requirements

Before a PR can be merged into `develop` or `main`, it must meet the following criteria (Definition of Done):
1. **Linting & Formatting**: Must pass all linting checks (`npm run lint`).
2. **Build Verification**: The project and all micro-frontends must build successfully.
3. **UI/UX Match**: Any UI changes must be verified against Penpot pixel-by-pixel (layout, spacing, responsive behavior, colors).
4. **No Secrets**: No hardcoded secrets, API keys, or `.env` files committed.
5. **Architectural Rules**: Respect micro-frontend boundaries; no unauthorized cross-app imports.

## 4. Branch Protection Rules

The following settings must be configured in the GitHub repository settings for both `main` and `develop`:
- **Require pull request reviews before merging**: At least 1 approving review required.
- **Require status checks to pass before merging**: CI workflow (Build & Test) must pass.
- **Do not allow bypassing the above settings**.
- **Require linear history** (Optional but recommended for a cleaner git graph).
