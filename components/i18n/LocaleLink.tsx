"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "./LocaleProvider";

type LinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** next/link that keeps visitors in their language: internal hrefs get the locale prefix. */
export default function LocaleLink({ href, ...props }: LinkProps) {
  return <Link href={localizePath(href, useLocale())} {...props} />;
}
