import { expect, test } from "@playwright/test";

test("desliga animações 3D e áudio em reduced-motion real", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Ativar áudio" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByText("Estilos que contam")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
});
