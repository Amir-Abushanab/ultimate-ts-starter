import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorBoundary } from "@/components/error-boundary";

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>
    );
    // eslint-disable-next-line typescript/no-unsafe-call -- vitest-dom matcher types unresolved in lint env
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
