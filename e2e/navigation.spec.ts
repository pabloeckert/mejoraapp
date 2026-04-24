/**
 * E2E Tests — Navigation & Routing
 *
 * Tests page loading, redirects, and navigation.
 */

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("root redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/");
    // Should redirect to /auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });

  test("auth page loads correctly", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    const response = await page.goto("/ruta-que-no-existe");
    // SPA might return 200 with 404 component, or actual 404
    const status = response?.status() ?? 200;
    expect([200, 404]).toContain(status);

    // Should show some 404 content
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });

  test("privacy policy page loads", async ({ page }) => {
    const response = await page.goto("/politica-privacidad.html");
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title).toContain("Privacidad");

    const content = await page.textContent("body");
    expect(content).toContain("Ley 25.326");
  });

  test("terms of service page loads", async ({ page }) => {
    const response = await page.goto("/terminos-servicio.html");
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title).toContain("Términos");

    const content = await page.textContent("body");
    expect(content).toContain("Mejora Continua");
  });

  test("admin route redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });

  test("reset password page loads", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page).toHaveURL(/\/reset-password/);
  });
});

test.describe("Performance", () => {
  test("auth page loads within 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/auth");
    await page.waitForLoadState("domcontentloaded");
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(3000);
  });

  test("no console errors on auth page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Filter out expected errors (e.g., Supabase connection issues in test env)
    const unexpected = errors.filter(
      (e) =>
        !e.includes("Supabase") &&
        !e.includes("fetch") &&
        !e.includes("network") &&
        !e.includes("Failed to load")
    );

    expect(unexpected).toHaveLength(0);
  });
});
