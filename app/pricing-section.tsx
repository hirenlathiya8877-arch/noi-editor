"use client";

import Link from "next/link";
import { ChevronRight, Plus, Scissors, Star, Zap } from "lucide-react";
import { type CSSProperties, type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./pricing-section.module.css";

type Region = "india" | "world";

const pricingConfig = {
  india: {
    locale: "en-IN",
    symbol: "₹",
    essential: 5999,
    signature: 9999,
  },
  world: {
    locale: "en-US",
    symbol: "$",
    essential: 175,
    signature: 249,
  },
} as const;

const cardAccents = ["#5cc8ff", "#2ad4f5", "#8fb8d4"] as const;
const storyWords = ["WAIT", "FOR", "THE", "DROP", "NOW"] as const;
const typingWords = ["podcast series", "brand film", "ad campaign", "wedding highlight", "YouTube channel"] as const;
const landscapePalettes = [
  ["#0b2540", "#2ad4f5", "#0e5a73", "#071c2b"],
  ["#0a1f3a", "#7dd3fc", "#164e75", "#06142a"],
  ["#06303a", "#a5f3fc", "#0e7490", "#04222a"],
  ["#10254a", "#38bdf8", "#1e4e8c", "#08142d"],
  ["#052b33", "#67e8f9", "#0f6b7a", "#031c22"],
] as const;

const essentialFeatures = [
  "Scroll-stopping, high-retention edits",
  "Trend-based cuts and transitions",
  "Personalized video branding",
  "Color grading",
  "Captions and subtitles",
  "2 revision rounds",
  "Credit required",
];

const signatureFeatures = [
  "Everything in Essential",
  "Custom transitions and effects",
  "Brand strategy call",
  "Priority delivery in 24 hours",
  "Unlimited revisions",
  "Credit required",
];

function formatPrice(value: number, region: Region) {
  return new Intl.NumberFormat(pricingConfig[region].locale, { maximumFractionDigits: 0 }).format(value);
}

function EssentialClip({ paletteIndex, inView, reducedMotion }: { paletteIndex: number; inView: boolean; reducedMotion: boolean }) {
  const palette = landscapePalettes[paletteIndex];
  const word = storyWords[paletteIndex];

  return (
    <div className={styles.clipBody}>
      <div className={styles.cutCounter} aria-hidden="true">
        <span>CUT</span>
        <strong>0{paletteIndex + 1}</strong>
      </div>
      <div className={styles.phoneFrame} aria-hidden="true">
        <svg className={styles.phoneLandscape} viewBox="0 0 66 118" aria-hidden="true">
          <rect width="66" height="118" fill={palette[0]} />
          <circle cx="47" cy="30" r="9" fill={palette[1]} />
          <path d="M0 69 21 48l18 20 12-13 15 15v48H0Z" fill={palette[2]} />
          <path d="m0 81 19-10 15 13 15-11 17 9v36H0Z" fill={palette[3]} />
        </svg>
        <span className={`${styles.storyProgress}${inView && !reducedMotion ? ` ${styles.storyProgressRunning}` : ""}`} aria-hidden="true" />
        <span key={word} className={`${styles.storyCaption}${inView && !reducedMotion ? ` ${styles.captionPop}` : ""}`} aria-hidden="true">{word}</span>
      </div>
      <div className={styles.beatBars} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((bar) => <span key={bar} style={{ "--bar-duration": `${[0.38, 0.44, 0.49, 0.55, 0.6][bar]}s`, "--bar-height": `${[13, 20, 16, 26, 18][bar]}px` } as CSSProperties} />)}
      </div>
    </div>
  );
}

