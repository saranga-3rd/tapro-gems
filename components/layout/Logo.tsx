import Image from "next/image";
import Link from "@/components/i18n/LocaleLink";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-10 w-auto sm:h-12" }: LogoProps) {
  return (
    <Link href="/" aria-label="Tapro Gems — Home" className="inline-flex items-center">
      <Image
        src="/logo.png"
        alt="Tapro Gems"
        width={1942}
        height={809}
        priority
        className={className}
      />
    </Link>
  );
}
