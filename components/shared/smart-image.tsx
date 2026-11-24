"use client";
import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/** next/image with a fallback for missing or legacy uploads. GIFs stay unoptimised so they keep animating. */
export function SmartImage({ src, fallback = "/images/kitchen-feature.webp", alt, ...p }: ImageProps & { fallback?: string }) {
  const [failed, setFailed] = useState<unknown>(null);
  const url = !src || failed === src ? fallback : src;
  return <Image {...p} src={url} alt={alt} unoptimized={String(url).endsWith(".gif")} onError={() => setFailed(src)} />;
}
