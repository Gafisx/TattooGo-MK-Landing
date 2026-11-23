import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// A home carrega ~4,5 MB de assets (texturas WebP e modelo 3D) antes de ficar
// estável, e o axe analisa esse DOM completo. Medido em máquina local: ~20s de
// rede + ~40s de análise, então o teste tem orçamento próprio.
test.setTimeout(180_000);

test("home não possui violações axe críticas", async ({ page }) => {
  // O axe injeta um script na página; com Lenis + cena 3D rodando a cada frame
  // a instrumentação não conclui. Movimento reduzido mantém o mesmo DOM.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // O `preload` do axe espera as mídias da página; com a rede ociosa a análise
  // mede a árvore final em vez de competir com o carregamento das texturas.
  await page.waitForLoadState("networkidle");

  // A home tem um único frame (nenhum iframe), então o modo legado do axe roda
  // o mesmo conjunto de regras via axe.run sem o custo do runPartial/finishRun:
  // medido 143s no modo padrão contra 37s aqui, com violações idênticas.
  const results = await new AxeBuilder({ page }).setLegacyMode(true).analyze();
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
