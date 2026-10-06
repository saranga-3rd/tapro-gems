import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import MediaPreview from "@/components/admin/MediaPreview";
import { primaryButton } from "@/components/admin/ui";
import { deleteGemstoneAction } from "@/lib/admin/actions";
import { getGemstones } from "@/lib/store";

export default async function AdminShopPage() {
  const gemstones = await getGemstones();

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Shop gemstones</h1>
        <Link href="/admin/shop/new" className={primaryButton}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add gemstone
        </Link>
      </div>

      {gemstones.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-ink-muted">No gemstones yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {gemstones.map((gemstone) => (
            <li
              key={gemstone.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              <MediaPreview
                src={gemstone.image}
                type="image"
                alt={gemstone.name}
                size={64}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{gemstone.name}</p>
                <p className="text-sm text-ink-muted">
                  {gemstone.category} · {gemstone.caratWeight.toFixed(2)} ct
                  {gemstone.video ? " · video" : ""}
                  {gemstone.featured ? " · featured" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/shop/${gemstone.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-900/15 px-3 py-1.5 text-sm text-ink transition-colors hover:bg-ivory-100"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Link>
                <ConfirmDeleteButton
                  action={deleteGemstoneAction}
                  fields={{ id: gemstone.id }}
                  itemName={gemstone.name}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
