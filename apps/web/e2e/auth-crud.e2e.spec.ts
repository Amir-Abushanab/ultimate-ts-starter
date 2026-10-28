import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const EMAIL = "amir@example.com";
const SERVER_LOG = new URL(".server.log", import.meta.url);
const OTP_RE = /\[auth\] OTP for (?<email>.+?): (?<otp>\d{6})/gu;

// The dev server logs OTPs to stdout (workerd has no filesystem, so there's no
// other dev sink); playwright.e2e.config.ts tees that stdout to .server.log.
// This reads back the codes logged for a given email — the test's "dev mailbox".
const otpsFor = (email: string): string[] => {
  try {
    return [...readFileSync(SERVER_LOG, "utf-8").matchAll(OTP_RE)]
      .filter((match) => match.groups?.email === email)
      .map((match) => match.groups?.otp ?? "");
  } catch {
    return [];
  }
};

// Optimistic writes render before the server answers, and a failed write rolls
// back quietly, so a visible change alone doesn't prove it persisted. Start
// waiting before the action, then check the oRPC call's HTTP status.
const rpcStatus = (page: Page, procedure: string) =>
  page
    .waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === `/rpc/${procedure}`
    )
    .then((response) => response.status());

test.describe("examples: email-OTP login → CRUD + filter/sort/paginate", () => {
  test("full flow over the mock data", async ({ page }) => {
    // ── 1. Log in via email OTP, reading the code from the dev server log ──
    const otpsBefore = otpsFor(EMAIL).length;
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(EMAIL);
    await page.getByRole("button", { exact: true, name: "Continue" }).click();

    await expect
      .poll(() => otpsFor(EMAIL).length, { timeout: 20_000 })
      .toBeGreaterThan(otpsBefore);
    const otp = otpsFor(EMAIL).at(-1) ?? "";

    await expect(page.getByText(/check your email/iu)).toBeVisible();
    await page.getByRole("textbox").fill(otp);
    await page.getByRole("button", { exact: true, name: "Verify" }).click();
    await page.waitForURL(/\/dashboard/u);

    // ── 2. Examples page: 50 mock items, paginated 8 per page ──
    await page.goto("/examples");
    const count = page.getByTestId("item-count");
    const pageStatus = page.getByTestId("page-status");
    await expect(count).toHaveText("50 items");
    await expect(pageStatus).toHaveText("Page 1 of 7");

    // ── 3. Create (optimistic insert → top, since default sort is date desc) ──
    const title = `E2E item ${Date.now()}`;
    await page.getByRole("textbox", { name: "New item title" }).fill(title);
    const created = rpcStatus(page, "example/create");
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(count).toHaveText("51 items");
    expect(await created).toBe(200);

    // ── 4. Filter down to the new item ──
    await page
      .getByRole("textbox", { name: "Filter items by title" })
      .fill(title);
    await expect(count).toHaveText("1 items");

    // ── 5. Edit (optimistic update) ──
    // Edit/Delete stay disabled until the row's insert is persisted; click()
    // waits for that.
    await page.getByRole("button", { exact: true, name: "Edit" }).click();
    const edited = `${title} (edited)`;
    await page.getByRole("textbox", { name: "Edit item title" }).fill(edited);
    const updated = rpcStatus(page, "example/update");
    await page.getByRole("button", { exact: true, name: "Save" }).click();
    await expect(page.getByText(edited, { exact: true })).toBeVisible();
    expect(await updated).toBe(200);

    // ── 6. Delete (optimistic) ──
    const deleted = rpcStatus(page, "example/delete");
    await page.getByRole("button", { exact: true, name: "Delete" }).click();
    await expect(page.getByText(edited, { exact: true })).toHaveCount(0);
    expect(await deleted).toBe(200);
    await page.getByRole("textbox", { name: "Filter items by title" }).fill("");
    await expect(count).toHaveText("50 items");

    // ── 7. Sort: "Item 10" only lands on page 1 once title-sorted ──
    await expect(page.getByText("Item 10", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: /^Title/u }).click();
    await expect(page.getByText("Item 10", { exact: true })).toBeVisible();

    // ── 8. Paginate ──
    await page.getByRole("button", { exact: false, name: "Date" }).click();
    await expect(pageStatus).toHaveText("Page 1 of 7");
    await page.getByRole("button", { exact: true, name: "Next" }).click();
    await expect(pageStatus).toHaveText("Page 2 of 7");
    await page.getByRole("button", { exact: true, name: "Previous" }).click();
    await expect(pageStatus).toHaveText("Page 1 of 7");
  });
});
