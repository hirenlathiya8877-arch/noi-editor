"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavBarProps = {
  logo?: string;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
};

const DEFAULT_NOI_LOGO = "/img/noi-logo-white.png";

function NoiMobileLogo() {
  return (
    <span className="noi-mobile-brand" aria-label="NOI Editors">
      <span className="noi-mobile-logo-frame">
        <img src={DEFAULT_NOI_LOGO} alt="" aria-hidden="true" />
      </span>
      <span className="noi-mobile-brand-text">
        NOI <span>EDITORS</span>
      </span>
    </span>
  );
}

export function NavBar({ logo, mobileOpen, onToggleMobile, onCloseMobile }: NavBarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logo) && !logoFailed;

  useEffect(() => {
    setLogoFailed(false);
  }, [logo]);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8" style={{ overflow: "hidden", width: "100%", maxWidth: "100vw" }}>  
      <div
        className="mx-auto hidden max-w-2xl items-center justify-between rounded-full px-3 py-2 md:flex"
        style={{
          background: "rgba(8,8,8,0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,107,26,0.15)",
          boxShadow: "0 4px 40px rgba(0,0,0,0.8)"
        }}
      >
        <Link
          href="#"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full font-bebas text-xs leading-none tracking-wider"
          style={{ background: "#1c1c1c", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <img
            src={showLogo ? logo : DEFAULT_NOI_LOGO}
            alt="NOI"
            className={showLogo ? "h-full w-full object-cover" : "h-full w-full object-contain p-2"}
            onError={() => setLogoFailed(true)}
          />
        </Link>
        <div className="flex items-center gap-5">
          <Link href="#work" className="font-syne text-sm text-gray-400 transition-colors hover:text-white">
            Work
          </Link>
          <Link href="#services" className="font-syne text-sm text-gray-400 transition-colors hover:text-white">
            Services
          </Link>
          <Link href="#pricing" className="font-syne text-sm text-gray-400 transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="#contact" className="font-syne text-sm text-gray-400 transition-colors hover:text-white">
            Contact
          </Link>
          <Link href="/login" className="font-syne text-sm text-gray-400 transition-colors hover:text-white">
            Client Login
          </Link>
        </div>
        <Link
          href="#contact"
          className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-black transition-all hover:opacity-90"
          style={{ background: "#FF6B1A" }}
        >
          Get in Touch
        </Link>
      </div>

      <div
        className="flex items-center justify-between rounded-[20px] px-4 py-3 md:hidden"
        style={{
          background: "rgba(13,13,13,0.96)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)"
        }}
      >
        <Link href="#" className="flex items-center gap-2">
          <NoiMobileLogo />
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={onToggleMobile}
          className={`mobile-menu-trigger ${mobileOpen ? "is-open" : ""}`}
        >
          <span className="mobile-menu-trigger__shine" aria-hidden="true" />
          <span className="mobile-menu-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {!mobileOpen ? null : (
        <div
          className="mobile-menu-panel relative mt-2 overflow-hidden rounded-2xl md:hidden"
          style={{
            background: "rgba(13,13,13,0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)"
          }}
        >
          <div className="flex flex-col gap-1 p-3">
            {["work", "services", "pricing", "contact"].map((item, index) => (
              <Link
                key={item}
                href={`#${item}`}
                onClick={onCloseMobile}
                className="mobile-menu-link rounded-xl px-4 py-3 font-syne text-sm text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                style={{ animationDelay: `${90 + index * 55}ms` }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={onCloseMobile}
              className="mobile-menu-link rounded-xl px-4 py-3 font-syne text-sm text-gray-400 transition-all hover:bg-white/5 hover:text-white"
              style={{ animationDelay: "310ms" }}
            >
              Client Login
            </Link>
            <div className="mt-1 border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <Link
                href="#contact"
                onClick={onCloseMobile}
                className="mobile-menu-link flex justify-center rounded-xl py-3 text-sm font-semibold text-black"
                style={{ background: "#FF6B1A", animationDelay: "365ms" }}
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
