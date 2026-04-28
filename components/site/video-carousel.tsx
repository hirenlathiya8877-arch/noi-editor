"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<-1 | 1>(1);
  const animRef = useRef(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = videos.length;

  const visible = useMemo(() => {
    if (total === 0) return [];
    const prev = (index - 1 + total) % total;
    const next = (index + 1) % total;
    return [prev, index, next].map((i) => videos[i]);
  }, [index, total, videos]);

  const queueAnimationEnd = useCallback(() => {
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      animRef.current = false;
      setAnimating(false);
    }, 620);
  }, []);

  const beginSlide = useCallback((dir: -1 | 1) => {
    animRef.current = true;
    setSlideDir(dir);
    setAnimating(true);
    setPlayingId(null);
    queueAnimationEnd();
  }, [queueAnimationEnd]);

  const move = useCallback((dir: -1 | 1) => {
    if (animRef.current || total < 2) return;
    beginSlide(dir);
    setIndex((current) => {
      if (dir === -1) return (current - 1 + total) % total;
      return (current + 1) % total;
    });
  }, [beginSlide, total]);

  useEffect(() => {
    if (hovered || total < 2) return;
    const timer = window.setInterval(() => move(1), 3500);
    return () => window.clearInterval(timer);
  }, [hovered, move, total]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

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
          e.currentTarget.style.borderColor = "#FF6B1A";
          e.currentTarget.style.color = "#FF6B1A";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,107,26,0.3)";
          e.currentTarget.style.color = "#999";
        }}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  };

  return (
    <div className={carouselClassName}>
      <div className="mb-8 flex items-center gap-3 md:mb-10">
        <span className="font-bebas text-3xl tracking-wider text-white">{title}</span>
        <span className="tag rounded-full px-3 py-1 text-xs font-syne">{tag}</span>
      </div>

      <div
        className="relative flex items-center justify-center gap-2 md:gap-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {renderArrow(-1, isShort ? "flex" : "hidden md:flex")}

        <div className={trackClassName}>
          {visible.map((video, i) => {
            const center = i === 1;
            const isPlaying = playingId === video.id;
            const isMuted = mutedMap[video.id] ?? false;
            const thumb =
              video.thumb ||
              (video.yt
                ? `https://img.youtube.com/vi/${video.yt}/maxresdefault.jpg`
                : "https://placehold.co/1280x720");
            const aspectClass = isShort ? "aspect-[9/16]" : "aspect-video";
            const cardStyle = {
              transform: center ? "scale(1)" : "scale(0.85)",
              opacity: center ? 1 : 0.4,
              filter: center ? "brightness(1)" : "brightness(0.55)",
              transition:
                "transform 560ms cubic-bezier(0.22,1,0.36,1), opacity 560ms cubic-bezier(0.22,1,0.36,1), filter 560ms cubic-bezier(0.22,1,0.36,1)",
              willChange: "transform, opacity",
              transformOrigin: center ? "center center" : i === 0 ? "right center" : "left center",
              animation: animating ? "carousel-card-in 560ms cubic-bezier(0.22,1,0.36,1) both" : undefined,
              "--carousel-slide-from": slideDir === 1 ? "28px" : "-28px",
              "--carousel-start-opacity": center ? "0.58" : "0.18",
              "--carousel-final-opacity": center ? "1" : "0.4",
              "--carousel-start-scale": center ? "0.96" : "0.78",
              "--carousel-final-scale": center ? "1" : "0.85",
            } as CSSProperties;

            return (
              <div
                key={`${video.id}-${i}`}
                className={`carousel-slide-card ${center ? "" : "hidden md:block"}`}
                style={cardStyle}
              >
                <div
                  className="overflow-hidden rounded-[18px] border"
                  style={{
                    borderColor: center ? "rgba(255,107,26,0.4)" : "rgba(255,107,26,0.12)",
                    boxShadow: center
                      ? "0 0 60px rgba(255,107,26,0.25), 0 20px 60px rgba(0,0,0,0.6)"
                      : "none",
                    background: "#111",
                    transition: "box-shadow 560ms cubic-bezier(0.22,1,0.36,1), border-color 560ms cubic-bezier(0.22,1,0.36,1)",
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
                      <img
                        src={thumb}
                        alt={video.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        draggable={false}
                      />
                    )}

                    {!isPlaying ? (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <span className="tag inline-block rounded px-2 py-0.5 text-xs font-syne">
                          {isShort ? "Short Form" : "Long Form"}
                        </span>
                        <div className="mt-2 text-sm font-semibold text-white">{video.title}</div>
                      </div>
                    ) : null}

                    {!isPlaying ? (
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/35"
                        style={{ transition: "background 200ms ease" }}
                        onClick={() => setPlayingId(video.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.35)")}
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-full text-black"
                          style={{
                            background: "#FF6B1A",
                            transition: "transform 200ms ease",
                            boxShadow: "0 0 24px rgba(255,107,26,0.5)",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <Play className="h-6 w-6 fill-black" />
                        </span>
                      </button>
                    ) : (
                      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                        <button
                          className="rounded-lg bg-black/50 p-2 text-white"
                          style={{ transition: "color 150ms ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B1A")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
                          onClick={() => setPlayingId(null)}
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg bg-black/50 p-2 text-white"
                          style={{ transition: "color 150ms ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B1A")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
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

        {renderArrow(1, isShort ? "flex" : "hidden md:flex")}
      </div>

      {!isShort && (
        <div className="mt-5 flex justify-center gap-4 md:hidden">
          {renderArrow(-1)}
          {renderArrow(1)}
        </div>
      )}

      <div className={dotsClassName}>
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => {
              if (animRef.current || total < 2) return;
              const target = videos.findIndex((v) => v.id === video.id);
              if (target < 0 || target === index) return;
              const forwardSteps = (target - index + total) % total;
              const backwardSteps = (index - target + total) % total;
              beginSlide(forwardSteps <= backwardSteps ? 1 : -1);
              setIndex(target);
            }}
            className="h-2 rounded-full"
            style={{
              width: video.id === currentReal?.id ? "20px" : "8px",
              background:
                video.id === currentReal?.id ? "#FF6B1A" : "rgba(255,107,26,0.25)",
              transition: "width 300ms cubic-bezier(0.4,0,0.2,1), background 300ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
