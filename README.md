This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# TattooGo MK

## 3D model production pipeline

Place the final tattoo machine at `public/assets/models/tattoo-machine.glb`.
The checked-in model currently uses `KHR_mesh_quantization`; it does not contain
Draco-compressed geometry or KTX2 textures, so it loads without external decoder
assets. Keep the model under 50,000 triangles and the complete scene under 100
draw calls.

If Draco compression is introduced, include the matching decoder files under
`public/draco/` and pass `"/draco/"` to both `useGLTF.preload` and `useGLTF`.
Do not enable Draco for this asset unless those decoder files are deployed.

Before deployment, optimize the source model:

```bash
npm install --global gltf-pipeline
gltf-pipeline -i source.glb -o public/assets/models/tattoo-machine.glb -d
```

Convert PNG/JPG source textures to KTX2 before packaging with `toktx` or
`gltf-transform`, then configure a KTX2 loader before using such textures in the
GLB. The hero scene stays demand-rendered: scroll advances the ink, while a
press-and-drag gesture lets the user guide the needle. The interaction also
supports keyboard input and respects reduced-motion preferences for automatic
animation.
