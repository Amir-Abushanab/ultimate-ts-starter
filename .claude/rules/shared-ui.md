---
description: Rules for using shared UI components from @ultimate-ts-starter/ui — always prefer shared components over one-off elements
globs:
  - "apps/web/**/*.tsx"
  - "packages/ui/**/*.tsx"
---

# Shared UI Components

## Always Use Shared Components

**NEVER** write one-off UI elements when a shared component exists in `packages/ui/src/components/`. Before writing ANY interactive element, check the shared package first.

Components are imported from `@ultimate-ts-starter/ui/components/*`:

```tsx
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { Card } from "@ultimate-ts-starter/ui/components/card";
import { Sonner } from "@ultimate-ts-starter/ui/components/sonner";
```

## Bad vs Good Examples

### Buttons

```tsx
// BAD - One-off button with manual styling
<button
  onClick={handleClick}
  className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 ..."
>
  Click me
</button>;

// GOOD - Use shared Button
import { Button } from "@ultimate-ts-starter/ui/components/button";
<Button onClick={handleClick}>Click me</Button>;
```

### Dialogs

```tsx
// BAD - Manual dialog implementation
<div className="fixed inset-0 bg-black/50 ...">
  <div className="bg-white rounded-lg p-6 ...">...</div>
</div>

// GOOD - Use a proper dialog component with accessibility built in
```

### Inputs

```tsx
// BAD - Manual input styling
<input className="border rounded-md px-3 py-2 ..." />

// GOOD - Use shared Input with consistent styling and accessibility
```

## When to Create New Components

Consider creating a new shared component if:

1. There is no equivalent, and it wraps a headless primitive properly
2. The pattern is expected to be used in several places
3. No existing component can be extended via props/className

New components go in `packages/ui/src/components/` and must:

1. Use headless primitives (Base UI, shadcn) where applicable
2. Be styled with Tailwind + `cn()` utility
3. Use `cva` for variants
4. Follow the design rules in design.md

## Adding Components via shadcn

Use the shadcn CLI to add new components — it scaffolds them into the shared package:

```bash
pnpm --filter @ultimate-ts-starter/ui dlx shadcn@latest add <component>
```

## Import Rules

Always use package imports, never relative paths across packages:

```tsx
// GOOD
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { cn } from "@ultimate-ts-starter/ui/lib/utils";

// BAD - relative imports across package boundaries
import { Button } from "../../../packages/ui/src/components/button";
```
