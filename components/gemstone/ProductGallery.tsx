"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AutoplayVideo from "@/components/ui/AutoplayVideo";
import ImageReveal from "@/components/motion/ImageReveal";

interface ProductGalleryProps {
  name: string;
  image: string;
  gallery: string[];
  videoSrc?: string;
  labels: { playVideo: string; showImage: string };
}

type Active = "video" | number;

export default function ProductGallery({ name, image, gallery, videoSrc, labels }: ProductGalleryProps) {
  const images = Array.from(new Set([image, ...gallery]));
  const [active, setActive] = useState<Active>(videoSrc ? "video" : 0);
  const showVideo = Boolean(videoSrc) && active === "video";
  const activeImage = images[typeof active === "number" ? active : 0];
  const hasThumbnails = images.length > 1 || Boolean(videoSrc);

  const thumbClasses = (selected: boolean) =>
    `relative aspect-square w-full overflow-hidden rounded-2xl shadow-sm shadow-navy-900/10 outline-offset-2 transition-opacity focus-visible:outline-2 focus-visible:outline-gold-500 ${
      selected ? "ring-2 ring-gold-500" : "opacity-70 hover:opacity-100"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <ImageReveal className="relative aspect-4/5 w-full overflow-hidden rounded-2xl shadow-xl shadow-navy-900/10">
        {showVideo ? (
          <AutoplayVideo
            key={videoSrc}
            src={videoSrc!}
            poster={image}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            key={activeImage}
            src={activeImage}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        )}
      </ImageReveal>

      {hasThumbnails ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {videoSrc ? (
            <button
              type="button"
              onClick={() => setActive("video")}
              aria-label={labels.playVideo}
              aria-pressed={showVideo}
              className={thumbClasses(showVideo)}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 1024px) 12vw, 30vw"
                className="object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-navy-950/30">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink">
                  <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden="true" />
                </span>
              </span>
            </button>
          ) : null}
          {images.map((src, index) => {
            const selected = !showVideo && active === index;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={labels.showImage.replace("{n}", String(index + 1))}
                aria-pressed={selected}
                className={thumbClasses(selected)}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 12vw, 30vw"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
