"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface AutoplayVideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "autoPlay" | "muted" | "loop" | "playsInline"> {
  src: string;
  poster: string;
}

/**
 * Silent looping video that starts on its own, including on iOS/Android.
 * Mobile browsers only autoplay when the video is muted and inline, and
 * React does not reliably reflect `muted` as a DOM property, so it is set
 * imperatively. Playback is paused while off-screen to keep scrolling smooth.
 */
export default function AutoplayVideo({ src, poster, className, ...props }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);

    // Retry when the browser only allows playback after the first touch.
    const resume = () => {
      if (video.paused) void video.play().catch(() => {});
    };
    window.addEventListener("touchstart", resume, { once: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("touchstart", resume);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      className={className}
      {...props}
    />
  );
}
