import ImagePathAdder from "@/components/admin/ImagePathAdder";
import MediaAdder from "@/components/admin/MediaAdder";
import MediaCard from "@/components/admin/MediaCard";
import { getMedia } from "@/lib/store";

export default async function AdminCollectionsPage() {
  const items = await getMedia("collections");

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Collections</h1>
        <MediaAdder list="collections" label="Upload videos" />
      </div>

      <div className="mb-8">
        <ImagePathAdder list="collections" />
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-ink-muted">
          No collection items yet.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} list="collections" item={item} />
          ))}
        </ul>
      )}
    </>
  );
}
