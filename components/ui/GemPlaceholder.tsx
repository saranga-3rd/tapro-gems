export type GemTone = "sapphire" | "ruby" | "gold" | "mixed";

interface GemPlaceholderProps {
  tone?: GemTone;
  className?: string;
}

const tones: Record<GemTone, string> = {
  sapphire: "from-sapphire-400 via-sapphire-700 to-navy-950",
  ruby: "from-rose-400 via-rose-800 to-navy-950",
  gold: "from-gold-200 via-gold-500 to-navy-900",
  mixed: "from-sapphire-500 via-gold-400 to-navy-950",
};

/**
 * Stand-in for cinematic gemstone photography/video until real assets are
 * supplied. Swap for `next/image` or a video element without changing callers.
 */
export default function GemPlaceholder({
  tone = "sapphire",
  className = "",
}: GemPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-linear-to-br ${tones[tone]} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.15),transparent_50%)]" />
    </div>
  );
}
