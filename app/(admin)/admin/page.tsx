import { Film, Gem, Images } from "lucide-react";
import Link from "next/link";
import { getGemstones, getMedia } from "@/lib/store";

export default async function AdminHome() {
  const [gemstones, collections, gallery] = await Promise.all([
    getGemstones(),
    getMedia("collections"),
    getMedia("gallery"),
  ]);

  const hubs = [
    {
      href: "/admin/shop",
      title: "Shop",
      icon: Gem,
      summary: `${gemstones.length} gemstones`,
      blurb: "Add, edit and remove gemstones, specifications, images and video.",
    },
    {
      href: "/admin/collections",
      title: "Collections",
      icon: Images,
      summary: `${collections.length} items`,
      blurb: "Manage the jewellery images and videos on the Collections page.",
    },
    {
      href: "/admin/gallery",
      title: "Gallery",
      icon: Film,
      summary: `${gallery.filter((m) => m.type === "image").length} images · ${gallery.filter((m) => m.type === "video").length} videos`,
      blurb: "Upload and remove gallery images and videos.",
    },
  ];

  return (
    <>
      <h1 className="mb-8 font-display text-3xl text-ink">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {hubs.map(({ href, title, icon: Icon, summary, blurb }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
          >
            <Icon className="h-7 w-7 text-gold-600" aria-hidden="true" />
            <h2 className="font-display text-xl text-ink">{title}</h2>
            <p className="text-sm font-medium text-gold-700">{summary}</p>
            <p className="text-sm text-ink-muted">{blurb}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
