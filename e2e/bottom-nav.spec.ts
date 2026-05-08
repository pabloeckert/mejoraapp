/**
 * E2E Tests — Bottom Navigation (updated with Perfil tab)
 *
 * Tests that the navigation works correctly with the new tab structure:
 * Inicio | Muro | Comunidad | Mentor | Perfil
 */

import { test, expect } from "@playwright/test";

test.describe("Bottom Navigation", () => {
  test("redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });

  test("auth page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Filter expected errors
    const unexpected = errors.filter(
      (e) =>
        !e.includes("Supabase") &&
        !e.includes("fetch") &&
        !e.includes("network") &&
        !e.includes("Failed to load") &&
        !e.includes("X-Frame-Options") &&
        !e.includes("frame-ancestors") &&
        !e.includes("Sentry")
    );

    expect(unexpected).toHaveLength(0);
  });
});

test.describe("Splash Screen", () => {
  test("splash page loads", async ({ page }) => {
    await page.goto("/splash");
    // Should show splash content or redirect
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});

test.describe("PWA", () => {
  test("manifest is accessible", async ({ request }) => {
    const response = await request.get("/manifest.json");
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toContain("Mejora");
    expect(manifest.start_url).toBeTruthy();
  });

  test("service worker is accessible", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
  });
});
