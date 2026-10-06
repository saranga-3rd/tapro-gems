interface ColumnLinesProps {
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Subtle vertical column-line texture for section backgrounds. Colour
 * flips for dark sections so the lines stay visible against navy.
 */
export default function ColumnLines({ tone = "light", className = "" }: ColumnLinesProps) {
  const lineColor = tone === "dark" ? "rgba(250,248,244,0.07)" : "rgba(11,21,38,0.06)";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(to right, transparent, transparent 239px, ${lineColor} 239px, ${lineColor} 240px)`,
      }}
    />
  );
}
