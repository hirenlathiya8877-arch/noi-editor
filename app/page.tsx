"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Clapperboard, Clock, Film, Gamepad2, Megaphone, MessageCircle, RefreshCw, Sparkles, Zap, Mail } from "lucide-react";
import { CustomCursor } from "@/components/site/custom-cursor";
import { FaqList } from "@/components/site/faq-list";
import { NavBar } from "@/components/site/nav-bar";
import { VideoCarousel } from "@/components/site/video-carousel";
import { defaultFaqs } from "@/lib/default-data";
import { WhatsappFeedback } from "@/components/site/WhatsappFeedback";
import type { FAQ, Testimonial, Video } from "@/lib/types";

type SiteResponse = {
  videos: Video[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  logo: string;
};

const defaultState: SiteResponse = {
  videos: [],
  testimonials: [],
  faqs: defaultFaqs,
  logo: ""
};

const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("visible", e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

// ✅ BAHAR HAI - HomePage ke andar NAHI
const useCountUp = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, count };
};

// ✅ BAHAR HAI - HomePage ke andar NAHI
const StatItem = ({ end, suffix, label }: { end: number; suffix: string; label: string }) => {
  const { ref, count } = useCountUp(end, 2000);
  return (
    <div ref={ref} className="text-center">
      <div className="font-bebas text-5xl" style={{ color: "#FF6B1A" }}>{count}{suffix}</div>
      <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "rgba(240,237,232,0.45)" }}>{label}</div>
    </div>
  );
};

const team = [
  {
    name: "Hiren Lathiya",
    role: "FOUNDER",
    tag: "Video Editor",
    image: "/img/hiren.jpg",
    ig: "https://www.instagram.com/elitehiren?igsh=MXJjeHFyd2k4cG5mag=="
  },
  {
    name: "Krishnarajsinh Jadeja ",
    role: "CO-FOUNDER",
    tag: "Video Editor",
    image: "",
    ig: "https://www.instagram.com/krrishnrajsinh_1635?igsh=djZ3Y290YW1hbHVk"
  }
];

