'use client';

import React, { useEffect, useRef } from 'react';

interface Sparkle {
  el: HTMLDivElement;
  timeout: ReturnType<typeof setTimeout>;
}

const SparkleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sparkles = useRef<Sparkle[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createSparkle = () => {
      const sparkle = document.createElement('div');
      const size = Math.random() * 6 + 2; // 2–8px
      const x = Math.random() * 100;
      const duration = Math.random() * 8 + 6; // 6–14s
      const delay = Math.random() * 4;

      sparkle.className = 'sparkle';
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.left = `${x}%`;
      sparkle.style.bottom = `-${size}px`;
      sparkle.style.animationDuration = `${duration}s`;
      sparkle.style.animationDelay = `${delay}s`;

      container.appendChild(sparkle);
      const timeout = setTimeout(() => {
        sparkle.remove();
      }, (duration + delay) * 1000 + 500);

      sparkles.current.push({ el: sparkle, timeout });
    };

    // Seed initial particles
    for (let i = 0; i < 30; i++) createSparkle();
    const interval = setInterval(createSparkle, 400);

    return () => {
      clearInterval(interval);
      sparkles.current.forEach(({ el, timeout }) => {
        clearTimeout(timeout);
        el.remove();
      });
    };
  }, []);

  return (
    <>
      {/* Animated sparkles */}
      <div ref={containerRef} className="sparkle-bg" aria-hidden="true" />

      {/* Ambient blob 1 – top-right */}
      <div
        className="ambient-blob"
        style={{ width: 700, height: 700, top: '-120px', right: '-180px', background: '#4f8ef7' }}
        aria-hidden="true"
      />
      {/* Ambient blob 2 – bottom-left */}
      <div
        className="ambient-blob"
        style={{ width: 500, height: 500, bottom: '5%', left: '-150px', background: '#38bdf8', animationDelay: '4s' }}
        aria-hidden="true"
      />
    </>
  );
};

export default SparkleBackground;
