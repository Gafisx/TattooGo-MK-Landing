"use client";

import Image from "next/image";

export default function ReducedMotionFallback() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
      <Image
        src="/assets/images/tattoo-needle-scroll-hero.png"
        alt=""
        fill
        sizes="100vw"
        priority={false}
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-[#121212]/35" />
    </div>
  );
}
