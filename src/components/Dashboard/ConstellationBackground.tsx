'use client';

import React, { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaShift: number;
};

const MIN_PARTICLES = 30;
const MAX_PARTICLES = 120;
const LINK_DISTANCE = 130;

function createParticles(width: number, height: number): Particle[] {
  const count = Math.max(
    MIN_PARTICLES,
    Math.min(MAX_PARTICLES, Math.floor((width * height) / 16000))
  );

  return Array.from({ length: count }, () => {
    const speed = 0.25 + Math.random() * 0.45;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.45,
      alphaShift: (Math.random() - 0.5) * 0.006,
    };
  });
}

const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = createParticles(width, height);
    let animationId = 0;
    const reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = createParticles(width, height);
    };

    const drawFrame = (shouldUpdate: boolean) => {
      context.clearRect(0, 0, width, height);

      // 1. Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (shouldUpdate) {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha += p.alphaShift;

          if (p.alpha < 0.1 || p.alpha > 0.7) p.alphaShift *= -1;

          // Wrap
          if (p.x > width + 20)  p.x = -20;
          if (p.x < -20)         p.x = width + 20;
          if (p.y > height + 20) p.y = -20;
          if (p.y < -20)         p.y = height + 20;
        }

        context.beginPath();
        context.fillStyle = `rgba(56, 189, 248, ${p.alpha})`; // Cyan (sky-400)
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      }

      // 2. Draw Links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;

          if (d2 > LINK_DISTANCE * LINK_DISTANCE) continue;

          const distance = Math.sqrt(d2);
          const opacity = (1 - distance / LINK_DISTANCE) * 0.12;
          context.beginPath();
          context.strokeStyle = `rgba(129, 140, 248, ${opacity})`; // Indigo (indigo-400)
          context.lineWidth = 0.6;
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    };

    const render = () => {
      drawFrame(true);
      animationId = window.requestAnimationFrame(render);
    };

    const start = () => {
      window.cancelAnimationFrame(animationId);
      if (reduceMotionMedia.matches) {
        drawFrame(false);
        return;
      }
      render();
    };

    setCanvasSize();
    start();

    const onResize = () => { setCanvasSize(); start(); };
    window.addEventListener('resize', onResize);
    reduceMotionMedia.addEventListener('change', start);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      reduceMotionMedia.removeEventListener('change', start);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />
      <div className="particle-orb particle-orb-left" />
      <div className="particle-orb particle-orb-right" />
    </div>
  );
};

export default ConstellationBackground;
