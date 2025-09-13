"use client";

import { useEffect, useState } from "react";

type StarConfig = {
  x: string; // e.g., '42vw'
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  color: string; // color value
  glow: string; // shadow color
  trail: string; // gradient tail color
};

const genStar = (): StarConfig => {
  // Star size between 5-10px
  const size = Math.floor(2 + Math.random() * 6); // 5-10px
  const duration = 4 + Math.random() * 6; // 4s - 10s
  const delay = Math.random() * 6; // 0s - 6s
  const x = `${Math.floor(Math.random() * 100)}vw`;

  // 70% black, 30% yellow-ish
  const useYellow = Math.random() < 0.5;
  const color = useYellow ? "#FFD000" : "#000000";
  const glow = useYellow ? "rgba(255, 208, 0, 0.35)" : "rgba(0,0,0,0.25)";
  const trail = useYellow ? "rgba(255, 208, 0, 0.35)" : "rgba(0,0,0,0.35)";

  return { x, size, duration, delay, color, glow, trail };
};

export default function StarfallBackground({ count = 60 }: { count?: number }) {
  const [stars, setStars] = useState<StarConfig[]>([]);

  useEffect(() => {
    // Generate stars only on client to avoid SSR mismatch
    const arr = Array.from({ length: count }, () => genStar());
    setStars(arr);
  }, [count]);

  return (
    <div className="starfall" aria-hidden>
      {stars.map((s, i) => {
        const style = {
          // CSS variables consumed in globals.css
          ["--x" as any]: s.x,
          ["--size" as any]: `${s.size}px`,
          ["--duration" as any]: `${s.duration}s`,
          ["--delay" as any]: `${s.delay}s`,
          ["--color" as any]: s.color,
          ["--glow" as any]: s.glow,
          ["--trail" as any]: s.trail,
        } as React.CSSProperties & Record<string, string>;

        return <div key={i} className="star" style={style} />;
      })}
    </div>
  );
}
