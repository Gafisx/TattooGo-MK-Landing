import { expect, test, type Page } from "@playwright/test";

// Os testes rolam e interagem com a cena completa; cada um tem orçamento próprio.
test.setTimeout(120_000);

/**
 * Com o Lenis ativo o scroll nativo é suavizado, então cada `wheel` continua
 * deslizando depois do evento. Esperar o scroll parar antes de medir mantém as
 * asserções determinísticas.
 */
async function waitForScrollToSettle(page: Page) {
  let previous = -1;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const current = await page.evaluate(() => window.scrollY);
    if (Math.abs(current - previous) < 1) return;
    previous = current;
    await page.waitForTimeout(100);
  }
}

async function scrollToY(page: Page, targetY: number) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const current = await page.evaluate(() => window.scrollY);
    const remaining = targetY - current;
    if (Math.abs(remaining) < 16) return;
    await page.mouse.wheel(0, Math.sign(remaining) * Math.min(Math.abs(remaining), 800));
    await waitForScrollToSettle(page);
  }
  throw new Error(`a página não chegou a window.scrollY=${targetY}`);
}

test("a intro do hero exibe o título e as camadas do DepthText", async ({ page }) => {
  await page.goto("/");

  const title = page.locator("#hero-title");
  await expect(title).toBeVisible();
  await expect(title).toContainText("TattooGo");
  await expect(title).toContainText("MK");

  // A face nítida (translateZ(2px)) fica acima das camadas de fumaça.
  await expect(title.locator('span[style*="translateZ(2px)"]')).toBeVisible();

  const depthLayers = title.locator('[aria-hidden="true"]');
  expect(await depthLayers.count()).toBeGreaterThanOrEqual(2);
  await expect(depthLayers.first()).toBeVisible();

  // Alvos da timeline de intro do GSAP: eyebrow, tagline e CTAs ficam visíveis
  // (partem de autoAlpha 0 e só aparecem quando a timeline conclui).
  await expect(page.getByText("Para quem vive de arte")).toBeVisible();
  await expect(page.locator("section#top p").first()).toContainText(
    "A arte não é opcional.",
  );
  await expect(page.locator("section#top p").first()).toBeVisible();
  // Escopo no hero: o rodapé também tem um link "Para clientes". O bloco dos
  // CTAs é o último alvo da timeline (autoAlpha 0 → 1), então ganha mais folga.
  await expect(
    page.locator("section#top").getByRole("link", { name: /Para clientes/ }),
  ).toBeVisible({ timeout: 20_000 });
});

test("o cartão de clientes vira ao ser clicado", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("group", {
    name: "Cartão interativo para clientes",
  });
  await card.scrollIntoViewIfNeeded();

  // O motion.div interno carrega a transformação 3D do cartão.
  const inner = card.locator(":scope > div").first();
  const rotateY = () =>
    inner.evaluate((element) => {
      const transform = (element as HTMLElement).style.transform;
      const match = transform.match(/rotateY\((-?[\d.]+)deg\)/);
      return match ? Math.abs(Number(match[1])) : Number.NaN;
    });

  await expect
    .poll(rotateY, { timeout: 10_000 })
    .toBeLessThan(1);

  const frontLabel = card.getByText("Toque para explorar");
  await expect(frontLabel).toBeVisible();
  await frontLabel.click();

  // O verso só fica exposto quando o giro passa de 90°.
  await expect
    .poll(rotateY, { timeout: 10_000 })
    .toBeGreaterThan(90);
});

test("o botão de áudio ativa o som ao ser clicado", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Ativar áudio" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.click();

  const activeToggle = page.getByRole("button", { name: "Silenciar áudio" });
  await expect(activeToggle).toBeVisible();
  await expect(activeToggle).toHaveAttribute("aria-pressed", "true");
});

test("o pin da seção imersiva revela o texto SVG ao rolar", async ({ page }) => {
  await page.goto("/");

  const section = page
    .locator("section")
    .filter({ hasText: "A experiência imersiva" });
  const svg = section.locator("svg").first();
  await expect(svg).toContainText("A ARTE NÃO É OPCIONAL.");

  const clipInsetRight = () =>
    svg.evaluate((element) => {
      const clipPath = (element as SVGElement).style.clipPath;
      // O GSAP escreve valores mistos, ex.: "inset(0 100% 0 0)".
      const match = clipPath.match(/inset\(\s*[^\s]+\s+([\d.]+)%/);
      return match ? Number(match[1]) : Number.NaN;
    });

  // Antes do pin o texto está clipado (revelação começa em 100%).
  await expect.poll(clipInsetRight, { timeout: 15_000 }).toBeGreaterThan(90);

  const startY = await section.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  await scrollToY(page, startY);
  const pinnedTop = () =>
    section.evaluate((element) => element.getBoundingClientRect().top);
  await expect.poll(pinnedTop, { timeout: 15_000 }).toBeLessThan(48);

  const scrollBefore = await page.evaluate(() => window.scrollY);
  // O pin dura +=150% da viewport; 130% percorre a timeline quase inteira.
  await scrollToY(page, startY + viewportHeight * 1.3);
  const scrollAfter = await page.evaluate(() => window.scrollY);

  expect(scrollAfter).toBeGreaterThan(scrollBefore + 200);
  // Com o pin ativo a seção continua colada no topo enquanto o scroll avança.
  await expect.poll(pinnedTop).toBeLessThan(48);
  await expect(section).toBeInViewport();
  // A agulha revelou o texto: a borda direita do clip encolhe até quase zero.
  await expect.poll(clipInsetRight, { timeout: 15_000 }).toBeLessThan(25);
});
