import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Creates a fresh QueryClient for tests.
 * Disables retries so failed queries fail fast in tests.
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

/**
 * Renders a component wrapped with all providers (QueryClient, Theme).
 * Use this instead of raw `render()` for components that need context.
 */
export const renderWithProviders = (ui: ReactNode) => {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {ui}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
