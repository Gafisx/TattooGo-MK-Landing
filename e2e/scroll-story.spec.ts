import { expect, test } from "@playwright/test";

// A seção é pinada por ScrollTrigger e o Lenis intercepta o scroll nativo, o que
// torna `scrollIntoView` não determinístico. Em movimento reduzido o app desliga
// o Lenis e os pins, preservando a mesma ordem de conteúdo da história.
test.use({ reducedMotion: "reduce" });

test("a história leva às jornadas de cliente e tatuador", async ({ page }) => {
  await page.goto("/");

  const clientHeading = page.getByRole("heading", {
    name: /Encontre quem entende o que você quer marcar/i,
  });
  await clientHeading.scrollIntoViewIfNeeded();
  await expect(clientHeading).toBeInViewport();

  const artistHeading = page.getByRole("heading", {
    name: /Menos operação\. Mais tempo no traço/i,
  });
  await artistHeading.scrollIntoViewIfNeeded();
  await expect(artistHeading).toBeInViewport();
});
