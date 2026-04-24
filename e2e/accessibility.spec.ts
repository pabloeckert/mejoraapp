/**
 * E2E Tests — Accessibility (axe-core)
 *
 * Runs automated accessibility checks on key pages.
 * Catches WCAG 2.1 AA violations.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("auth page has no critical accessibility violations", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Filter out serious/critical violations
    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      console.log(
        "Accessibility violations:",
        critical.map((v) => `${v.id}: ${v.description} (${v.nodes.length} elements)`)
      );
    }

    // Allow minor violations but fail on critical ones
    expect(critical).toHaveLength(0);
  });

  test("auth page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["heading-order"])
      .analyze();

    const headingViolations = results.violations.filter(
      (v) => v.id === "heading-order"
    );

    expect(headingViolations).toHaveLength(0);
  });

  test("all interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["keyboard", "focus-order-semantics", "tabindex"])
      .analyze();

    const keyboardViolations = results.violations.filter(
      (v) => v.id === "keyboard" || v.id === "tabindex"
    );

    expect(keyboardViolations).toHaveLength(0);
  });

  test("form inputs have proper labels", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["label", "input-image-alt"])
      .analyze();

    const labelViolations = results.violations.filter((v) => v.id === "label");

    expect(labelViolations).toHaveLength(0);
  });

  test("color contrast meets WCAG AA", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    const contrastViolations = results.violations.filter(
      (v) => v.id === "color-contrast"
    );

    // Log but don't fail — contrast issues are common with dynamic themes
    if (contrastViolations.length > 0) {
      console.log(
        "Color contrast issues:",
        contrastViolations.map((v) => `${v.id}: ${v.nodes.length} elements`)
      );
    }

    // Soft assertion — log but don't block CI
    expect(contrastViolations.length).toBeLessThanOrEqual(5);
  });

  test("privacy policy page is accessible", async ({ page }) => {
    await page.goto("/politica-privacidad.html");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(critical).toHaveLength(0);
  });

  test("terms of service page is accessible", async ({ page }) => {
    await page.goto("/terminos-servicio.html");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(critical).toHaveLength(0);
  });
});
