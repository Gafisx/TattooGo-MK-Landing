import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home não possui violações axe críticas", async ({ page }) => {
  // O axe injeta um script na página; com Lenis + cena 3D rodando a cada frame
  // a instrumentação não conclui. Movimento reduzido mantém o mesmo DOM.
  await page.emulateMedia({ reducedMotion: "reduce" });
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
