import { expect, test } from "@playwright/test";

test(
  "carrega a home sem erros e monta a cena 3D ou seu fallback",
  async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !message.text().includes("/_next/hmr")
      ) {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /TattooGo MK/i }),
    ).toBeVisible();
    await expect(page.locator('a[href="#main-content"]')).toContainText(
      "Pular para o conteúdo",
    );
    const scene = page.locator("canvas");
    const fallback = page.getByTestId("reduced-motion-fallback");
    await expect
      .poll(async () => (await scene.count()) + (await fallback.count()), {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
    await expect.poll(() => consoleErrors).toEqual([]);
  },
);

test("carrega as sete texturas WebP do carrossel de artistas", async ({ page }) => {
  const textureResponses = new Map<string, number>();
  page.on("response", (response) => {
    const match = response.url().match(/\/assets\/artists\/(artist-[1-7]\.webp)$/);
    if (match) textureResponses.set(match[1], response.status());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const heading = page.getByRole("heading", {
    name: /Estilos que contam histórias únicas/i,
  });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeInViewport();
  await expect
    .poll(() => textureResponses.size, { timeout: 20_000 })
    .toBe(7);
  expect([...textureResponses.values()]).toEqual(Array(7).fill(200));
});
