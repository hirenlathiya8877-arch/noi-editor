"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  // Track previous index to determine slide direction
  const [animating, setAnimating] = useState(false);
  const animRef = useRef(false);

  const total = videos.length;

  const visible = useMemo(() => {
    if (total === 0) return [];
    const prev = (index - 1 + total) % total;
    const next = (index + 1) % total;
    return [prev, index, next].map((i) => ({ video: videos[i], slot: i }));
  }, [index, total, videos]);

  useEffect(() => {
    if (hovered || total < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [hovered, total]);

  const move = (dir: -1 | 1) => {
    if (animRef.current) return;
    animRef.current = true;
    setAnimating(true);
    setPlayingId(null);
    setIndex((current) => {
      if (dir === -1) return (current - 1 + total) % total;
      return (current + 1) % total;
    });
    // Reset after transition
    setTimeout(() => {
      animRef.current = false;
      setAnimating(false);
    }, 500);
  };

  const currentReal = videos[index];
  const carouselClassName = isShort ? "mb-14 md:mb-24" : "mb-6 md:mb-24";
  const trackClassName = isShort
    ? "grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-3"
    : "grid w-[calc(100vw-1.5rem)] max-w-xl grid-cols-1 gap-5 md:w-full md:max-w-6xl md:grid-cols-3";
  const dotsClassName = isShort ? "mt-8 flex justify-center gap-2" : "mt-4 flex justify-center gap-2 md:mt-8";

  const renderArrow = (dir: -1 | 1, className = "") => {
    const Icon = dir === -1 ? ChevronLeft : ChevronRight;
    const label = dir === -1 ? "Previous video" : "Next video";

    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => move(dir)}
        disabled={animating}
        className={`z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border md:h-9 md:w-9 ${className}`}
        style={{
          borderColor: "rgba(255,107,26,0.3)",
          color: "#999",
          background: "#111",
          transition: "border-color 200ms ease, color 200ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B1A";
          (e.currentTarget as HTMLButtonElement).style.color = "#FF6B1A";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,107,26,0.3)";
          (e.currentTarget as HTMLButtonElement).style.color = "#999";
        }}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  };

  return (
    <div className={carouselClassName}>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3 md:mb-10">
        <span className="font-bebas text-3xl tracking-wider text-white">{title}</span>
        <span className="tag rounded-full px-3 py-1 text-xs font-syne">{tag}</span>
      </div>

      {/* Carousel */}
      <div
        className="relative flex items-center justify-center gap-2 md:gap-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Left arrow */}
        {renderArrow(-1, "hidden md:flex")}

        {/* Cards grid */}
        <div className={trackClassName}>
          {visible.map(({ video }, i) => {
            const center = i === 1;
            const isPlaying = playingId === video.id;
            const isMuted = mutedMap[video.id] ?? false;
            const thumb =
              video.thumb ||
              (video.yt
                ? `https://img.youtube.com/vi/${video.yt}/maxresdefault.jpg`
                : "https://placehold.co/1280x720");
            const aspectClass = isShort ? "aspect-[9/16]" : "aspect-video";

            return (
              <div
                key={`${video.id}-${i}`}
                className={center ? "" : "hidden md:block"}
                style={{
                  // Use transform + opacity only — no filter in transition to avoid GPU layer thrashing
                  transform: center ? "scale(1)" : "scale(0.85)",
                  opacity: center ? 1 : 0.4,
                  filter: center ? "brightness(1)" : "brightness(0.55)",
                  // Explicit transition props — avoid transition-all
                  transition:
                    "transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms cubic-bezier(0.4,0,0.2,1), filter 420ms cubic-bezier(0.4,0,0.2,1)",
                  // Force GPU compositing layer
                  willChange: "transform, opacity",
                  transformOrigin: center ? "center center" : i === 0 ? "right center" : "left center",
                }}
              >
                <div
                  className="overflow-hidden rounded-[18px] border"
                  style={{
                    borderColor: center ? "rgba(255,107,26,0.4)" : "rgba(255,107,26,0.12)",
                    boxShadow: center
                      ? "0 0 60px rgba(255,107,26,0.25), 0 20px 60px rgba(0,0,0,0.6)"
                      : "none",
                    background: "#111",
                    // Smooth shadow transition
                    transition: "box-shadow 420ms cubic-bezier(0.4,0,0.2,1), border-color 420ms cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  {/* Media area */}
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
                      <img
                        src={thumb}
                        alt={video.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        // Prevent layout shift on image load
                        draggable={false}
                      />
                    )}

                    {/* Gradient overlay + title */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <span className="tag inline-block rounded px-2 py-0.5 text-xs font-syne">
                        {isShort ? "Short Form" : "Long Form"}
                      </span>
                      <div className="mt-2 text-sm font-semibold text-white">{video.title}</div>
                    </div>

                    {/* Play / pause controls */}
                    {!isPlaying ? (
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/35"
                        style={{ transition: "background 200ms ease" }}
                        onClick={() => setPlayingId(video.id)}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.2)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.35)")}
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-full text-black"
                          style={{
                            background: "#FF6B1A",
                            transition: "transform 200ms ease",
                            boxShadow: "0 0 24px rgba(255,107,26,0.5)",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.1)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                        >
                          <Play className="h-6 w-6 fill-black" />
                        </span>
                      </button>
                    ) : (
                      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                        <button
                          className="rounded-lg bg-black/50 p-2 text-white"
                          style={{ transition: "color 150ms ease" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FF6B1A")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                          onClick={() => setPlayingId(null)}
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg bg-black/50 p-2 text-white"
                          style={{ transition: "color 150ms ease" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FF6B1A")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                          onClick={() =>
                            setMutedMap((current) => ({
                              ...current,
                              [video.id]: !current[video.id],
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

        {/* Right arrow */}
        {renderArrow(1, "hidden md:flex")}
      </div>

      <div className="mt-5 flex justify-center gap-4 md:hidden">
        {renderArrow(-1)}
        {renderArrow(1)}
      </div>

      {/* Dot indicators */}
      <div className={dotsClassName}>
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => {
              if (animRef.current) return;
              setPlayingId(null);
              const target = videos.findIndex((v) => v.id === video.id);
              setIndex(target < 0 ? 0 : target);
            }}
            className="h-2 rounded-full"
            style={{
              width: video.id === currentReal?.id ? "20px" : "8px",
              background:
                video.id === currentReal?.id ? "#FF6B1A" : "rgba(255,107,26,0.25)",
              // Only transition width + background — cheap compositor-only props
              transition: "width 300ms cubic-bezier(0.4,0,0.2,1), background 300ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
