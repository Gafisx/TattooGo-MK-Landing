import { expect, test } from "@playwright/test";

// A seção é pinada por ScrollTrigger e o Lenis intercepta o scroll nativo, o que
// torna `scrollIntoView` não determinístico. Em movimento reduzido o app desliga
// o Lenis e os pins, preservando a mesma ordem de conteúdo da história.
test.use({ reducedMotion: "reduce" });

// `scrollIntoViewIfNeeded` espera estabilidade de layout de um cartão animado;
// rolar direto no DOM e deixar a asserção web-first conferir o viewport é
// determinístico e mantém o mesmo objetivo do teste.
async function reveal(locator: import("@playwright/test").Locator) {
  await locator.evaluate((element) => {
    element.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await expect(locator).toBeInViewport();
}

test("a história leva às jornadas de cliente e tatuador", async ({ page }) => {
  await page.goto("/");

  await reveal(
    page.getByRole("heading", {
      name: /Encontre quem entende o que você quer marcar/i,
    }),
  );

  await reveal(
    page.getByRole("heading", {
      name: /Menos operação\. Mais tempo no traço/i,
    }),
  );
});
