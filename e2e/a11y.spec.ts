import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home não possui violações axe críticas", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("seções e carrossel têm navegação e conteúdo acessíveis", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("tabindex", "-1");
  await expect(page.getByRole("navigation", { name: "Links institucionais" }))
    .toBeVisible();
  await expect(
    page.getByRole("list", { name: "Estilos de tatuagem" }).getByRole("listitem"),
  ).toHaveCount(7);
});
