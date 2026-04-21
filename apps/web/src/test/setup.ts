import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./mocks/server";

// Start MSW before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

// Reset handlers between tests (removes per-test overrides)
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Stop MSW after all tests
afterAll(() => {
  server.close();
});
