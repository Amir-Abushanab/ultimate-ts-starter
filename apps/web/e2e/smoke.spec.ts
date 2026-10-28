import { expect, test } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ultimate TS Starter/u);
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading")).toContainText(/sign in/iu);
  });

  test("unauthenticated user is redirected from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/u);
  });

  test("unauthenticated user is redirected from settings", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/\/login/u);
  });

  test("navigation links are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /home/iu })).toBeVisible();
    await expect(page.getByRole("link", { name: /dashboard/iu })).toBeVisible();
    await expect(page.getByRole("link", { name: /settings/iu })).toBeVisible();
  });

  test("theme toggle exists", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /switch to/iu })
    ).toBeVisible();
  });

  test("locale switcher exists", async ({ page }) => {
    await page.goto("/");
    // Should show the "other" locale button
    const switcher = page.getByRole("button", { name: /عر|EN/iu });
    await expect(switcher).toBeVisible();
  });
});
