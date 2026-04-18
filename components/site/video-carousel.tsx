"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Video } from "@/lib/types";

type VideoCarouselProps = {
  title: string;
  tag: string;
  videos: Video[];
  isShort?: boolean;
};

export function VideoCarousel({ title, tag, videos, isShort = false }: VideoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState(false);

  const total = videos.length;
  const visible = useMemo(() => {
    if (total === 0) return [];
    const prev = (index - 1 + total) % total;
    const next = (index + 1) % total;
    return [prev, index, next].map((i) => videos[i]);
  }, [index, total, videos]);

  useEffect(() => {
    if (hovered || total < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), 3500);
    return () => window.clearInterval(timer);
  }, [hovered, total]);

  const move = (dir: -1 | 1) => {
    setPlayingId(null);
    setIndex((current) => {
      if (dir === -1) return (current - 1 + total) % total;
      return (current + 1) % total;
    });
  };

  const currentReal = videos[index];

  return (
    <div className="mb-24">
      <div className="mb-10 flex items-center gap-3">
        <span className="font-bebas text-3xl tracking-wider text-white">{title}</span>
        <span className="tag rounded-full px-3 py-1 text-xs font-syne">{tag}</span>
      </div>

      <div
        className="relative flex items-center justify-center gap-2 md:gap-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => move(-1)}
          className="z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all hover:border-orange-accent hover:text-orange-accent md:h-11 md:w-11"
          style={{ borderColor: "rgba(255,107,26,0.3)", color: "#999", background: "#111" }}
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
          {visible.map((video, i) => {
            const center = i === 1;
            const isPlaying = playingId === video.id;
            const isMuted = mutedMap[video.id] ?? false;
            const thumb =
              video.thumb ||
              (video.yt ? `https://img.youtube.com/vi/${video.yt}/maxresdefault.jpg` : "https://placehold.co/1280x720");
            const aspectClass = isShort ? "aspect-[9/16]" : "aspect-video";

            return (
              <div
                key={`${video.id}-${i}`}
                className={`${center ? "opacity-100" : "hidden opacity-40 md:block"} transition-all duration-500`}
                style={{
                  transform: center ? "scale(1)" : "scale(0.85)",
                  filter: center ? "brightness(1)" : "brightness(0.55)"
                }}
              >
                <div
                  className="card-hover overflow-hidden rounded-[18px] border"
                  style={{
                    borderColor: center ? "rgba(255,107,26,0.4)" : "rgba(255,107,26,0.12)",
                    boxShadow: center
                      ? "0 0 60px rgba(255,107,26,0.25), 0 20px 60px rgba(0,0,0,0.6)"
                      : "none",
                    background: "#111"
                  }}
                >
                  <div className={`relative ${aspectClass}`}>
                    {video.mp4 ? (
                      <video
                        src={video.mp4}
                        muted={isMuted}
                        controls={false}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay={isPlaying}
                        loop
                      />
                    ) : isPlaying && video.yt ? (
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`https://www.youtube.com/embed/${video.yt}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="autoplay; encrypted-media; fullscreen"
                      />
                    ) : (
                      <img src={thumb} alt={video.title} className="absolute inset-0 h-full w-full object-cover" />
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <span className="tag inline-block rounded px-2 py-0.5 text-xs font-syne">
                        {isShort ? "Short Form" : "Long Form"}
                      </span>
                      <div className="mt-2 text-sm font-semibold text-white">{video.title}</div>
                    </div>

                    {!isPlaying ? (
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/35"
                        onClick={() => setPlayingId(video.id)}
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-full text-black"
                          style={{ background: "#FF6B1A" }}
                        >
                          <Play className="h-6 w-6 fill-black" />
                        </span>
                      </button>
                    ) : (
                      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                        <button
                          className="rounded-lg bg-black/50 p-2 text-white hover:text-orange-accent"
                          onClick={() => setPlayingId(null)}
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg bg-black/50 p-2 text-white hover:text-orange-accent"
                          onClick={() =>
                            setMutedMap((current) => ({
                              ...current,
                              [video.id]: !current[video.id]
                            }))
                          }
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => move(1)}
          className="z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all hover:border-orange-accent hover:text-orange-accent md:h-11 md:w-11"
          style={{ borderColor: "rgba(255,107,26,0.3)", color: "#999", background: "#111" }}
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => {
              setPlayingId(null);
              const target = videos.findIndex((v) => v.id === video.id);
              setIndex(target < 0 ? 0 : target);
            }}
            className="h-2 rounded-full transition-all"
            style={{
              width: video.id === currentReal?.id ? "20px" : "8px",
              background: video.id === currentReal?.id ? "#FF6B1A" : "rgba(255,107,26,0.25)"
            }}
          />
        ))}
      </div>
    </div>
  );
}
