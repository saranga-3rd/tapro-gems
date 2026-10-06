import { Image as ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  label?: string;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Stands in for photography that hasn't been supplied yet. Same box size
 * and position as the final image — just swap for a real `next/image` once
 * the asset arrives.
 */
export default function ImagePlaceholder({
  label = "Image placeholder",
  tone = "light",
  className = "",
}: ImagePlaceholderProps) {
  const styles =
    tone === "dark"
      ? "border-ivory/20 bg-navy-800 text-ivory/40"
      : "border-navy-900/15 bg-ivory-100 text-ink-muted/50";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed ${styles} ${className}`}
    >
      <ImageIcon className="h-8 w-8" strokeWidth={1.25} aria-hidden="true" />
      <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
    </div>
  );
}
