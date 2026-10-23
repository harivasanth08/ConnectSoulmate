"use client";

import React, { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  accentGlow?: string;
  accentLight?: string;
  onClick?: () => void;
}

export function Interactive3DCard({
  children,
  className = "",
  accentGlow = "rgba(224, 86, 123, 0.35)",
  accentLight = "rgba(244, 63, 94, 0.16)",
  onClick,
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Caching pointer position & rAF handle for zero-lag specular highlight updates
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const touchQuery = window.matchMedia("(hover: none)");
      setIsTouchDevice(touchQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsTouchDevice(e.matches);
      };
      touchQuery.addEventListener("change", handleChange);
      return () => touchQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Cleanup pending rAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const updatePointerCSS = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty(
        "--mouse-x",
        `${mousePosRef.current.x}px`
      );
      cardRef.current.style.setProperty(
        "--mouse-y",
        `${mousePosRef.current.y}px`
      );
    }
    rafIdRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || shouldReduceMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Update specular highlight position via rAF for zero-lag rendering
    mousePosRef.current = { x: offsetX, y: offsetY };

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(updatePointerCSS);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    // Immediately sync cursor position before the highlight fades in
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    mousePosRef.current = { x: offsetX, y: offsetY };
    cardRef.current.style.setProperty("--mouse-x", `${offsetX}px`);
    cardRef.current.style.setProperty("--mouse-y", `${offsetY}px`);

    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  return (
    <div className="w-full h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`surface-card relative overflow-hidden transition-[box-shadow,border-color] duration-300 ease-out select-none ${
          isHovered
            ? "shadow-lg border-[var(--brand-primary)]/40"
            : "shadow-sm border-[var(--border)]"
        } ${className}`}
      >
        {/* Zero-lag specular cursor highlight — visual only, no movement */}
        {!shouldReduceMotion && !isTouchDevice && (
          <div
            className={`pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-200 ease-out z-20 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: `radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentLight}, transparent 80%)`,
            }}
          />
        )}

        {/* Ambient accent glow — visual only, no movement */}
        <div
          className={`pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-0 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            boxShadow: `0 0 0 1px color-mix(in srgb, ${accentGlow} 60%, transparent), 0 8px 28px -4px ${accentGlow}`,
          }}
        />

        {/* Card Content Slot */}
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    </div>
  );
}

export default Interactive3DCard;
