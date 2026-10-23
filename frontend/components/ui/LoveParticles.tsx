"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------
// 1. Photorealistic 3D Solitaire Engagement Ring Component
// ---------------------------------------------------------
function PhotorealisticEngagementRing({ size = 140 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_15px_rgba(224,86,123,0.4)]"
    >
      <defs>
        {/* Metallic Rose-Gold Band Gradient */}
        <linearGradient id="roseGoldBand" x1="20" y1="40" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="20%" stopColor="#fb7185" />
          <stop offset="40%" stopColor="#fda4af" />
          <stop offset="60%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#e11d48" />
          <stop offset="90%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        {/* Platinum Crown Setting Gradient */}
        <linearGradient id="platinumSetting" x1="80" y1="20" x2="120" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Diamond Solitaire Facet Gradients */}
        <linearGradient id="diamondCrown" x1="100" y1="15" x2="100" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f0f9ff" />
          <stop offset="70%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="facetHighlight" x1="85" y1="20" x2="115" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.4" />
        </linearGradient>

        {/* Diamond Flare Glow Filter */}
        <filter id="diamondGlow" x="60" y="0" width="80" height="80" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Outer Metallic Ring Band */}
      <ellipse
        cx="100"
        cy="120"
        rx="68"
        ry="58"
        stroke="url(#roseGoldBand)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <ellipse
        cx="100"
        cy="120"
        rx="68"
        ry="58"
        stroke="#ffffff"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeDasharray="40 160"
      />

      {/* 2. Inner Ring Cavity Shadow */}
      <ellipse cx="100" cy="120" rx="60.5" ry="50.5" fill="#09090d" fillOpacity="0.3" />

      {/* 3. Platinum Prongs & Crown Mount */}
      <path d="M 82 58 L 88 42 L 95 62 Z" fill="url(#platinumSetting)" />
      <path d="M 118 58 L 112 42 L 105 62 Z" fill="url(#platinumSetting)" />
      <path d="M 100 65 L 94 48 L 106 48 Z" fill="url(#platinumSetting)" />

      {/* 4. Solitaire Brilliant-Cut Diamond Gemstone */}
      {/* Table & Crown Facets */}
      <polygon points="85,38 100,22 115,38 100,56" fill="url(#diamondCrown)" />
      <polygon points="85,38 72,40 82,58 100,56" fill="#bae6fd" fillOpacity="0.8" />
      <polygon points="115,38 128,40 118,58 100,56" fill="#7dd3fc" fillOpacity="0.8" />
      <polygon points="85,38 100,22 92,20" fill="url(#facetHighlight)" />
      <polygon points="115,38 100,22 108,20" fill="url(#facetHighlight)" />
      <polygon points="92,20 100,22 108,20 100,16" fill="#ffffff" />

      {/* Diamond Sparkle Flare Starburst */}
      <g filter="url(#diamondGlow)">
        <path d="M 100 8 L 102 20 L 114 22 L 102 24 L 100 36 L 98 24 L 86 22 L 98 20 Z" fill="#ffffff" opacity="0.95" />
        <circle cx="100" cy="22" r="4" fill="#ffffff" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------
// 2. Realistic Rose Petal Vector Component
// ---------------------------------------------------------
function RosePetalVector({ size = 52, isBlurred = false }: { size?: number; isBlurred?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isBlurred ? "blur-[2px]" : ""}
    >
      <defs>
        <linearGradient id="rosePetalGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="30%" stopColor="#f43f5e" />
          <stop offset="70%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
        <linearGradient id="petalVein" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Petal Body Curve */}
      <path
        d="M 50 8 C 80 10 96 35 92 65 C 88 88 62 96 46 92 C 22 88 8 68 12 40 C 16 20 30 6 50 8 Z"
        fill="url(#rosePetalGrad)"
      />
      {/* 3D Fold Highlight */}
      <path
        d="M 50 8 C 65 20 75 42 68 70 C 66 78 58 88 46 92 C 40 85 45 60 48 35 C 50 20 48 10 50 8 Z"
        fill="url(#petalVein)"
      />
    </svg>
  );
}

