import Link from "@/components/i18n/LocaleLink";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonTone = "light" | "dark";
type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-7",
  sm: "h-10 px-5 text-[13px]",
};

function variantClasses(variant: ButtonVariant, tone: ButtonTone) {
  if (variant === "primary") {
    return "bg-gold-500 text-white font-semibold hover:bg-gold-400";
  }

  if (variant === "outline") {
    return tone === "dark"
      ? "border border-ivory/40 bg-white/10 text-ivory font-medium hover:border-ivory hover:bg-white/20"
      : "border border-navy-900/30 text-navy-900 font-medium hover:border-navy-900 hover:bg-navy-900/5";
  }

  return tone === "dark"
    ? "text-ivory font-medium underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory"
    : "text-navy-900 font-medium underline decoration-navy-900/30 underline-offset-4 hover:decoration-navy-900";
}

interface CommonProps {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = "primary",
  tone = "light",
  size = "md",
  className = "",
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variantClasses(variant, tone)} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
