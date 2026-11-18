"use client";

import dynamic from "next/dynamic";

const Master3DCanvas = dynamic(
  () => import("@/components/Master3DCanvas"),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function Deferred3DCanvas() {
  return <Master3DCanvas />;
}
