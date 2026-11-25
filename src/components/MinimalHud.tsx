import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import type { HoveredCrystalInfo } from './WorkstationCanvas';

interface MinimalHudProps {
  activeSection: number;
  scrollProgress: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigateSection: (sectionId: string) => void;
  hoveredCrystal: HoveredCrystalInfo | null;
}

const NAV_CHAPTERS = [
  { id: 'intro', num: '01', label: 'Intro' },
  { id: 'workspace', num: '02', label: 'Workspace' },
  { id: 'connect', num: '03', label: 'Connect' },
  { id: 'contact', num: '04', label: 'Contact' },
];

export const MinimalHud: React.FC<MinimalHudProps> = ({
  activeSection,
  scrollProgress,
  soundEnabled,
  onToggleSound,
  onNavigateSection,
  hoveredCrystal,
}) => {
  return (
    <>
      {/* Minimal Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-12 pointer-events-none">
        <button
          type="button"
          onClick={() => onNavigateSection('intro')}
          className="pointer-events-auto font-display text-sm sm:text-[15px] font-bold tracking-[0.22em] text-white hover:text-purple-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-sm"
        >
          THARVESH
        </button>

        <nav
          aria-label="Universe chapters"
          className="pointer-events-auto hidden md:flex items-center gap-6 lg:gap-8"
        >
          {NAV_CHAPTERS.map((ch, idx) => {
            const isActive = activeSection === idx;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onNavigateSection(ch.id)}
                className={`font-mono-tech text-[11.5px] tracking-[0.14em] uppercase transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-sm ${
                  isActive ? 'text-white' : 'text-white/45 hover:text-white/85'
                }`}
              >
                <span className={isActive ? 'text-purple-400' : 'text-white/30'}>{ch.num}</span>{' '}
                {ch.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
          aria-pressed={soundEnabled}
          className="pointer-events-auto inline-flex items-center gap-2 border border-white/15 bg-[#070916]/65 px-3 py-1.5 font-mono-tech text-[11px] tracking-[0.14em] uppercase text-white/80 hover:border-purple-400/60 hover:text-white transition-colors whitespace-nowrap shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-300" /> : <VolumeX className="w-3.5 h-3.5 text-white/50" />}
          <span>{soundEnabled ? 'Audio On' : 'Audio Off'}</span>
        </button>
      </header>

      {/* Right-Edge Vertical Progress Rail */}
      <aside
        aria-label="Scroll progress"
        className="pointer-events-none fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-end gap-3"
      >
        <div className="relative w-[1px] h-28 bg-white/15 overflow-hidden">
          <div
            className="w-full bg-gradient-to-b from-purple-400 to-cyan-400 transition-[height] duration-150"
            style={{ height: `${Math.max(8, scrollProgress * 100)}%` }}
          />
        </div>
        <span className="font-mono-tech text-[10px] tracking-[0.18em] text-white/55">
          0{activeSection + 1} / 04
        </span>
      </aside>

      {/* Subtle Scroll Guidance (fades out after scrolling) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500 ${
          scrollProgress > 0.06 ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="font-mono-tech text-[10.5px] tracking-[0.22em] uppercase text-white/55 whitespace-nowrap">
          Scroll to enter universe ↓
        </span>
      </div>

      {/* Floating 3D Crystal Badge Hover Tooltip */}
      {hoveredCrystal && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-full border border-purple-400/45 bg-[#070916]/90 px-3.5 py-2 rounded-sm shadow-[0_8px_30px_rgba(88,28,135,0.4)] transition-opacity duration-150"
          style={{
            left: `${Math.min(Math.max(hoveredCrystal.screenX, 110), window.innerWidth - 110)}px`,
            top: `${Math.max(hoveredCrystal.screenY - 14, 72)}px`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="font-display text-xs font-semibold text-white whitespace-nowrap">
              {hoveredCrystal.link.platform}
            </span>
            <span className="text-white/25" aria-hidden="true">
              /
            </span>
            <span className="font-mono-tech text-[11px] text-purple-300 whitespace-nowrap">
              {hoveredCrystal.link.handle}
            </span>
          </div>
          <p className="mt-0.5 font-mono-tech text-[9.5px] tracking-[0.14em] uppercase text-cyan-300/80">
            Click crystal to open →
          </p>
        </div>
      )}
    </>
  );
};
