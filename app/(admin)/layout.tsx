import { cormorant, inter, playfair } from "@/lib/fonts";
import "../globals.css";

// The admin dashboard is its own root layout: English only, no public navbar/footer.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">{children}</body>
    </html>
  );
}
