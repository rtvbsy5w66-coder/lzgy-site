"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export function SafeImage({ src, alt, width = 96, height = 96, className, fallback }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
}