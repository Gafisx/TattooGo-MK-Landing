import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // A home monta cena 3D e ~4,5 MB de assets; em dev o primeiro paint passa dos 30s padrão.
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // A home monta a cena 3D e ~4,5 MB de assets; no `next dev` cada render
    // levava 8–50s e os testes interativos estouravam o timeout esperando a
    // página estabilizar. O build de produção responde em milissegundos e é o
    // bundle que o usuário recebe.
    command: "npm run build && npm run start -- -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
