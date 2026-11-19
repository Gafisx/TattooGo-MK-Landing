import { expect, test } from "@playwright/test";

test("scroll percorre a história até as jornadas de cliente e tatuador", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: /Cada traço/i }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: /Cada traço/i })).toBeInViewport();

  const journeysHeading = page.getByRole("heading", {
    name: /Feito para quem cria e para quem sente/i,
  });
  await journeysHeading.scrollIntoViewIfNeeded();
  await expect(journeysHeading).toBeInViewport();
});
