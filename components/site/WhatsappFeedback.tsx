"use client";

import Image from "next/image";

const screenshots = [
  { src: "/img/feedback/ss1.jpg", alt: "Client feedback 1" },
  { src: "/img/feedback/ss2.jpg", alt: "Client feedback 2" },
  { src: "/img/feedback/ss3.jpg", alt: "Client feedback 3" },
  { src: "/img/feedback/ss4.jpg", alt: "Client feedback 4" },
  { src: "/img/feedback/ss5.jpg", alt: "Client feedback 5" },
];

const rotations = ["-3deg", "1.5deg", "-1.2deg", "0.8deg", "-2deg"];
const tx = ["-10px", "14px", "-6px", "8px", "-12px"];

export function WhatsappFeedback() {
  const col1 = screenshots.filter((_, i) => i % 2 === 0); // 0,2,4
  const col2 = screenshots.filter((_, i) => i % 2 !== 0); // 1,3

  const Card = ({ item, i, globalIndex }: { item: typeof screenshots[0]; i: number; globalIndex: number }) => (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        border: "1.5px solid rgba(255,107,26,0.22)",
        background: "#131313",
        overflow: "hidden",
        marginTop: i === 0 ? 0 : -36,
        zIndex: i + 1,
        transform: `rotate(${rotations[globalIndex]}) translateX(${tx[globalIndex]})`,
        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = `rotate(${rotations[globalIndex]}) translateX(${tx[globalIndex]}) translateY(-10px) scale(1.03)`;
        el.style.zIndex = "20";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = `rotate(${rotations[globalIndex]}) translateX(${tx[globalIndex]})`;
        el.style.zIndex = String(i + 1);
      }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg,transparent,#FF6B1A 25%,#FF6B1A 75%,transparent)", opacity: 0.75 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(240,237,232,0.45)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25D366", display: "inline-block" }} />
          WhatsApp
        </div>
        <span style={{ background: "rgba(255,107,26,0.12)", border: "1px solid rgba(255,107,26,0.28)", color: "#FF6B1A", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
          CLIENT SS
        </span>
      </div>
      <Image
        src={item.src}
        alt={item.alt}
        width={360}
        height={220}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: "0 0 26px 26px" }}
      />
    </div>
  );

  return (
    <>
      {/* DESKTOP - 2 columns */}
      <div
        className="hidden md:grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "0 48px", maxWidth: 780, margin: "0 auto", alignItems: "start" }}
      >
        {/* Column 1 */}
        <div style={{ position: "relative" }}>
          {col1.map((item, i) => (
            <Card key={i} item={item} i={i} globalIndex={i * 2} />
          ))}
        </div>
        {/* Column 2 — thoda neeche se shuru */}
        <div style={{ position: "relative", marginTop: 80 }}>
          {col2.map((item, i) => (
            <Card key={i} item={item} i={i} globalIndex={i * 2 + 1} />
          ))}
        </div>
      </div>

      {/* MOBILE - single stack (same as before) */}
      <div
        className="md:hidden"
        style={{ position: "relative", maxWidth: 360, margin: "0 auto" }}
      >
        {screenshots.map((item, i) => (
          <Card key={i} item={item} i={i} globalIndex={i} />
        ))}
      </div>
    </>
  );
}