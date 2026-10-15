"use client";

import { useEffect, useRef } from "react";

const MOBILE_BREAKPOINT = 700;
const DESKTOP_SPACING = 28;
const MOBILE_SPACING = 36;
// Tune these constants to change the moving wave brightness.
const WAVE_1_STRENGTH = 0.4;
const WAVE_2_STRENGTH = 0.25;
// Tune this radius to change the cursor spotlight size.
const SPOTLIGHT_RADIUS = 150;

export function BackgroundDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let spacing = DESKTOP_SPACING;
    let spotlightEnabled = false;
    let targetX = -999;
    let targetY = -999;
    let mouseX = -999;
    let mouseY = -999;
    let elapsedBeforePause = 0;
    let animationStartedAt: number | null = null;
    let currentTime = 0;
    let frameId = 0;
    let running = false;

    const drawFrame = (time: number, useSpotlight: boolean) => {
      context.clearRect(0, 0, width, height);

      if (useSpotlight && spotlightEnabled) {
        mouseX += (targetX - mouseX) * 0.12;
        mouseY += (targetY - mouseY) * 0.12;
      } else {
        mouseX = -999;
        mouseY = -999;
      }

      const offsetX = (width % spacing) / 2;
      const offsetY = (height % spacing) / 2;

      for (let y = offsetY; y < height; y += spacing) {
        for (let x = offsetX; x < width; x += spacing) {
          const wave1 = Math.sin(x * 0.011 + y * 0.007 - time * 0.7);
          const wave2 = Math.sin(x * -0.006 + y * 0.012 + time * 0.45);
          let brightness =
            Math.pow(Math.max(0, wave1), 8) * WAVE_1_STRENGTH +
            Math.pow(Math.max(0, wave2), 10) * WAVE_2_STRENGTH;

          if (useSpotlight && spotlightEnabled) {
            const distance = Math.hypot(x - mouseX, y - mouseY);
            if (distance < SPOTLIGHT_RADIUS) {
              brightness += Math.pow(1 - distance / SPOTLIGHT_RADIUS, 2) * 0.9;
            }
          }

          brightness = Math.min(1, brightness);
          const alpha = 0.08 + brightness * 0.85;
          const radius = 1 + brightness * 1.6;
          context.fillStyle = `rgba(34, 201, 255, ${alpha})`;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      spacing = width < MOBILE_BREAKPOINT ? MOBILE_SPACING : DESKTOP_SPACING;
      spotlightEnabled = width >= MOBILE_BREAKPOINT && finePointer.matches;
      if (!spotlightEnabled) {
        targetX = -999;
        targetY = -999;
      }

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawFrame(reducedMotion.matches ? 0 : currentTime, !reducedMotion.matches && running);
    };

    const animate = (now: number) => {
      if (!running) return;
      if (animationStartedAt === null) animationStartedAt = now;
      currentTime = (elapsedBeforePause + now - animationStartedAt) / 1000;
      drawFrame(currentTime, true);
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (running || document.hidden || reducedMotion.matches) return;
      running = true;
      animationStartedAt = null;
      frameId = window.requestAnimationFrame(animate);
    };

    const pause = () => {
      if (!running) return;
      if (animationStartedAt !== null) {
        elapsedBeforePause += performance.now() - animationStartedAt;
      }
      running = false;
      animationStartedAt = null;
      window.cancelAnimationFrame(frameId);
    };

    const clearSpotlight = () => {
      targetX = -999;
      targetY = -999;
      mouseX = -999;
      mouseY = -999;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!spotlightEnabled || event.pointerType !== "mouse") {
        clearSpotlight();
        return;
      }
      if (targetX === -999) {
        mouseX = event.clientX;
        mouseY = event.clientY;
      }
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) clearSpotlight();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) pause();
      else if (reducedMotion.matches) drawFrame(0, false);
      else start();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        pause();
        elapsedBeforePause = 0;
        currentTime = 0;
        clearSpotlight();
        drawFrame(0, false);
      } else {
        start();
      }
    };

    resizeCanvas();
    if (reducedMotion.matches) drawFrame(0, false);
    else start();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("mouseleave", clearSpotlight);
    window.addEventListener("blur", clearSpotlight);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionChange);

    return () => {
      pause();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("mouseleave", clearSpotlight);
      window.removeEventListener("blur", clearSpotlight);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} id="bg-dots" aria-hidden="true" />;
}
