import { notFound } from "next/navigation";

// Unknown URLs inside a locale render that locale's not-found page (with navbar and footer).
export default function CatchAll() {
  notFound();
}