function SignatureClip({ inView, reducedMotion }: { inView: boolean; reducedMotion: boolean }) {
  return (
    <div className={styles.signatureClipBody}>
      <div className={styles.cinemaFrame}>
        <div className={`${styles.cinemaScene}${inView && !reducedMotion ? ` ${styles.cinemaPanning}` : ""}`} aria-hidden="true">
          <svg viewBox="0 0 480 62" preserveAspectRatio="none">
            <rect width="480" height="62" fill="#07202c" />
            <circle cx="258" cy="25" r="15" fill="#bff4ff" />
            <path d="M0 45 70 36l64 9 65-18 70 18 56-12 70 12 85-14v31H0Z" fill="#0c3b4d" />
            <path d="m0 53 66-8 54 9 73-12 76 14 65-10 74 10 72-8v14H0Z" fill="#051b25" />
            <path d="M0 25h480" stroke="#2ad4f5" strokeOpacity=".55" strokeWidth="1" />
          </svg>
        </div>
        <span className={styles.resolutionLabel}>4K · 24P</span>
      </div>
      <div className={styles.gradeSliders} aria-hidden="true">
        {["LIFT", "GAMMA", "GAIN"].map((label, index) => (
          <div className={styles.gradeSlider} key={label}>
            <span>{label}</span>
            <i className={`${styles.gradeTrack}${inView && !reducedMotion ? ` ${styles.gradeTrackRunning}` : ""}`} style={{ "--slider-duration": `${[5, 7, 4][index]}s`, "--slider-delay": `${index * 0.55}s` } as CSSProperties}>
              <b />
            </i>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTyping({ inView, reducedMotion }: { inView: boolean; reducedMotion: boolean }) {
  const [text, setText] = useState("");
  const textRef = useRef("");
  const wordIndexRef = useRef(0);
  const deletingRef = useRef(false);
  const holdUntilRef = useRef(0);

  useEffect(() => {
    if (!inView || reducedMotion) return;

    const interval = window.setInterval(() => {
      const word = typingWords[wordIndexRef.current];
      const currentText = textRef.current;
      if (holdUntilRef.current && performance.now() < holdUntilRef.current) return;
      if (holdUntilRef.current) {
        holdUntilRef.current = 0;
        deletingRef.current = true;
      }

      let nextText: string;
      if (deletingRef.current) {
        nextText = currentText.slice(0, -1);
        if (!nextText) {
          deletingRef.current = false;
          wordIndexRef.current = (wordIndexRef.current + 1) % typingWords.length;
        }
      } else {
        nextText = word.slice(0, currentText.length + 1);
        if (nextText === word) holdUntilRef.current = performance.now() + 1100;
      }

      textRef.current = nextText;
      setText(nextText);
    }, 80);

    return () => window.clearInterval(interval);
  }, [inView, reducedMotion]);

  const displayText = reducedMotion ? typingWords[0] : text;
  return <span className={styles.typingText}>{displayText}<i className={styles.typingCursor}>_</i></span>;
}

function FeatureList({ items, kind }: { items: string[]; kind: "essential" | "signature" | "custom" }) {
  return (
    <ul className={`${styles.features} ${kind === "custom" ? styles.customFeatures : ""}`}>
      {items.map((feature) => (
        <li key={feature} className={styles.featureRow}>
          {kind === "essential" && <Zap className={styles.boltIcon} size={14} strokeWidth={2.2} aria-hidden="true" />}
          {kind === "signature" && <Star className={styles.starIcon} size={13} strokeWidth={2} aria-hidden="true" />}
          {kind === "custom" && <ChevronRight className={styles.chevronIcon} size={13} strokeWidth={1.8} aria-hidden="true" />}
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLSpanElement>(null);
  const priceFrameRef = useRef<number | null>(null);
  const stageTimersRef = useRef<number[]>([]);
  const essentialAmountRef = useRef<number>(pricingConfig.india.essential);
  const signatureAmountRef = useRef<number>(pricingConfig.india.signature);
  const progressRef = useRef(0);
  const [region, setRegion] = useState<Region>("india");
  const [essentialAmount, setEssentialAmount] = useState<number>(pricingConfig.india.essential);
  const [signatureAmount, setSignatureAmount] = useState<number>(pricingConfig.india.signature);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [clipPhase, setClipPhase] = useState<"idle" | "shrink" | "slide" | "expand">("idle");
  const [clipPosition, setClipPosition] = useState<Region>("india");
  const [cutOrigin, setCutOrigin] = useState<Region>("india");
  const [cutFlash, setCutFlash] = useState(false);
  const [cutFlashKey, setCutFlashKey] = useState(0);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [shootingVisible, setShootingVisible] = useState(true);
  const indiaButtonRef = useRef<HTMLButtonElement>(null);
  const worldButtonRef = useRef<HTMLButtonElement>(null);

  const writeProgress = useCallback((nextProgress: number) => {
    const bounded = Math.max(0, Math.min(0.999999, nextProgress));
    progressRef.current = bounded;
    playheadRef.current?.style.setProperty("left", `${bounded * 100}%`);
    const nextIndex = Math.min(2, Math.floor(bounded * 3));
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      writeProgress(0);
      setPaletteIndex(0);
    }
  }, [reducedMotion, writeProgress]);

  useEffect(() => {
    if (!inView || reducedMotion || scrubbing) return;
    let frame = 0;
    let previousTime = 0;
    const tick = (now: number) => {
      if (!previousTime) previousTime = now;
      writeProgress((progressRef.current + (now - previousTime) / 10000) % 1);
      previousTime = now;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [inView, reducedMotion, scrubbing, writeProgress]);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    const interval = window.setInterval(() => setPaletteIndex((current) => (current + 1) % storyWords.length), 900);
    return () => window.clearInterval(interval);
  }, [inView, reducedMotion]);

  useEffect(() => () => {
    if (priceFrameRef.current !== null) window.cancelAnimationFrame(priceFrameRef.current);
    stageTimersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const animatePrices = useCallback((essentialTarget: number, signatureTarget: number) => {
    if (priceFrameRef.current !== null) window.cancelAnimationFrame(priceFrameRef.current);
    const startEssential = essentialAmountRef.current;
    const startSignature = signatureAmountRef.current;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 700);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextEssential = Math.round(startEssential + (essentialTarget - startEssential) * eased);
      const nextSignature = Math.round(startSignature + (signatureTarget - startSignature) * eased);
      essentialAmountRef.current = nextEssential;
      signatureAmountRef.current = nextSignature;
      setEssentialAmount(nextEssential);
      setSignatureAmount(nextSignature);
      if (progress < 1) priceFrameRef.current = window.requestAnimationFrame(tick);
      else priceFrameRef.current = null;
    };
    priceFrameRef.current = window.requestAnimationFrame(tick);
  }, []);

  const changeRegion = useCallback((nextRegion: Region) => {
    if (switching || nextRegion === region) return;
    if (priceFrameRef.current !== null) window.cancelAnimationFrame(priceFrameRef.current);
    stageTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    stageTimersRef.current = [];
    setSwitching(true);
    setRegion(nextRegion);
    setShootingVisible(nextRegion === "india");

    const target = pricingConfig[nextRegion].essential;
    if (reducedMotion) {
      essentialAmountRef.current = target;
      signatureAmountRef.current = pricingConfig[nextRegion].signature;
      setEssentialAmount(target);
      setSignatureAmount(pricingConfig[nextRegion].signature);
      setClipPosition(nextRegion);
      setClipPhase("idle");
      setSwitching(false);
      return;
    }

    animatePrices(target, pricingConfig[nextRegion].signature);
    setCutOrigin(clipPosition);
    setClipPhase("shrink");
    stageTimersRef.current = [
      window.setTimeout(() => {
        setCutFlash(true);
        setCutFlashKey((current) => current + 1);
      }, 110),
      window.setTimeout(() => {
        setClipPosition(nextRegion);
        setClipPhase("slide");
      }, 230),
      window.setTimeout(() => {
        setClipPhase("expand");
      }, 460),
      window.setTimeout(() => {
        setCutFlash(false);
        setClipPhase("idle");
        setSwitching(false);
      }, 700),
    ];
  }, [animatePrices, clipPosition, reducedMotion, region, switching]);

  const handleRegionKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextRegion = event.key === "ArrowLeft" ? "india" : "world";
    if (switching) return;
    (nextRegion === "india" ? indiaButtonRef : worldButtonRef).current?.focus();
    changeRegion(nextRegion);
  };

  const handleTimelinePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && !reducedMotion) setScrubbing(true);
  };

  const handleTimelinePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reducedMotion) return;
    const bounds = timelineRef.current?.getBoundingClientRect();
    if (bounds) writeProgress((event.clientX - bounds.left) / bounds.width);
  };

  const handleTimelinePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setScrubbing(false);
  };

  const format = (price: number) => formatPrice(price, region);
  const formattedEssential = format(essentialAmount);
  const formattedSignature = format(signatureAmount);

  return (
    <section id="pricing" ref={sectionRef} className={`${styles.pricingSection}${inView ? ` ${styles.inView}` : ""}${reducedMotion ? ` ${styles.reducedMotion}` : ""}`} aria-labelledby="pricing-heading">
      <div className={styles.sectionShell}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Pricing</p>
          <h2 id="pricing-heading">Three ways to cut your story</h2>
          <div className={styles.regionToggleWrap}>
            <div className={`${styles.regionToggle}${clipPhase !== "idle" ? ` ${styles[`phase_${clipPhase}`]}` : ""}`} role="radiogroup" aria-label="Choose pricing region" data-clip-position={clipPosition} data-cut-origin={cutOrigin}>
              <span className={styles.regionClip} aria-hidden="true">
                <i /><i />
              </span>
              {cutFlash && <span key={cutFlashKey} className={styles.cutFlash} aria-hidden="true"><Scissors size={13} strokeWidth={1.8} /></span>}
                <button ref={indiaButtonRef} type="button" role="radio" aria-checked={region === "india"} tabIndex={region === "india" ? 0 : -1} onClick={() => changeRegion("india")} onKeyDown={handleRegionKeyDown} disabled={switching} className={clipPosition === "india" ? styles.regionOptionActive : styles.regionOption}>
                <span>India</span><small>INR</small>
              </button>
                <button ref={worldButtonRef} type="button" role="radio" aria-checked={region === "world"} tabIndex={region === "world" ? 0 : -1} onClick={() => changeRegion("world")} onKeyDown={handleRegionKeyDown} disabled={switching} className={clipPosition === "world" ? styles.regionOptionActive : styles.regionOption}>
                <span>Outside India</span><small>USD</small>
              </button>
            </div>
          </div>
        </header>

        <div
          className={styles.timelineArea}
          ref={timelineRef}
          onPointerEnter={handleTimelinePointerEnter}
          onPointerMove={handleTimelinePointerMove}
          onPointerLeave={handleTimelinePointerLeave}
          role="group"
          aria-label="Pricing plan editing timeline"
        >
          <div className={styles.ruler} aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span className={styles.tickGroup} key={index} style={{ left: `${(index / 9) * 100}%` }}>
                <b className={styles.tickLabel}>00:0{index}</b>
                <i className={styles.majorTick} />
                {index < 9 && [1, 2, 3, 4].map((minor) => <i key={minor} className={styles.minorTick} style={{ left: `${minor * 20}%` }} />)}
              </span>
            ))}
          </div>

          <span className={styles.playhead} ref={playheadRef} style={{ color: cardAccents[activeIndex] }} aria-hidden="true"><i /></span>

          <div className={styles.planGrid}>
            <article className={`${styles.planCard} ${styles.essentialCard}${activeIndex === 0 ? ` ${styles.activeCard}` : ""}`} data-passed={activeIndex > 0}>
              <div className={styles.clipHeader}>
                <div className={styles.clipTag}><span>V1 · REEL_FINAL.MP4</span><span>9:16</span></div>
                <EssentialClip paletteIndex={paletteIndex} inView={inView} reducedMotion={reducedMotion} />
              </div>
              <div className={styles.planTitleRow}><h3>Essential</h3><span>01</span></div>
              <p className={styles.description}>High-retention reels for steady posting.</p>
              <div className={styles.priceBlock}>
                <span className={styles.currency}>{pricingConfig[region].symbol}</span><strong>{formattedEssential}</strong><span className={styles.unit}>/ REEL</span>
              </div>
              <FeatureList items={essentialFeatures} kind="essential" />
              <Link href="#contact" className={`${styles.ctaButton} ${styles.outlineButton}`}><span>GET IN TOUCH</span></Link>
            </article>

            <article className={`${styles.planCard} ${styles.signatureCard}${activeIndex === 1 ? ` ${styles.activeCard}` : ""}`} data-passed={activeIndex > 1}>
              <span className={styles.popularBadge}>POPULAR CHOICE</span>
              <div className={styles.clipHeader}>
                <div className={styles.clipTag}><span>V1 · FILM_FINAL.MP4</span><span>2.39:1</span></div>
                <SignatureClip inView={inView} reducedMotion={reducedMotion} />
              </div>
              <div className={styles.planTitleRow}><h3>Signature</h3><span>02</span></div>
              <p className={styles.description}>Full creative partnership for brands that want to stand out.</p>
              <div className={styles.priceBlock}>
                <span className={styles.currency}>{pricingConfig[region].symbol}</span><strong>{formattedSignature}</strong><span className={styles.unit}>/ VIDEO</span>
              </div>
              <ul className={styles.features}>
                <li className={styles.featureRow}><Star className={styles.starIcon} size={13} strokeWidth={2} aria-hidden="true" /><span>Everything in Essential</span></li>
                <li className={`${styles.featureRow} ${styles.shootingFeature}${shootingVisible ? ` ${styles.shootingVisible}` : ""}`} aria-hidden={!shootingVisible}>
                  <Star className={styles.starIcon} size={13} strokeWidth={2} aria-hidden="true" /><span>Shooting (if required), Jamnagar only</span>
                </li>
                {signatureFeatures.slice(1).map((feature) => <li className={styles.featureRow} key={feature}><Star className={styles.starIcon} size={13} strokeWidth={2} aria-hidden="true" /><span>{feature}</span></li>)}
              </ul>
              <Link href="#contact" className={`${styles.ctaButton} ${styles.solidButton}`}><span>GET IN TOUCH</span></Link>
            </article>

            <article className={`${styles.planCard} ${styles.customCard}${activeIndex === 2 ? ` ${styles.activeCard}` : ""}`} data-passed={false}>
              <div className={styles.clipHeader}>
                <div className={styles.clipTag}><span>UNTITLED_PROJECT</span><span>NEW</span></div>
                <div className={styles.customClipBody}>
                  <svg className={styles.blueprintGrid} aria-hidden="true">
                    <defs><pattern id="pricing-blueprint-grid" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M 14 0 L 0 0 0 14" fill="none" stroke="#0f2030" strokeWidth="1" /></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#pricing-blueprint-grid)" />
                  </svg>
                  <div className={styles.blueprintPlaceholder} aria-hidden="true"><Plus size={21} strokeWidth={1.6} /></div>
                  <div className={styles.projectTyping}>
                    <CustomTyping inView={inView} reducedMotion={reducedMotion} />
                  </div>
                </div>
              </div>
              <div className={styles.planTitleRow}><h3>Custom</h3><span>03</span></div>
              <p className={styles.description}>A plan built around your project, scope and timeline.</p>
              <div className={`${styles.priceBlock} ${styles.talkPrice}`}><strong>Let&apos;s talk</strong><span className={styles.typingCursor}>_</span></div>
              <FeatureList items={["Scope and budget set together", "Long-form and series edits", "Monthly content retainers", "Dedicated brand strategy"]} kind="custom" />
              <Link href="#contact" className={`${styles.ctaButton} ${styles.customButton}`}><span>&gt; Get in touch</span></Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
