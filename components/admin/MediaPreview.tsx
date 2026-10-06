import Image from "next/image";
import { VIDEO_PATTERN } from "./ui";

interface MediaPreviewProps {
  src: string;
  type?: "image" | "video";
  className?: string;
  alt?: string;
  /** Rendered width in CSS px, used to pick a right-sized optimised copy. */
  size?: number;
}

/**
 * Images are served through the Next optimiser (resized to the thumbnail, high quality) so the
 * admin never downloads multi-MB originals; local blob:/data: previews are shown as-is.
 */
export default function MediaPreview({
  src,
  type,
  className = "",
  alt = "",
  size = 400,
}: MediaPreviewProps) {
  const isVideo = type ? type === "video" : VIDEO_PATTERN.test(src);
  if (isVideo) {
    return <video src={src} muted playsInline preload="none" controls className={className} />;
  }
  if (/^(blob|data):/.test(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      quality={90}
      loading="lazy"
      className={className}
    />
  );
}
