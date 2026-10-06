import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { cormorant, inter, playfair } from "@/lib/fonts";
import { hasLocale, locales, SITE_URL } from "@/lib/i18n/config";
import { getDictionaryFor, pickClientDictionary } from "@/lib/i18n/dictionary";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { site } = await getDictionaryFor(lang);
  return { metadataBase: new URL(SITE_URL), title: site.title, description: site.description };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionaryFor(lang);

  return (
    <html
      lang={lang}
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        <LocaleProvider locale={lang} dictionary={pickClientDictionary(dictionary)}>
          <SmoothScroll />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer dictionary={dictionary.footer} />
        </LocaleProvider>
      </body>
    </html>
  );
}
