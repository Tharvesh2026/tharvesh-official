import React from 'react';
import { HeroIntro } from './components/HeroIntro';
import { SocialGrid } from './components/SocialGrid';
import { WorkstationCanvas } from './components/WorkstationCanvas';

export default function App() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#050611] lg:h-screen lg:overflow-hidden">
      {/* Subtle ambient cosmic vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_28%_58%,rgba(139,92,246,0.09)_0%,rgba(5,6,17,0)_58%)]"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-5 pt-7 pb-10 sm:px-8 sm:pt-9 sm:pb-12 gap-5 lg:block lg:p-0 lg:min-h-0 lg:h-screen lg:pointer-events-none">
        {/* Zone 1: Upper-left Introduction */}
        <div className="lg:fixed lg:top-8 lg:left-10 xl:top-10 xl:left-14 lg:z-20 lg:pointer-events-none">
          <HeroIntro />
        </div>

        {/* Zone 2: Interactive 3D Workstation & Cosmic Starfield (single instance) */}
        <div className="relative w-full h-[340px] sm:h-[430px] rounded-2xl overflow-hidden border border-purple-500/15 bg-[#050611] lg:fixed lg:inset-0 lg:z-0 lg:h-screen lg:w-screen lg:rounded-none lg:border-0 lg:pointer-events-auto">
          <WorkstationCanvas />
        </div>

        {/* Zone 3: Right-side Two-Column Social Media Grid */}
        <section
          aria-label="Social and developer links"
          className="pt-1 lg:pt-0 lg:fixed lg:right-8 xl:right-14 lg:top-1/2 lg:-translate-y-1/2 lg:z-20 lg:w-[390px] xl:w-[445px] lg:pointer-events-none"
        >
          <SocialGrid />
        </section>

        {/* Subtle desktop-only interaction hint */}
        <p className="hidden lg:block fixed bottom-6 left-10 xl:left-14 z-20 pointer-events-none text-[11.5px] tracking-wide text-[#8c84b3]/70 select-none">
          Drag workstation to inspect · Move cursor for parallax
        </p>
      </div>
    </main>
  );
}
