'use client';

import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  opacityDir: number;
  hue: number; // slight hue variation for richness
};

const LINK_DIST  = 150;
const MAX_STARS  = 140;
const MIN_STARS  = 50;

function createStars(w: number, h: number): Star[] {
  const count = Math.max(MIN_STARS, Math.min(MAX_STARS, Math.floor((w * h) / 10000)));
  return Array.from({ length: count }, () => {
    const speed = 0.12 + Math.random() * 0.5;
    const angle = Math.random() * Math.PI * 2;
    return {
      x:          Math.random() * w,
      y:          Math.random() * h,
      vx:         Math.cos(angle) * speed,
      vy:         Math.sin(angle) * speed,
      radius:     0.5 + Math.random() * 2,
      opacity:    0.2 + Math.random() * 0.6,
      opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.005,
      hue:        190 + Math.random() * 30, // 190–220 = sky to cyan range
    };
  });
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    let stars: Star[] = [];
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(w, h);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // ── Draw & move stars ─────────────────────────────────────────
      for (const s of stars) {
        // Mouse repulsion — stars drift slightly away from cursor
        const dx = s.x - mx;
        const dy = s.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100 * 0.4;
          s.vx += (dx / dist) * force * 0.04;
          s.vy += (dy / dist) * force * 0.04;
        }

        // Dampen velocity so stars don't fly off
        s.vx *= 0.995;
        s.vy *= 0.995;

        s.x += s.vx;
        s.y += s.vy;

        // Pulsing opacity
        s.opacity += s.opacityDir;
        if (s.opacity > 0.85) { s.opacity = 0.85; s.opacityDir *= -1; }
        if (s.opacity < 0.12) { s.opacity = 0.12; s.opacityDir *= -1; }

        // Wrap around edges
        if (s.x < -10) s.x = w + 10;
        else if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        else if (s.y > h + 10) s.y = -10;

        // Draw star dot with glow
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 3);
        grd.addColorStop(0, `hsla(${s.hue}, 95%, 80%, ${s.opacity})`);
        grd.addColorStop(1, `hsla(${s.hue}, 95%, 80%, 0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Crisp core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 90%, ${Math.min(s.opacity + 0.3, 1)})`;
        ctx.fill();
      }

      // ── Draw connections ──────────────────────────────────────────
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const t = 1 - Math.sqrt(d2) / LINK_DIST;

          // Lines brighten near mouse
          const mdx = (a.x + b.x) / 2 - mx;
          const mdy = (a.y + b.y) / 2 - my;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const mouseBoost = mdist < 180 ? (1 - mdist / 180) * 0.6 : 0;

          const alpha = t * (0.12 + mouseBoost);
          ctx.beginPath();
          const lineGrd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          lineGrd.addColorStop(0, `hsla(${a.hue}, 90%, 70%, ${alpha})`);
          lineGrd.addColorStop(1, `hsla(${b.hue}, 90%, 70%, ${alpha})`);
          ctx.strokeStyle = lineGrd;
          ctx.lineWidth = 0.8 + t * 0.6;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const start = () => {
      cancelAnimationFrame(raf);
      resize();
      if (reduced.matches) {
        frame();
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    start();
    window.addEventListener('resize', start);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    reduced.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      reduced.removeEventListener('change', start);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#020b18]">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Slow glowing ambient orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
    </div>
  );
}
