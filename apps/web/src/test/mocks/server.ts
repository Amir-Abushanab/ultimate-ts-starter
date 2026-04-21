import { setupServer } from "msw/node";

import { handlers } from "./handlers";

// MSW mock server for tests.
// Override handlers per-test with server.use(http.get(...)).
export const server = setupServer(...handlers);
