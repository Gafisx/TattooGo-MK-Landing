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

test("o carrossel 3D cai para a lista estática de estilos em reduced-motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const styles = page.getByRole("list", { name: "Estilos de tatuagem" });
  await expect(styles).toBeVisible();
  await expect(styles.getByRole("listitem")).toHaveCount(7);
  await expect(styles.getByRole("heading", { name: "Fine line" })).toBeVisible();

  // A dica de arraste só é renderizada quando o carrossel 3D está ativo.
  await expect(page.getByText("Role para explorar")).toHaveCount(0);
});
