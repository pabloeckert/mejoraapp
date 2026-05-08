/**
 * E2E Tests — Admin Cobranza (P10)
 *
 * Tests admin panel with cobranza tab UI elements.
 * Requires admin auth — tests verify redirect behavior without auth.
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Panel — Cobranza", () => {
  test("admin route redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });

  test("admin route redirects on direct cobranza access", async ({ page }) => {
    // Even if someone tries to access admin with a hash or query
    await page.goto("/admin#cobranza");
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });
});

test.describe("Admin Panel — Security", () => {
  test("admin is not accessible without authentication", async ({ page }) => {
    await page.goto("/admin");
    // Should be redirected
    await expect(page).toHaveURL(/\/auth/);

    // Trying to go back to admin should still redirect
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("admin API endpoints require auth", async ({ request }) => {
    // Try to call admin-action without auth
    const response = await request.post(
      "https://pwiduojwgkaoxxuautkp.supabase.co/functions/v1/admin-action",
      {
        headers: { "Content-Type": "application/json" },
        data: { action: "test" },
      }
    );

    // Should get 401 (no auth header)
    expect(response.status()).toBe(401);
  });
});
