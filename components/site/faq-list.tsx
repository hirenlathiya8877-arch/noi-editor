"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/lib/types";

export function FaqList({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div
            key={faq.q}
            className="overflow-hidden rounded-2xl border"
            style={{ background: "#111", borderColor: "#1f1f1f" }}
          >
            <button
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <span className="text-sm font-semibold text-white">{faq.q}</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform"
                style={{ color: "#FF6B1A", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            <div className={`faq-content ${open ? "open" : ""}`}>
              <p className="px-6 pb-6 text-sm leading-relaxed text-gray-500">{faq.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
