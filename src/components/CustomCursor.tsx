import React, { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  isCrystalHovered: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ isCrystalHovered }) => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    setEnabled(true);
    document.documentElement.classList.add('custom-cursor-active');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }

      const targetEl = e.target as HTMLElement | null;
      const interactive = Boolean(targetEl?.closest('a, button, [role="button"]'));
      setLinkHovered(interactive);
    };

    const onLeave = () => setVisible(false);

    const animateRing = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(animateRing);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!enabled || !visible) return null;

  const active = isCrystalHovered || linkHovered;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-[width,height,border-color,background-color] duration-200 ease-out ${
          active
            ? 'w-11 h-11 border-purple-400/90 bg-purple-500/15'
            : 'w-7 h-7 border-white/45 bg-transparent'
        }`}
      />
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full transition-[width,height,background-color] duration-150 ${
          active ? 'w-1.5 h-1.5 bg-cyan-300' : 'w-1.5 h-1.5 bg-white'
        }`}
      />
    </div>
  );
};
