import { notFound } from "next/navigation";
import GemstoneForm from "@/components/admin/GemstoneForm";
import { getGemstoneById } from "@/lib/store";

export default async function EditGemstonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gemstone = await getGemstoneById(id);
  if (!gemstone) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-3xl text-ink">Edit {gemstone.name}</h1>
      <GemstoneForm key={gemstone.id} gemstone={gemstone} />
    </>
  );
}
