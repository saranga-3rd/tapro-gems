import type { ReactNode } from "react";
import ColumnLines from "./ColumnLines";
import Container from "./Container";

const backgrounds = {
  ivory: "bg-ivory text-ink",
  white: "bg-white text-ink",
  navy: "bg-navy-900 text-ivory",
  "navy-deep": "bg-navy-950 text-ivory",
} as const;

const lineTone = {
  ivory: "light",
  white: "light",
  navy: "dark",
  "navy-deep": "dark",
} as const;

export type SectionBackground = keyof typeof backgrounds;

interface SectionProps {
  id?: string;
  background?: SectionBackground;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  noContainer?: boolean;
}

export default function Section({
  id,
  background = "ivory",
  children,
  className = "",
  containerClassName = "",
  noContainer = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-24 md:py-32 lg:py-40 ${backgrounds[background]} ${className}`}
    >
      <ColumnLines tone={lineTone[background]} />
      {noContainer ? (
        <div className="relative">{children}</div>
      ) : (
        <Container className={`relative ${containerClassName}`}>{children}</Container>
      )}
    </section>
  );
}
