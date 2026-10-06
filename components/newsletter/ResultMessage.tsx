import { getDictionary } from "@/lib/i18n/dictionary";
import StatusCard from "./StatusCard";

export default async function ResultMessage({ status }: { status: string }) {
  const { results } = (await getDictionary()).newsletter;
  const r =
    status === "confirmed" || status === "used" || status === "expired" || status === "error"
      ? results[status]
      : results.invalid;
  return (
    <StatusCard eyebrow={r.eyebrow} title={r.title}>
      {r.body}
    </StatusCard>
  );
}
