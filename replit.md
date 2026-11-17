# TattooGo landing page

The import contained a README and five supplied images, with no application code or package manifest. The user requested a runnable landing page.

## Run
- Node.js 22 or newer; no third-party dependencies or secrets required.
- Run `npm run dev` (or the configured **TattooGo** workflow).
- The server listens on `0.0.0.0:5000` by default; `PORT` can override the port.
- Run `npm test` for static-server smoke tests.

## Structure
- `index.html`, `styles.css`, `script.js`: the responsive Portuguese landing page.
- `public/assets/images/`: original imported images, served under `/assets/images/`.
- `server.js`: dependency-free static server. Only page files and public assets are exposed.

## Scope
This is a presentation website, not a working tattoo booking marketplace. Do not imply that booking, payments, account creation, or app downloads are operational without implementing those flows and providing real destinations. No customer data is collected.
