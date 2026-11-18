# TattooGo MK

## Application

This repository contains a Next.js 16 App Router landing page built with React,
TypeScript, Tailwind CSS, GSAP, and React Three Fiber. The Portuguese page
introduces the client and artist journeys and includes a scroll-linked 3D
tattoo scene. The scene and page animations respect `prefers-reduced-motion`;
the 3D canvas also has a fallback for browsers without WebGL.

## Run

- Install dependencies with `npm install`.
- Start development with `npm run dev`.
- For Replit, bind to all interfaces and use the configured port:
  `npm run dev -- --hostname 0.0.0.0 --port 5000`.
- Build for production with `npm run build`, then serve it with `npm start`.
- `npm run lint` runs ESLint. `npx tsc --noEmit` runs the TypeScript check.
- There is no `npm test` script configured.

## Assets

Static images, the arm and tattoo-machine GLB models, and the original SVG
tattoo decal are served from `public/assets/`. The 3D experience includes
fallback rendering when the arm model is unavailable.

## Scope

This is a presentation website, not a working tattoo booking marketplace.
Booking, payment processing, account creation, and app downloads are not
implemented; the calls to action navigate to sections on this page. The
security and payment content describes the product concept and does not
represent backend or payment-provider functionality in this landing page.
