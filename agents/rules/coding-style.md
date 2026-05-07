---
description: Coding style – DRY, SOLID, Clean Architecture, naming, components, Tailwind style, when unsure
alwaysApply: true
---

# Coding style

## Don't repeat yourself (DRY)

- Extract shared logic, types, and UI into reusable modules or components.
- Prefer a single source of truth for data, types, and styles.
- If the same pattern appears more than once, refactor it into a shared abstraction.

## Naming

- **Variables and functions**: Use clear, descriptive names that explain intent (e.g. `userDisplayName`, `formatBookingDate`, `isLoading`).
- **Files**: Use **kebab-case** (hyphenated) for new files, including Astro files (e.g. `booking-card.tsx`, `app-layout.astro`, `use-booking-form.ts`).

## Components

- Keep components **as small as possible**; one clear responsibility per component.
- **Prefer existing components** before creating new ones; check the codebase for similar UI or logic and reuse or extend it.
- Split large components into smaller subcomponents when they grow beyond a single concern.
- For **React components**, use **named exports** (`export function Button(...)` or `export const Button = ...`), not `export default`.
- When creating wrapper components (e.g. Button, Input), **extend the props** from the underlying HTML element's attributes, e.g. `extends ButtonHTMLAttributes<HTMLButtonElement>` or `extends InputHTMLAttributes<HTMLInputElement>`, so the component accepts all native props (e.g. `disabled`, `type`, `aria-*`) and forwards them to the DOM.

## Tailwind component style

- **Borders**: Use **rounded-md** for borders/corners.
- Add `bg-*` and `text-*` **only when necessary**; don't set background or text color on every element. Rely on inheritance and defaults where the design already looks correct.

## SOLID principles

Follow **SOLID** when designing modules, components, and services:

- **S – Single responsibility**: One reason to change per module/component; split if it does more than one thing.
- **O – Open/closed**: Prefer extending behavior (composition, props, wrappers) over modifying existing code.
- **L – Liskov substitution**: Subtypes and implementations should be usable where the base type is expected without breaking behavior.
- **I – Interface segregation**: Prefer narrow, focused interfaces/props over one large contract; don't force consumers to depend on what they don't use.
- **D – Dependency inversion**: Depend on abstractions (interfaces, types, props) rather than concrete implementations; inject dependencies where it helps.

## Clean Architecture

Think in **Clean Architecture** when building features; it complements SOLID.

- **Dependency rule**: Dependencies point **inward**. Core (domain, use cases) must not depend on UI, frameworks, or external services. UI and infrastructure depend on core.
- **Layers** (inner → outer): **Domain / entities** (business rules and types) → **Use cases / application** (orchestration) → **Interface adapters** (presenters, gateways) → **Frameworks & drivers** (Astro/React pages, API clients, DB). Keep business logic in `utils` or `services`; keep UI in `components` and `pages`.
- **Abstractions**: Define ports (interfaces) for external concerns (e.g. "fetch user") and implement them in adapters (e.g. a service that calls an API). Inject these into use cases or components instead of calling concrete APIs from the UI.
- Apply this in proportion to the project: small features may need only a clear split between UI and services; larger flows benefit from use-case functions and explicit dependencies.

## Package manager and scripts

- Use **npm** to install dependencies and run scripts (e.g. `npm install`, `npm run dev`, `npm run build`). Do not use yarn, pnpm, or other package managers unless the user explicitly asks for them.
- When adding or updating dependencies, **always check and install the latest versions** (e.g. `npm install <package>@latest` or verify latest version before adding to `package.json`).

## When unsure

- If requirements, naming, or structure are unclear, **ask the user** instead of guessing.
