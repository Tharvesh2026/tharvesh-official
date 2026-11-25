import React from 'react';

export const HeroIntro: React.FC = () => {
  return (
    <header className="pointer-events-auto animate-hero-reveal relative flex items-stretch gap-4 sm:gap-5 max-w-4xl">
      {/* Thin vertical purple glowing accent line beside the heading */}
      <div
        aria-hidden="true"
        className="w-[3px] shrink-0 rounded-full bg-gradient-to-b from-purple-400 via-purple-500 to-fuchsia-500/40 shadow-[0_0_16px_rgba(168,85,247,0.85),0_0_32px_rgba(147,51,234,0.45)]"
      />

      <div className="flex flex-col justify-center">
        <h1 className="font-display font-bold tracking-[-0.025em] leading-[1.12] text-[clamp(1.65rem,3.1vw,2.95rem)] xl:whitespace-nowrap">
          <span className="text-white">Hi, I&apos;m </span>
          <span className="text-[#a855f7] drop-shadow-[0_0_24px_rgba(168,85,247,0.35)]">
            Tharvesh Muhaideen A
          </span>
        </h1>

        <p className="mt-2.5 sm:mt-3 max-w-[34rem] text-[14px] sm:text-[15.5px] lg:text-[16.5px] leading-[1.55] font-normal tracking-[0.005em] text-[#dcd6f7]">
          Undergraduate ECE Student currently Working as a Software Engineer. love to digitalize the Sparking Ideas
        </p>
      </div>
    </header>
  );
};
