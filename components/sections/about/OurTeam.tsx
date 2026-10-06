import Image from "next/image";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { teamBlocks } from "@/lib/data/team";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function OurTeam() {
  const t = (await getDictionary()).about.team;
  return (
    <Section id="team" background="white" className="scroll-mt-20">
      <Reveal className="mb-16 flex flex-col items-center gap-4 text-center">
        <span className="h-2 w-2 rounded-full bg-gold-500" aria-hidden="true" />
        <h2 className="font-display text-3xl font-semibold tracking-[0.2em] text-ink uppercase sm:text-4xl">
          {t.heading}
        </h2>
        <span className="h-px w-12 bg-gold-500" />
      </Reveal>

      <div className="flex flex-col gap-24 lg:gap-32">
        {teamBlocks.map((block, index) => {
          const imageRight = index % 2 === 1;
          return (
            <div
              key={block.image}
              className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal
                className={`relative mx-auto w-full max-w-xl lg:max-w-none ${
                  imageRight ? "lg:order-last" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -top-6 -z-10 h-4/5 w-3/5 rounded-2xl bg-sapphire-100 ${
                    imageRight ? "-right-6" : "-left-6"
                  }`}
                />
                <ImageReveal className="relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-xl shadow-navy-900/10">
                  <Image
                    src={block.image}
                    alt={t.blocks[block.id].imageAlt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    className="object-cover"
                  />
                </ImageReveal>
              </Reveal>

              <Reveal delay={0.15} className="flex flex-col gap-10">
                {block.members.map((memberId) => {
                  const member = t.members[memberId];
                  return (
                    <div key={memberId} className="flex flex-col gap-4">
                      <span className="text-sm font-medium tracking-[0.2em] text-gold-600 uppercase">
                        {member.title}
                      </span>
                      <h3 className=" font-bold text-base leading-tight text-ink sm:text-base">
                        {member.name}
                      </h3>
                      <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted sm:text-lg">
                        {member.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </Reveal>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
