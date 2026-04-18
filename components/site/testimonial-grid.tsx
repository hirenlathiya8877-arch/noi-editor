import type { Testimonial } from "@/lib/types";

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <div
          key={t.id}
          className="card-hover rounded-2xl border p-8"
          style={{ background: "#111", borderColor: "#1f1f1f" }}
        >
          <div className="mb-4 flex gap-1">
            {"★★★★★".split("").map((star, i) => (
              <span key={`${t.id}-${i}`} style={{ color: "#FF6B1A" }}>
                {star}
              </span>
            ))}
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">"{t.text}"</p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bebas text-sm"
              style={{ background: "rgba(255,107,26,0.15)", color: "#FF6B1A" }}
            >
              {t.avatar}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t.name}</div>
              <div className="text-xs text-gray-600">{t.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
