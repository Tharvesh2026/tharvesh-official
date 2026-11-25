import React from 'react';

interface LoadingOverlayProps {
  progress: number;
  ready: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, ready }) => {
  return (
    <div
      aria-hidden={ready}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#03040c] px-6 transition-opacity duration-700 ease-out ${
        ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-xs w-full">
        <span className="font-display text-2xl sm:text-3xl font-bold tracking-[0.28em] text-white">
          THARVESH
        </span>
        <span className="mt-3 font-mono-tech text-[11px] tracking-[0.22em] text-purple-300/80 uppercase">
          INITIALIZING DIGITAL EXPERIENCE...
        </span>

        {/* Thin subtle progress indicator */}
        <div className="mt-6 w-full h-[1px] bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
          />
        </div>

        <span className="mt-2.5 font-mono-tech text-[10px] tracking-[0.18em] text-white/45">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};
