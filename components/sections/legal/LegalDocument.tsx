import Link from "@/components/i18n/LocaleLink";
import Container from "@/components/ui/Container";
import type { LegalBlock, LegalSection } from "@/lib/data/legal/types";

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-base leading-relaxed text-ink-muted">
          {block.text}
          {block.link ? (
            <>
              {" "}
              <Link
                href={block.link.href}
                className="text-navy-900 underline decoration-navy-900/30 underline-offset-4 hover:decoration-navy-900"
              >
                {block.link.label}
              </Link>
              .
            </>
          ) : null}
        </p>
      );

    case "subheading":
      return <h3 className="font-display text-xl text-ink">{block.text}</h3>;

    case "list":
      return (
        <ul className="flex flex-col gap-2 text-base leading-relaxed text-ink-muted">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              {item}
            </li>
          ))}
        </ul>
      );

    case "fields":
      return (
        <dl className="grid gap-3 rounded-2xl border border-navy-900/10 bg-white p-6 sm:grid-cols-2">
          {block.items.map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <dt className="text-xs font-medium tracking-[0.15em] text-ink-muted uppercase">
                {field.label}
              </dt>
              <dd className="text-sm text-ink">{field.value}</dd>
            </div>
          ))}
        </dl>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-navy-900/10">
          <table className="w-full min-w-140 border-collapse text-left text-sm">
            <thead>
              <tr className="bg-navy-900/4">
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="border-b border-navy-900/10 px-4 py-3 text-xs font-medium tracking-[0.15em] text-ink-muted uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-ivory-100/60">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-b border-navy-900/5 px-4 py-3 text-ink-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

function Section({ section }: { section: LegalSection }) {
  return (
    <section
      id={section.heading.replace(/^\d+\.\s*/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
      className="scroll-mt-24 flex flex-col gap-4 border-t border-navy-900/10 py-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl text-ink">{section.heading}</h2>
      {section.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </section>
  );
}

export default function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <section className="bg-ivory pb-24">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col">
          {sections.map((section) => (
            <Section key={section.heading} section={section} />
          ))}
        </div>
      </Container>
    </section>
  );
}
