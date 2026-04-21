---
description: Testing guidelines for Vitest unit tests, React Testing Library, Playwright E2E, and MSW mocking
globs:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Testing Rules

## Stack

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Mocking**: MSW for API, vi.mock for modules

## Writing Tests

### Do

```tsx
// Use Testing Library queries (accessibility-first)
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email/i);

// Test behavior, not implementation
expect(screen.getByText("Success")).toBeInTheDocument();

// Use userEvent for interactions
await userEvent.click(button);
await userEvent.type(input, "text");

// Mock at boundaries (API, not internal functions)
server.use(http.get("/api/campaigns", () => HttpResponse.json(mockData)));
```

### Don't

```tsx
// Don't query by test-id unless necessary
screen.getByTestId("submit-btn"); // Avoid

// Don't test implementation details
expect(component.state.isLoading).toBe(true); // No

// Don't use fireEvent when userEvent works
fireEvent.click(button); // Prefer userEvent

// Don't mock internal functions
vi.mock("./utils", () => ({ validate: vi.fn() })); // Avoid
```

## E2E Guidelines

- **Smoke tests**: Quick health checks, run on every deploy
- **Flow tests**: Full user journeys, run on PRs
- **Selectors**: Prefer `getByRole`, `getByText` over test-ids

## Mocking

### API Mocking (MSW)

```tsx
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";

server.use(
  http.get("/api/data", () => {
    return HttpResponse.json({ items: [] });
  })
);
```

## What NOT to Do

- Don't skip or delete tests to make CI pass
- Don't use `test.skip()` without a tracking issue
- Don't mock what you don't own (test real component library behavior)
- Don't snapshot test dynamic content
- Don't test third-party library internals
