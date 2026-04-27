"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const screenshots = [
  { src: "/img/feedback/ss1.jpg", alt: "Client feedback 1" },
  { src: "/img/feedback/ss2.jpg", alt: "Client feedback 2" },
  { src: "/img/feedback/ss3.jpg", alt: "Client feedback 3" },
  { src: "/img/feedback/ss4.jpg", alt: "Client feedback 4" },
  { src: "/img/feedback/ss5.jpg", alt: "Client feedback 5" },
  { src: "/img/feedback/ss6.jpg", alt: "Client feedback 6" },
];

const rotations = ["-3deg", "1.5deg", "-1.2deg", "0.8deg", "-2deg", "2.5deg"];
const tx = ["-10px", "14px", "-6px", "8px", "-12px", "6px"];

// ✅ BAHAR — re-render pe naya component nahi banega
const Card = ({
  item,
  i,
  globalIndex,
  isActive,
  onTouchEnd,
}: {
  item: (typeof screenshots)[0];
  i: number;
  globalIndex: number;
  isActive: boolean;
  onTouchEnd: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(false); // ek baar hi reveal ho

  useEffect(() => {
    const el = cardRef.current;
    if (!el || revealed.current) return;

    el.style.opacity = "0";
    el.style.translate = "0 40px";
    el.style.transition = `opacity 0.6s ease ${globalIndex * 0.1}s, translate 0.6s ease ${globalIndex * 0.1}s`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed.current) {
          revealed.current = true; // flag set — dobara nahi chalega
          el.style.opacity = "1";
          el.style.translate = "0 0";
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // ✅ empty deps — sirf mount pe ek baar

  const baseTransform = `rotate(${rotations[globalIndex]}) translateX(${tx[globalIndex]})`;
  const activeTransform = `rotate(${rotations[globalIndex]}) translateX(${tx[globalIndex]}) translateY(-14px) scale(1.04)`;

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        borderRadius: 28,
        border: "1.5px solid rgba(255,107,26,0.22)",
        background: "#131313",
        overflow: "hidden",
        marginTop: i === 0 ? 0 : -36,
        zIndex: isActive ? 20 : i + 1,
        transform: isActive ? activeTransform : baseTransform,
        willChange: "transform",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia("(hover: none)").matches) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
        el.style.transform = activeTransform;
        el.style.zIndex = "20";
      }}
      onMouseLeave={(e) => {
        if (window.matchMedia("(hover: none)").matches) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
        el.style.transform = baseTransform;
        el.style.zIndex = String(i + 1);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        const el = e.currentTarget as HTMLDivElement;
        requestAnimationFrame(() => {
          el.style.transition = "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";
          el.style.transform = !isActive ? activeTransform : baseTransform;
          el.style.zIndex = !isActive ? "20" : String(i + 1);
        });
      }}
      onTouchEnd={onTouchEnd}
    >
      {/* top accent line */}
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg,transparent,#FF6B1A 25%,#FF6B1A 75%,transparent)",
          opacity: 0.75,
        }}
      />

      {/* header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(240,237,232,0.45)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25D366", display: "inline-block" }} />
          WhatsApp
        </div>
        <span style={{ background: "rgba(255,107,26,0.12)", border: "1px solid rgba(255,107,26,0.28)", color: "#FF6B1A", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
          CLIENT SS
        </span>
      </div>

      {/* screenshot image */}
      <Image
        src={item.src}
        alt={item.alt}
        width={360}
        height={220}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: "0 0 26px 26px" }}
      />
    </div>
  );
};

export function WhatsappFeedback() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const col1 = screenshots.filter((_, i) => i % 2 === 0);
  const col2 = screenshots.filter((_, i) => i % 2 !== 0);

  return (
    <>
      {/* DESKTOP */}
      <div
        className="hidden md:grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "0 48px", maxWidth: 780, margin: "0 auto", alignItems: "start", overflow: "visible" }}
      >
        <div style={{ position: "relative", overflow: "visible" }}>
          {col1.map((item, i) => (
            <Card
              key={i}
              item={item}
              i={i}
              globalIndex={i * 2}
              isActive={activeIndex === i * 2}
              onTouchEnd={() => setActiveIndex(activeIndex === i * 2 ? null : i * 2)}
            />
          ))}
        </div>
        <div style={{ position: "relative", marginTop: 80, overflow: "visible" }}>
          {col2.map((item, i) => (
            <Card
              key={i}
              item={item}
              i={i}
              globalIndex={i * 2 + 1}
              isActive={activeIndex === i * 2 + 1}
              onTouchEnd={() => setActiveIndex(activeIndex === i * 2 + 1 ? null : i * 2 + 1)}
            />
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div
        className="md:hidden"
        style={{ position: "relative", maxWidth: 360, margin: "0 auto", overflow: "visible" }}
      >
        {screenshots.map((item, i) => (
          <Card
            key={i}
            item={item}
            i={i}
            globalIndex={i}
            isActive={activeIndex === i}
            onTouchEnd={() => setActiveIndex(activeIndex === i ? null : i)}
          />
        ))}
      </div>
    </>
  );
}