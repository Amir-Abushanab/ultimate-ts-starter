import { HttpResponse, http } from "msw";

const API = "http://localhost:3000";

/**
 * Default MSW request handlers.
 * Add handlers here for any API endpoints your tests need to mock.
 * Tests can override these per-test via server.use(...).
 */
export const handlers = [
  http.get(`${API}/rpc/healthCheck`, () => HttpResponse.json("OK")),

  http.get(`${API}/rpc/privateData`, () =>
    HttpResponse.json({
      message: "This is private",
      user: { email: "test@example.com", id: "test-user", name: "Test User" },
    })
  ),

  http.get(`${API}/rpc/account/exportData`, () =>
    HttpResponse.json({
      exportedAt: new Date().toISOString(),
      linkedAccounts: [],
      sessions: [],
      user: {
        createdAt: new Date().toISOString(),
        email: "test@example.com",
        emailVerified: true,
        id: "test-user",
        name: "Test User",
      },
    })
  ),
];
