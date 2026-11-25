import gsap from 'gsap';
import Lenis from 'lenis';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cosmicAudio } from './audio/ambientAudio';
import { CustomCursor } from './components/CustomCursor';
import { LoadingOverlay } from './components/LoadingOverlay';
import { MinimalHud } from './components/MinimalHud';
import { FacetedBadge } from './components/SocialIcons';
import { WorkstationCanvas, type HoveredCrystalInfo } from './components/WorkstationCanvas';
import { SOCIAL_LINKS } from './data/socialLinks';

function IntroHeroContent({ sceneReady, isClone = false }: { sceneReady: boolean; isClone?: boolean }) {
  const HeadingTag = isClone ? 'div' : 'h1';

  return (
    <div
      className={`max-w-4xl transition-all duration-700 ${
        sceneReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <p className="font-mono-tech text-[11px] tracking-[0.24em] uppercase text-purple-300/85">
        01 · Enter My World
      </p>

      <HeadingTag className="mt-4 font-display font-bold tracking-[-0.03em] leading-[1.06] text-[clamp(2rem,5.2vw,4.35rem)] uppercase">
        <span className="text-white">Hi, I&apos;m </span>
        <span className="text-[#a855f7] drop-shadow-[0_0_28px_rgba(168,85,247,0.4)]">
          Tharvesh Muhaideen A
        </span>
      </HeadingTag>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono-tech text-[11.5px] sm:text-[12.5px] tracking-[0.18em] uppercase text-[#c4b5fd]">
        <span>Undergraduate ECE Student</span>
        <span className="text-purple-400/50" aria-hidden="true">
          /
        </span>
        <span>Software Engineer</span>
        <span className="text-purple-400/50" aria-hidden="true">
          /
        </span>
        <span>Digital Creator</span>
      </div>

      <p className="mt-5 max-w-xl text-[15px] sm:text-[17px] leading-[1.65] text-[#e2dcf8]/90">
        I love building digital experiences, exploring technology, and turning sparking ideas into reality.
      </p>
    </div>
  );
}

export default function App() {
  const [loadProgress, setLoadProgress] = useState(10);
  const [sceneReady, setSceneReady] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hoveredCrystal, setHoveredCrystal] = useState<HoveredCrystalInfo | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgressRef = useRef(0);
  const scrollVelocityRef = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: 1.2,
      lerp: reducedMotion ? 1 : 0.085,
      smoothWheel: !reducedMotion,
      syncTouch: !reducedMotion,
      infinite: true,
      respectReducedMotion: true,
    });
    lenisRef.current = lenis;

    let lastUiProgress = -1;
    let lastSection = -1;

    lenis.on('scroll', (instance: Lenis) => {
      const p = ((instance.progress % 1) + 1) % 1;
      scrollProgressRef.current = p;
      scrollVelocityRef.current = instance.velocity;

      // Map 4 chapters evenly across [0, 1), treating the final flyback seam [0.88..1.0) as transitioning back into 01 Intro
      const idx = p < 0.14 || p >= 0.88 ? 0 : p < 0.39 ? 1 : p < 0.64 ? 2 : 3;

      if (idx !== lastSection) {
        lastSection = idx;
        setActiveSection(idx);
      }
      if (Math.abs(p - lastUiProgress) > 0.004) {
        lastUiProgress = p;
        setScrollProgress(p);
      }
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      cosmicAudio.dispose();
    };
  }, []);

  const handleLoadProgress = useCallback((progress: number, ready: boolean) => {
    setLoadProgress(progress);
    if (ready) {
      setSceneReady(true);
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    const active = cosmicAudio.toggle();
    setSoundEnabled(active);
  }, []);

  const handleNavigateSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (lenisRef.current) {
      const targetY = el.getBoundingClientRect().top + lenisRef.current.scroll;
      lenisRef.current.scrollTo(targetY, { duration: 1.35 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCopyEmail = useCallback(() => {
    const email = 'tharvesh@tmnexustech.in';
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(email);
    }
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 2200);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#03040c] text-white overflow-x-hidden">
      <CustomCursor isCrystalHovered={Boolean(hoveredCrystal)} />
      <LoadingOverlay progress={loadProgress} ready={sceneReady} />

      {/* Fixed Real-Time Three.js 3D Universe */}
      <div className="fixed inset-0 z-0">
        <WorkstationCanvas
          scrollProgressRef={scrollProgressRef}
          scrollVelocityRef={scrollVelocityRef}
          onLoadProgress={handleLoadProgress}
          onHoverCrystal={setHoveredCrystal}
        />
      </div>

      {/* Minimal Top Bar, Scroll Progress & Crystal Tooltip */}
      <MinimalHud
        activeSection={activeSection}
        scrollProgress={scrollProgress}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNavigateSection={handleNavigateSection}
        hoveredCrystal={hoveredCrystal}
      />

      {/* Continuous Infinite Loop Track */}
      <main id="universe-scroll-track" className="relative z-10 pointer-events-none">
        {/* ================================================================
            EXPERIENCE 01 — INTRO / ENTER MY WORLD
           ================================================================ */}
        <section
          id="intro"
          aria-label="Introduction"
          className="relative h-screen flex flex-col justify-end sm:justify-center px-6 pb-20 pt-24 sm:px-10 lg:px-16"
        >
          <IntroHeroContent sceneReady={sceneReady} />
        </section>

        {/* ================================================================
            EXPERIENCE 02 — MY WORKSPACE
           ================================================================ */}
        <section
          id="workspace"
          aria-label="Developer Workspace"
          className="relative h-screen flex flex-col justify-between px-6 pt-24 pb-16 sm:px-10 lg:px-16"
        >
          <div className="max-w-md pointer-events-auto">
            <p className="font-mono-tech text-[11px] tracking-[0.24em] uppercase text-cyan-300/85">
              02 · My Workspace
            </p>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-white">
              Engineering Digital Craft
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#cfc8eb]/85">
              A live Three.js workstation inside the cosmos — curved IDE display, rotating RGB cooling fans, and hardware built for shipping ideas.
            </p>
          </div>

          <div className="self-end max-w-xs text-right hidden sm:block">
            <p className="font-mono-tech text-[10.5px] tracking-[0.18em] uppercase text-white/45">
              Curved Ultrawide · Dual RGB Cooling · Real-Time Shaders
            </p>
          </div>
        </section>

        {/* ================================================================
            EXPERIENCE 03 — CONNECT WITH ME (3D Crystals + Accessible Links)
           ================================================================ */}
        <section
          id="connect"
          aria-label="Connect With Me"
          className="relative min-h-screen flex flex-col justify-between px-6 pt-20 pb-10 sm:px-10 lg:px-16"
        >
          <div className="max-w-lg">
            <p className="font-mono-tech text-[11px] tracking-[0.24em] uppercase text-purple-300/85">
              03 · Connect With Me
            </p>
            <h2 className="mt-2.5 font-display text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-white">
              Crystal Constellation
            </h2>
            <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#cfc8eb]/80">
              Hover and click any floating 3D crystal badge above, or select a destination directly below.
            </p>
          </div>

          {/* Compact Transparent Accessible Directory for All 14 Links */}
          <nav
            aria-label="All 14 social and developer profiles"
            className="pointer-events-auto mt-auto pt-36 sm:pt-44 max-w-6xl w-full mx-auto"
          >
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2.5">
              {SOCIAL_LINKS.map((item) => {
                const linkProps = item.isEmail
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' };

                return (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      {...linkProps}
                      onMouseEnter={() => cosmicAudio.playCrystalChime(1)}
                      className="group flex items-center gap-2.5 border border-white/10 bg-[#050611]/70 px-2.5 py-2 rounded-sm transition-all duration-200 hover:border-purple-400/60 hover:bg-purple-950/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      <div className="scale-75 -m-1.5 shrink-0">
                        <FacetedBadge icon={item.icon} accentColor={item.accentColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[12px] font-semibold text-white/95 truncate group-hover:text-white">
                          {item.platform}
                        </div>
                        <div className="font-mono-tech text-[10px] text-[#a59ec9] truncate group-hover:text-purple-200">
                          {item.handle}
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </section>

        {/* ================================================================
            EXPERIENCE 04 — CONTACT
           ================================================================ */}
        <section
          id="contact"
          aria-label="Contact"
          className="relative h-screen flex flex-col justify-end sm:justify-center px-6 pb-20 pt-28 sm:px-10 lg:px-16"
        >
          <div className="max-w-2xl pointer-events-auto">
            <p className="font-mono-tech text-[11px] tracking-[0.24em] uppercase text-cyan-300/85">
              04 · Contact
            </p>

            <h2 className="mt-4 font-display font-bold tracking-[-0.03em] leading-[1.06] text-[clamp(2rem,4.8vw,3.9rem)] uppercase text-white">
              Let&apos;s build something{' '}
              <span className="text-[#a855f7] drop-shadow-[0_0_24px_rgba(168,85,247,0.4)]">
                interesting.
              </span>
            </h2>

            <p className="mt-5 font-mono-tech text-sm sm:text-base tracking-wide text-[#dcd6f7]">
              tharvesh@tmnexustech.in
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <a
                href="mailto:tharvesh@tmnexustech.in"
                className="inline-flex items-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white font-display text-sm font-semibold px-5 py-3 rounded-sm transition-colors shadow-[0_0_24px_rgba(147,51,234,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
                <ArrowUpRight className="w-4 h-4 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 border border-white/20 bg-[#070916]/75 hover:border-purple-400/60 text-white/90 hover:text-white font-mono-tech text-xs tracking-[0.12em] uppercase px-4 py-3 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-purple-300" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>

            <footer className="mt-12 border-t border-white/10 pt-5 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono-tech tracking-[0.14em] uppercase text-white/40">
              <span>Tharvesh Muhaideen A</span>
              <span>ECE Undergraduate · Software Engineer</span>
            </footer>
          </div>
        </section>

        {/* ================================================================
            SEAMLESS LOOP SEAM CLONE (matches #intro identically for infinite wrap)
           ================================================================ */}
        <section
          aria-hidden="true"
          className="relative h-screen flex flex-col justify-end sm:justify-center px-6 pb-20 pt-24 sm:px-10 lg:px-16"
        >
          <IntroHeroContent sceneReady={sceneReady} isClone />
        </section>
      </main>
    </div>
  );
}