const starkParticles = Array.from({ length: 18 }, (_, index) => index);
const targaryenParticles = Array.from({ length: 18 }, (_, index) => index);

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricing, setPricing] = useState<"india" | "world">("india");
  const [site, setSite] = useState<SiteResponse>(defaultState);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", projectType: "", message: "" });
  const [teamIdx, setTeamIdx] = useState(0);
  const [teamFlip, setTeamFlip] = useState(false);
  const [teamRotation, setTeamRotation] = useState(0);
  const [teamFaces, setTeamFaces] = useState<[number, number]>([0, 1]);
  const teamIdxRef = useRef(0);
  const teamFlipRef = useRef(false);
  const teamAnimatingRef = useRef(false);
  const teamRotationRef = useRef(0);
  const teamFlipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useScrollReveal();

  const flipTeamTo = (next: number) => {
    if (teamAnimatingRef.current || next === teamIdxRef.current) return;

    const hiddenFace = teamFlipRef.current ? 0 : 1;
    const nextFlip = !teamFlipRef.current;
    teamAnimatingRef.current = true;
    teamFlipRef.current = nextFlip;
    teamRotationRef.current += 180;

    setTeamFaces((faces) => {
      const updated: [number, number] = [faces[0], faces[1]];
      updated[hiddenFace] = next;
      return updated;
    });
    setTeamFlip(nextFlip);
    setTeamRotation(teamRotationRef.current);

    if (teamFlipTimeoutRef.current) clearTimeout(teamFlipTimeoutRef.current);
    teamFlipTimeoutRef.current = setTimeout(() => {
      teamIdxRef.current = next;
      teamAnimatingRef.current = false;
      setTeamIdx(next);
    }, 850);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      flipTeamTo((teamIdxRef.current + 1) % team.length);
    }, 2400);
    return () => {
      clearInterval(timer);
      if (teamFlipTimeoutRef.current) clearTimeout(teamFlipTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/site", { cache: "no-store" });
      if (!response.ok) return;
      const data: SiteResponse = await response.json();
      setSite({
        videos: data.videos || [],
        testimonials: data.testimonials || [],
        faqs: data.faqs || defaultFaqs,
        logo: data.logo || ""
      });
    };
    load().catch(() => undefined);
  }, []);

  const shortVideos = useMemo(
    () => site.videos.filter((v) => v.category.toLowerCase() === "short"),
    [site.videos]
  );
  const longVideos = useMemo(
    () => site.videos.filter((v) => v.category.toLowerCase() !== "short"),
    [site.videos]
  );

  const submitContact = async () => {
    if (!formData.name || !formData.email || !formData.message) { setMessage("Please fill all fields."); return; }
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (!response.ok) { setMessage("Could not send message. Please try again."); return; }
    setFormData({ name: "", email: "", projectType: "", message: "" });
    setMessage("✓ Message sent! We'll get back to you soon.");
  };

  const renderTeamCard = (person: (typeof team)[number]) => (
    <div className="relative overflow-hidden rounded-[28px] border" style={{ background: "linear-gradient(135deg,#1a1a1a,#111)", borderColor: "rgba(255,107,26,0.2)", boxShadow: "0 0 40px rgba(255,107,26,0.08)" }}>
      {/* Photo area */}
      <div className="relative h-80 flex items-end justify-center" style={{ background: "linear-gradient(180deg,#1a0d0d 0%,#150a0a 60%,#111 100%)" }}>
        {/* Arch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-56 rounded-t-full border-2" style={{ borderColor: "rgba(255,107,26,0.15)", background: "rgba(255,107,26,0.03)" }} />
        {/* Avatar */}
        <div className="relative z-10 mb-4 flex h-52 w-40 items-end justify-center rounded-t-full overflow-hidden" style={{ background: "linear-gradient(180deg,rgba(255,107,26,0.12),rgba(255,107,26,0.04))" }}>
          {person.image ? (
            <Image
              src={person.image}
              alt={person.name}
              fill
              sizes="160px"
              className="object-cover object-top"
            />
          ) : (
            <span className="font-bebas text-7xl pb-4" style={{ color: "rgba(255,107,26,0.25)" }}>{person.name[0]}</span>
          )}
        </div>
        {/* Badge */}
        <div className="absolute top-6 left-4 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm" style={{ background: "rgba(255,107,26,0.15)", border: "1px solid rgba(255,107,26,0.3)", color: "#FF6B1A" }}>
          {"\u2726"} {person.tag}
        </div>
        {/* Instagram only */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <a href={person.ig} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all hover:scale-110 hover:bg-orange-500" style={{ background: "rgba(255,107,26,0.15)", color: "#FF6B1A", border: "1px solid rgba(255,107,26,0.25)" }}>ig</a>
        </div>
      </div>
      {/* Name */}
      <div className="border-t px-6 py-5 text-center" style={{ borderColor: "rgba(255,107,26,0.1)" }}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,107,26,0.6)" }}>{person.role}</p>
        <h3 className="font-bebas text-2xl tracking-wide text-white">{person.name}</h3>
      </div>
    </div>
  );

  return (
    <main className="bg-[#080808] text-[#F0EDE8]">
      <CustomCursor />
      <NavBar logo={site.logo} mobileOpen={mobileMenuOpen} onToggleMobile={() => setMobileMenuOpen((o) => !o)} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* HERO */}
      <section className="hero-gradient relative flex flex-col items-center px-6 pb-16 pt-32 text-center md:pt-24">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle,#FF6B1A,transparent)", filter: "blur(60px)" }} />
        <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle,#FF6B1A,transparent)", filter: "blur(40px)" }} />
        <div className="float tag relative z-10 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-accent" />
          Available for New Projects
        </div>
        <h1 className="section-title text-glow animate-pulse-slow relative z-10 mb-6 w-full leading-none" style={{ fontSize: "clamp(3.2rem,12vw,11rem)" }}>
          RAW TO<br /><span style={{ color: "#FF6B1A" }}>ROYALTY</span>
        </h1>
        <p className="relative z-10 mx-auto mb-10 max-w-sm text-base tracking-wide text-gray-400">
          <span className="font-semibold text-white">NOI EDITORS</span> — We make your vision{" "}
          <span className="font-semibold" style={{ color: "#FF6B1A" }}>Legendary.</span>
        </p>
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4 mb-12 sm:flex-row">
          <a href="#work" className="glow-orange rounded-full px-8 py-4 font-syne font-semibold text-black text-center w-64 active:opacity-80" style={{ background: "#FF6B1A" }}>See Our Work ↓</a>
          <a href="#contact" className="rounded-full border px-8 py-4 font-syne font-semibold text-white text-center w-64 active:opacity-80" style={{ borderColor: "rgba(255,107,26,0.3)" }}>Start a Project</a>
        </div>
        {/* STATS */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-6 md:grid-cols-4 md:gap-x-20">
          {[
            { end: 450, suffix: "+", label: "VIDEOS EDITED" },
            { end: 18, suffix: "+", label: "HAPPY CLIENTS" },
            { end: 3, suffix: "+", label: "YEARS EXP" },
            { end: 24, suffix: "H", label: "FAST DELIVERY" },
          ].map((stat) => (
            <StatItem key={stat.label} end={stat.end} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </section>

      {/* TOOLS MARQUEE */}
      <div className="overflow-hidden border-b border-t py-4" style={{ background: "linear-gradient(90deg,rgba(8,8,8,1) 0%,rgba(255,107,26,0.03) 50%,rgba(8,8,8,1) 100%)", borderColor: "rgba(255,107,26,0.15)", maxWidth: "100vw", width: "100%" }}>
        <div className="marquee-track">
          <span className="inline-flex items-center gap-8 pr-8" style={{ whiteSpace: "nowrap" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-8">
                {[{ label: "After Effects", icon: "Ae" }, { label: "Premiere Pro", icon: "Pr" }, { label: "DaVinci Resolve", icon: "Da" }, { label: "Photoshop", icon: "Ps" }, { label: "AI Tools", icon: "AI" }, { label: "Motion Graphics", icon: "Mo" }, { label: "Color Grading", icon: "Cg" }, { label: "Sound Design", icon: "Sd" }].map((tool) => (
                  <span key={tool.label} className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded text-[9px] font-bold" style={{ background: "rgba(255,107,26,0.15)", color: "#FF6B1A", fontFamily: "monospace" }}>{tool.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(240,237,232,0.45)", letterSpacing: "0.1em" }}>{tool.label}</span>
                    <span style={{ color: "rgba(255,107,26,0.3)", fontSize: "8px" }}>◆</span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* OUR WORK */}
      <section id="work" className="mx-auto max-w-7xl px-6 pb-8 pt-12 md:pb-32 md:pt-16">
        <div className="mb-16 text-center">
         <div className="orange-line mx-auto mb-4" />
          <div className="flex flex-col items-center justify-center gap-3">
            <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>OUR WORK</h2>
            <span className="text-sm text-gray-500">Short Form ✦ Reels ✦ YouTube</span>
          </div>
        </div>
        {shortVideos.length > 0 && <VideoCarousel title="SHORT FORM" tag="Reels · Shorts" videos={shortVideos} isShort />}
        {longVideos.length > 0 && <VideoCarousel title="LONG FORM" tag="YouTube " videos={longVideos} />}
      </section>
       

       {/* TESTIMONIALS */}
  <section id="testimonials" className="px-6 py-20 md:py-32">
  <div className="mx-auto max-w-7xl">
    <div className="mb-10 text-center md:mb-16">
      <div className="orange-line mx-auto mb-4" />
      <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>CLIENT FEEDBACK</h2>
    </div>
    <div className="reveal">
      <WhatsappFeedback />
    </div>
  </div>
</section>
       
       {/* TEAM */}
      <section id="team" className="bg-[#080808] px-6 pb-20 pt-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <div className="orange-line mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest mb-2 reveal" style={{ color: "#FF6B1A" }}>MEET THE TEAM</p>
            <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>OUR EDITORS</h2>
          </div>
          <div className="flex flex-col items-center reveal">
            <div className="relative w-72" style={{ perspective: "1200px" }} onMouseEnter={() => {}}>
              <div
                data-flipped={teamFlip ? "true" : "false"}
                style={{
                  transformStyle: "preserve-3d",
                  transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)",
                  transform: `rotateY(${teamRotation}deg)`,
                  position: "relative",
                  willChange: "transform"
                }}
              >
                <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                  {renderTeamCard(team[teamFaces[0]])}
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  {renderTeamCard(team[teamFaces[1]])}
                </div>
              </div>
            </div>
            {/* Dots */}
            <div className="flex gap-2 mt-6">
              {team.map((_, i) => (
                <button key={i} type="button" aria-label={`Show ${team[i].name}`} onClick={() => flipTeamTo(i)} className="rounded-full transition-all"
                  style={{ width: i === teamIdx ? "20px" : "8px", height: "8px", background: i === teamIdx ? "#FF6B1A" : "rgba(255,107,26,0.25)" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="stripe-bg bg-[#080808] px-6 pb-16 pt-20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center md:mb-16">
            <div className="orange-line mx-auto mb-4" />
            <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>WHAT NOI DO</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500 reveal">Premium video editing, motion graphics, and visual storytelling for brands, creators, and businesses.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {[
              { title: "Short Form", icon: <Zap className="h-5 w-5" />, copy: "Scroll-stopping Reels, Shorts." },
              { title: "Long Form", icon: <Film className="h-5 w-5" />, copy: "Story-driven YouTube videos with clean pacing." },
              { title: "Motion Graphics", icon: <Sparkles className="h-5 w-5" />, copy: "Dynamic animations and visual effects." },
              { title: "Promo Ads", icon: <Megaphone className="h-5 w-5" />, copy: "High-converting promotional ad edits." },
              { title: "Shooting", icon: <Camera className="h-5 w-5" />, copy: "Exclusive shooting services in Jamnagar, Gujarat covering events, brands, and commercial spaces. Please note, wedding shoots are not part of our services." }
            ].map((service) => (
              <div key={service.title} className="card-hover rounded-2xl border p-8 reveal" style={{ background: "#111111", borderColor: "#1f1f1f" }}>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(255,107,26,0.1)", color: "#FF6B1A" }}>{service.icon}</div>
                <h3 className="mb-3 text-lg font-bold text-white">{service.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{service.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {[Gamepad2, Clapperboard, Clock, RefreshCw, Camera].map((Icon, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border p-5 reveal ${i === 4 ? "col-span-2 mx-auto w-[calc(50%-0.5rem)] md:col-span-1 md:mx-0 md:w-auto" : ""}`}
                style={{ background: "#111", borderColor: "#1f1f1f" }}
              >
                <Icon className="h-5 w-5 shrink-0" style={{ color: "#FF6B1A" }} />
                <span className="text-sm font-semibold">{["Gaming Videos", "Cinematic Edits", "24H Fast Delivery", "Unlimited Revisions", "Professional Shoot"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* PRICING */}
<section id="pricing" className="bg-[#080808] px-6 py-20 md:py-32" style={{
  backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(255,107,26,0.025) 60px,rgba(255,107,26,0.025) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,107,26,0.025) 60px,rgba(255,107,26,0.025) 61px)`
}}>
  <div className="mx-auto max-w-5xl">
    <div className="mb-10 text-center md:mb-16">
      <div className="orange-line mx-auto mb-4" />
      <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>PRICING PLANS</h2>
    </div>

    {/* Toggle */}
    <div className="mb-12 flex justify-center">
      <div className="flex rounded-full p-1" style={{ background: "#111", border: "1px solid #2a2a2a" }}>
        <button onClick={() => setPricing("india")} className="rounded-full px-6 py-2 text-xs font-semibold tracking-widest transition-all font-cinzel" style={{ background: pricing === "india" ? "#FF6B1A" : "transparent", color: pricing === "india" ? "#000" : "#666" }}>India 🇮🇳</button>
        <button onClick={() => setPricing("world")} className="rounded-full px-6 py-2 text-xs font-semibold tracking-widest transition-all font-cinzel" style={{ background: pricing === "world" ? "#FF6B1A" : "transparent", color: pricing === "world" ? "#000" : "#666" }}>Outside India 🌍</button>
      </div>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

      {/* STARK PACK */}
      <div className="got-price-card got-price-card--stark relative overflow-hidden rounded-2xl p-px transition-transform hover:-translate-y-1" style={{ background: "#0e1215", border: "1px solid #3a4a5a" }}>
        <div className="got-price-particles got-price-particles--snow" aria-hidden="true">
          {starkParticles.map((particle) => (
            <span key={particle} />
          ))}
        </div>
        <div className="got-price-content rounded-2xl p-7" style={{ background: "linear-gradient(160deg,rgba(14,18,21,0.94) 0%,rgba(10,13,16,0.96) 100%)" }}>
          <div className="flex justify-center mb-4">
            <img src="/targaryen-dragon.png" alt="House Stark" className="got-house-sigil got-house-sigil--stark h-24 w-auto object-contain opacity-95" />
          </div>
          <span className="text-[9px] tracking-widest font-cinzel px-3 py-1 rounded-full mb-3 inline-block" style={{ border: "1px solid #3a4a5a", color: "#6a8aaa" }}>SHORT FORM</span>
          <h3 className="font-cinzel-decorative text-xl font-bold mb-1" style={{ color: "#c8d8e8" }}>Stark Pack</h3>
          <p className="text-sm font-semibold mb-4" style={{ color: "#6a8aaa" }}>{pricing === "india" ? "₹" : "$"} As per project</p>
          <div className="mb-4 h-px" style={{ background: "#1e2a34" }} />
          <p className="italic text-xs mb-5" style={{ fontFamily: "'IM Fell English', serif", color: "#445566" }}>"Winter is Coming — and so is your content."</p>
          <Link href="#contact" className="block w-full text-center py-3 rounded-full text-xs tracking-widest font-cinzel font-semibold transition-all hover:border-[#6a8aaa] hover:text-[#c8d8e8]" style={{ border: "1px solid #2a3a4a", color: "#6a8aaa" }}>GET IN TOUCH</Link>
        </div>
      </div>

      {/* TARGARYEN PACK — Most Popular */}
      <div className="got-price-card got-price-card--targaryen relative mt-0 rounded-2xl transition-transform hover:-translate-y-1 md:-mt-2" style={{ border: "1px solid #FF6B1A", background: "linear-gradient(160deg,#150d06 0%,#0e0a04 100%)", boxShadow: "0 0 40px rgba(255,107,26,0.1)" }}>
        <div className="got-price-particles got-price-particles--fire" aria-hidden="true">
          {targaryenParticles.map((particle) => (
            <span key={particle} />
          ))}
        </div>
        <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-[10px] font-bold font-cinzel tracking-widest" style={{ background: "#FF6B1A", color: "#000" }}>⚔ MOST POPULAR ⚔</div>
        <div className="got-price-content rounded-2xl p-7 pt-9">
          <div className="flex justify-center mb-4">
            <img src="/stark-wolf.png" alt="House Targaryen" className="got-house-sigil got-house-sigil--targaryen h-20 w-auto object-contain opacity-95" />
          </div>
          <span className="text-[9px] tracking-widest font-cinzel px-3 py-1 rounded-full mb-3 inline-block" style={{ border: "1px solid rgba(255,107,26,0.4)", color: "#FF6B1A" }}>LONG FORM</span>
          <h3 className="font-cinzel-decorative text-xl font-bold mb-1 text-white">Targaryen Pack</h3>
          <p className="text-sm font-semibold mb-4" style={{ color: "#FF6B1A" }}>{pricing === "india" ? "₹" : "$"} As per project</p>
          <div className="mb-4 h-px" style={{ background: "rgba(255,107,26,0.2)" }} />
          <p className="italic text-xs mb-5" style={{ fontFamily: "'IM Fell English', serif", color: "#7a4a20" }}>"Fire cannot kill a dragon — nor can short attention spans."</p>
          <Link href="#contact" className="block w-full text-center py-3 rounded-full text-xs tracking-widest font-cinzel font-semibold transition-all hover:bg-[#ff8040]" style={{ background: "#FF6B1A", color: "#000" }}>GET IN TOUCH</Link>
        </div>
      </div>

      {/* CUSTOM */}
      <div className="relative rounded-2xl hover:-translate-y-1 transition-transform" style={{ background: "#0e0e0e", border: "1px solid #222" }}>
        <div className="rounded-2xl p-7">
          <div className="flex justify-center items-center mb-4 h-24">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ border: "1px solid #333", opacity: 0.5 }}>⚜</div>
          </div>
          <span className="text-[9px] tracking-widest font-cinzel px-3 py-1 rounded-full mb-3 inline-block" style={{ border: "1px solid #2a2a2a", color: "#555" }}>CUSTOM</span>
          <h3 className="font-cinzel-decorative text-xl font-bold mb-1" style={{ color: "#aaa" }}>Custom</h3>
          <p className="text-sm font-semibold mb-4" style={{ color: "#FF6B1A" }}>Let's Talk</p>
          <div className="mb-4 h-px" style={{ background: "#1a1a1a" }} />
          <p className="italic text-xs mb-5" style={{ fontFamily: "'IM Fell English', serif", color: "#444" }}>"All men must serve — let's forge your strategy together."</p>
          <Link href="#contact" className="block w-full text-center py-3 rounded-full text-xs tracking-widest font-cinzel font-semibold transition-all" style={{ border: "1px solid #252525", color: "#555" }}>GET IN TOUCH</Link>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 md:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center md:mb-16">
            <div className="orange-line mx-auto mb-4" />
            <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>FAQs</h2>
          </div>
          <FaqList faqs={site.faqs} />
        </div>
      </section>

      {/* CONTACT */}
<section id="contact" className="px-6 py-20 md:py-32">
  <div className="mx-auto max-w-5xl">
    <div className="mb-10 text-center md:mb-16">
      <div className="orange-line mx-auto mb-4" />
      <h2 className="section-title text-white reveal" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>LET&apos;S WORK</h2>
    </div>
    <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">

     {/* LEFT - Contact Cards */}
<div className="space-y-4 md:space-y-6">

  {/* WhatsApp Card - PEHLE */}
  <div className="group relative overflow-hidden rounded-2xl border p-5 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange-accent reveal cursor-pointer" style={{ background: "#111", borderColor: "#1f1f1f", minHeight: "130px" }}>
    <svg className="absolute top-4 right-4 md:top-5 md:right-5 opacity-20 transition-opacity duration-300 group-hover:opacity-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
    <div className="transition-opacity duration-300 group-hover:opacity-0">
      <div className="mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl" style={{ background: "rgba(255,107,26,0.1)" }}>
        <MessageCircle className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#FF6B1A" }} />
      </div>
      <div className="text-xs uppercase tracking-widest" style={{ color: "#555" }}>Instant Chat</div>
      <div className="mt-0.5 md:mt-1 text-base md:text-lg font-semibold text-white">WhatsApp</div>
    </div>
    <div className="absolute bottom-4 md:bottom-5 right-4 md:right-5 text-xs uppercase tracking-widest transition-opacity duration-300 group-hover:opacity-0 hidden md:block" style={{ color: "#333" }}>hover to reveal →</div>
    <div className="absolute bottom-4 right-4 text-xs uppercase tracking-widest transition-opacity duration-300 group-hover:opacity-0 md:hidden" style={{ color: "#333" }}>tap to reveal →</div>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl transition-transform duration-500 translate-y-full group-hover:translate-y-0" style={{ background: "#FF6B1A" }}>
      <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.5)" }}>WhatsApp</span>
      <span className="text-sm font-bold text-black">+91 88494 38871</span>
      <Link href="https://wa.me/918849438871" target="_blank" className="mt-1 rounded-full px-5 py-2 text-xs font-bold" style={{ background: "#000", color: "#FF6B1A" }}>Open Chat →</Link>
    </div>
  </div>

  {/* Email Card - BAAD ME */}
  <div className="group relative overflow-hidden rounded-2xl border p-5 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange-accent reveal cursor-pointer" style={{ background: "#111", borderColor: "#1f1f1f", minHeight: "130px" }}>
    <svg className="absolute top-4 right-4 md:top-5 md:right-5 opacity-20 transition-opacity duration-300 group-hover:opacity-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
    <div className="transition-opacity duration-300 group-hover:opacity-0">
      <div className="mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl" style={{ background: "rgba(255,107,26,0.1)" }}>
        <Mail className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#FF6B1A" }} />
      </div>
      <div className="text-xs uppercase tracking-widest" style={{ color: "#555" }}>Contact</div>
      <div className="mt-0.5 md:mt-1 text-base md:text-lg font-semibold text-white">Email Us</div>
    </div>
    <div className="absolute bottom-4 md:bottom-5 right-4 md:right-5 text-xs uppercase tracking-widest transition-opacity duration-300 group-hover:opacity-0 hidden md:block" style={{ color: "#333" }}>hover to reveal →</div>
    <div className="absolute bottom-4 right-4 text-xs uppercase tracking-widest transition-opacity duration-300 group-hover:opacity-0 md:hidden" style={{ color: "#333" }}>tap to reveal →</div>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl transition-transform duration-500 translate-y-full group-hover:translate-y-0" style={{ background: "#FF6B1A" }}>
      <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.5)" }}>Email</span>
      <span className="text-sm font-bold text-black">noieditorswork@gmail.com</span>
      <Link href="mailto:noieditorswork@gmail.com" className="mt-1 rounded-full px-5 py-2 text-xs font-bold" style={{ background: "#000", color: "#FF6B1A" }}>Open Mail →</Link>
    </div>
  </div>

</div>

      {/* RIGHT - Contact Form (original untouched) */}
      <div className="rounded-2xl border p-8 reveal" style={{ background: "#111", borderColor: "#1f1f1f" }}>
        <div className="space-y-4">
          <input
            value={formData.name}
            onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))}
            placeholder="Your Name"
            className="w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: "#161616", borderColor: "#2a2a2a" }}
          />
          <input
            value={formData.email}
            onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: "#161616", borderColor: "#2a2a2a" }}
          />
          <select
            value={formData.projectType}
            onChange={(e) => setFormData((c) => ({ ...c, projectType: e.target.value }))}
            className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
            style={{ background: "#161616", borderColor: "#2a2a2a" }}
          >
            <option value="">Select Type</option>
            <option>Short Form (Reels/Shorts)</option>
            <option>Long Form (YouTube)</option>
            <option>Motion Graphics</option>
            <option>Promo Ad</option>
            <option>Custom Package</option>
          </select>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData((c) => ({ ...c, message: e.target.value }))}
            placeholder="Tell us about your project..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: "#161616", borderColor: "#2a2a2a" }}
          />
          <button
            onClick={submitContact}
            className="w-full rounded-xl py-4 text-sm font-bold text-black transition-all hover:scale-[1.01] hover:opacity-90"
            style={{ background: "#FF6B1A" }}
          >
            Send Message →
          </button>
          {message && <div className="py-2 text-center text-sm text-orange-accent">{message}</div>}
        </div>
      </div>

    </div>
  </div>
</section>

      {/* FOOTER */}
      <footer className="border-t bg-[#080808] px-6 py-12" style={{ borderColor: "#1f1f1f" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            {site.logo && <img src={site.logo} alt="Logo" className="h-8 w-8 rounded-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
            <div className="font-bebas text-2xl tracking-widest">NOI <span style={{ color: "#FF6B1A" }}>EDITORS</span></div>
          </div>
          <div className="flex gap-6">
            <Link href="#work" className="text-sm text-gray-600 transition-colors hover:text-white">Work</Link>
            <Link href="#services" className="text-sm text-gray-600 transition-colors hover:text-white">Services</Link>
            <Link href="#pricing" className="text-sm text-gray-600 transition-colors hover:text-white">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-600 transition-colors hover:text-white">Login</Link>
          </div>
          <div className="text-xs text-gray-600">© 2026 noieditors.com · All rights reserved</div>
        </div>
      </footer>
    </main>
  );
}