// ---------------------------------------------------------
// 3. Medium-Sized Romantic Heart Vector Component
// ---------------------------------------------------------
function MediumHeartVector({ size = 50 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mediumHeartGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="60%" stopColor="#e0567b" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M 50 88 C 50 88 10 60 10 33 C 10 18 22 8 36 8 C 45 8 50 14 50 14 C 50 14 55 8 64 8 C 78 8 90 18 90 33 C 90 60 50 88 50 88 Z"
        fill="url(#mediumHeartGrad)"
        fillOpacity="0.85"
      />
      <path
        d="M 34 16 C 25 16 18 22 18 32 C 18 36 20 42 24 48"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

interface RingElement {
  id: number;
  startX: number;
  driftX: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  startRot: number;
}

interface PetalElement {
  id: number;
  startX: number;
  driftX: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  startRot: number;
  isBlurred: boolean;
}

interface HeartElement {
  id: number;
  startX: number;
  driftX: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  startRot: number;
  midRot: number;
  endRot: number;
}

interface SparkleElement {
  id: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  fontSize: number;
  opacity: number;
}

export default function LoveParticles() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [rings, setRings] = useState<RingElement[]>([]);
  const [petals, setPetals] = useState<PetalElement[]>([]);
  const [hearts, setHearts] = useState<HeartElement[]>([]);
  const [sparkles, setSparkles] = useState<SparkleElement[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const width = window.innerWidth;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    // ---------------------------------------------------------
    // 1. Realistic Engagement Rings (2-3 Desktop, 2 Tablet, 1 Mobile)
    // ---------------------------------------------------------
    const ringPositions = isMobile ? [4.0] : isTablet ? [4.0, 91.0] : [3.5, 92.5];
    if (pathname === "/admin") ringPositions.splice(1);

    const newRings: RingElement[] = ringPositions.map((pos, i) => ({
      id: i,
      startX: pos,
      driftX: Number(((i % 2 === 0 ? 1 : -1) * (1.2 + Math.random() * 1.5)).toFixed(2)),
      duration: Number((16 + Math.random() * 6).toFixed(1)),
      delay: Number((-i * 6 - Math.random() * 2).toFixed(1)),
      size: isMobile ? 90 : 150,
      opacity: Number((0.45 + Math.random() * 0.1).toFixed(2)), // 0.45 - 0.55 opacity
      startRot: Math.floor(Math.random() * 20) - 10,
    }));

    // ---------------------------------------------------------
    // 2. Realistic Rose Petals (8 Desktop, 5 Tablet, 3 Mobile)
    // ---------------------------------------------------------
    const petalPositions = isMobile
      ? [5.0, 88.0, 45.0]
      : isTablet
      ? [6.0, 92.0, 14.0, 84.0, 50.0]
      : [4.5, 93.5, 12.0, 87.0, 8.0, 90.0, 48.0, 82.0];

    const newPetals: PetalElement[] = petalPositions.map((pos, i) => ({
      id: i,
      startX: pos,
      driftX: Number(((i % 2 === 0 ? 1 : -1) * (2.5 + Math.random() * 2.5)).toFixed(2)),
      duration: Number((11 + Math.random() * 7).toFixed(1)),
      delay: Number((-i * 2.5 - Math.random() * 3).toFixed(1)),
      size: isMobile ? 32 : i % 3 === 0 ? 32 : 54, // Foreground & background depth
      opacity: Number((0.30 + Math.random() * 0.15).toFixed(2)), // 0.30 - 0.45 opacity
      startRot: Math.floor(Math.random() * 60) - 30,
      isBlurred: i % 3 === 0, // Depth blur on 1/3 of petals
    }));

    // ---------------------------------------------------------
    // 3. Medium-Sized Hearts (3 Desktop, 2 Tablet, 1 Mobile)
    // ---------------------------------------------------------
    const heartPositions = isMobile ? [7.0] : isTablet ? [8.0, 90.0] : [7.0, 93.0, 49.0];

    const newHearts: HeartElement[] = heartPositions.map((pos, i) => ({
      id: i,
      startX: pos,
      driftX: Number(((i % 2 === 0 ? 1 : -1) * (1.5 + Math.random() * 2)).toFixed(2)),
      duration: Number((20 + Math.random() * 8).toFixed(1)),
      delay: Number((-i * 5 - Math.random() * 3).toFixed(1)),
      size: isMobile ? 38 : 52,
      opacity: Number((0.28 + Math.random() * 0.12).toFixed(2)), // 0.28 - 0.40 opacity
      startRot: Math.floor(Math.random() * 14) - 7,
      midRot: Math.floor(Math.random() * 14) - 7,
      endRot: Math.floor(Math.random() * 14) - 7,
    }));

    // ---------------------------------------------------------
    // 4. Subtle Diamond Sparkles (5 Desktop, 3 Tablet, 2 Mobile)
    // ---------------------------------------------------------
    const sparkleCount = isMobile ? 2 : isTablet ? 3 : 5;
    const sparklePositions = [
      { top: 18, left: 5 },
      { top: 30, left: 94 },
      { top: 65, left: 9 },
      { top: 80, left: 91 },
      { top: 48, left: 4 },
    ];

    const newSparkles: SparkleElement[] = [];
    for (let i = 0; i < sparkleCount; i++) {
      const pos = sparklePositions[i % sparklePositions.length];
      newSparkles.push({
        id: i,
        top: pos.top,
        left: pos.left,
        duration: Number((4.0 + Math.random() * 3.0).toFixed(1)),
        delay: Number((-Math.random() * 4).toFixed(1)),
        fontSize: isMobile ? 12 : 16,
        opacity: Number((0.40 + Math.random() * 0.15).toFixed(2)),
      });
    }

    setRings(newRings);
    setPetals(newPetals);
    setHearts(newHearts);
    setSparkles(newSparkles);
  }, [mounted, pathname]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="romantic-bg-container fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Subtle Atmospheric Radial Light Glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-pink-500/18 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[550px] w-[550px] rounded-full bg-purple-600/15 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[500px] w-[500px] rounded-full bg-rose-500/15 blur-[140px]" />

      {/* 1. Realistic Photorealistic Engagement Rings */}
      {rings.map((r) => (
        <div
          key={`ring-${r.id}`}
          className="romantic-element ring-element"
          style={
            {
              "--start-x": `${r.startX}vw`,
              "--drift-x": `${r.driftX}vw`,
              "--duration": `${r.duration}s`,
              "--delay": `${r.delay}s`,
              "--peak-opacity": r.opacity,
              "--start-rot": `${r.startRot}deg`,
            } as React.CSSProperties
          }
        >
          <PhotorealisticEngagementRing size={r.size} />
        </div>
      ))}

      {/* 2. Realistic Rose Petals */}
      {petals.map((p) => (
        <div
          key={`petal-${p.id}`}
          className="romantic-element petal-element"
          style={
            {
              "--start-x": `${p.startX}vw`,
              "--drift-x": `${p.driftX}vw`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--peak-opacity": p.opacity,
              "--start-rot": `${p.startRot}deg`,
            } as React.CSSProperties
          }
        >
          <RosePetalVector size={p.size} isBlurred={p.isBlurred} />
        </div>
      ))}

      {/* 3. Medium-Sized Romantic Hearts */}
      {hearts.map((h) => (
        <div
          key={`heart-${h.id}`}
          className="romantic-element heart-element"
          style={
            {
              "--start-x": `${h.startX}vw`,
              "--drift-x": `${h.driftX}vw`,
              "--duration": `${h.duration}s`,
              "--delay": `${h.delay}s`,
              "--peak-opacity": h.opacity,
              "--start-rot": `${h.startRot}deg`,
              "--mid-rot": `${h.midRot}deg`,
              "--end-rot": `${h.endRot}deg`,
            } as React.CSSProperties
          }
        >
          <MediumHeartVector size={h.size} />
        </div>
      ))}

      {/* 4. Diamond Sparkle Accents */}
      {sparkles.map((s) => (
        <span
          key={`sparkle-${s.id}`}
          className="romantic-element sparkle-element"
          style={
            {
              top: `${s.top}vh`,
              left: `${s.left}vw`,
              "--duration": `${s.duration}s`,
              "--delay": `${s.delay}s`,
              "--peak-opacity": s.opacity,
              fontSize: `${s.fontSize}px`,
              color: "#eab308",
            } as React.CSSProperties
          }
        >
          ✦
        </span>
      ))}
    </div>
  );
}

