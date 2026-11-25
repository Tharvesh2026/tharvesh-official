import React from 'react';
import type { SocialIconId } from '../data/socialLinks';

interface FacetedBadgeProps {
  icon: SocialIconId;
  accentColor: string;
}

function PlatformGlyph({ icon, accentColor }: FacetedBadgeProps) {
  switch (icon) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" aria-hidden="true">
          <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" stroke={accentColor} strokeWidth="2.1" />
          <circle cx="12" cy="12" r="4.1" stroke={accentColor} strokeWidth="2.1" />
          <circle cx="17.4" cy="6.6" r="1.25" fill={accentColor} />
        </svg>
      );

    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" aria-hidden="true">
          <path
            d="M21.2 7.3a2.7 2.7 0 0 0-1.9-1.9C17.6 4.9 12 4.9 12 4.9s-5.6 0-7.3.5A2.7 2.7 0 0 0 2.8 7.3C2.3 9 2.3 12 2.3 12s0 3 .5 4.7a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.3.5 7.3.5s5.6 0 7.3-.5a2.7 2.7 0 0 0 1.9-1.9c.5-1.7.5-4.7.5-4.7s0-3-.5-4.7Z"
            fill={accentColor}
          />
          <path d="M10.1 15.1V8.9l5.3 3.1-5.3 3.1Z" fill="#FFFFFF" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill={accentColor} />
          <circle cx="7.4" cy="8.1" r="1.35" fill="#FFFFFF" />
          <path d="M6.2 10.7h2.4v7.1H6.2v-7.1Zm4.2 0h2.3v1c.45-.7 1.3-1.2 2.4-1.2 2.15 0 2.9 1.35 2.9 3.35v3.95h-2.4v-3.5c0-.95-.25-1.65-1.25-1.65-.9 0-1.55.6-1.55 1.65v3.5h-2.4v-7.1Z" fill="#FFFFFF" />
        </svg>
      );

    case 'devto':
      return (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" aria-hidden="true">
          <rect x="2.2" y="4.5" width="19.6" height="15" rx="2.6" fill="#18181B" />
          <path
            d="M5.7 9.1h1.7c1.45 0 2.35.95 2.35 2.9s-.9 2.9-2.35 2.9H5.7V9.1Zm1.25 1.25v3.3h.45c.7 0 1.1-.45 1.1-1.65s-.4-1.65-1.1-1.65h-.45Zm4.1-1.25h2.9v1.25h-1.65v1h1.3v1.2h-1.3v1.1h1.65v1.25h-2.9V9.1Zm3.8 0h1.3l.95 3.6.95-3.6h1.3l-1.55 5.8h-1.4l-1.55-5.8Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'medium':
      return (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" aria-hidden="true">
          <circle cx="6.8" cy="12" r="4.5" fill="#18181B" />
          <ellipse cx="14.6" cy="12" rx="2.35" ry="4.2" fill="#18181B" />
          <ellipse cx="19.4" cy="12" rx="1.05" ry="3.7" fill="#18181B" />
        </svg>
      );

    case 'buymeacoffee':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" aria-hidden="true">
          <path
            d="M6.4 8.5h9.6l-.85 8.9a2 2 0 0 1-1.99 1.81H9.24a2 2 0 0 1-1.99-1.81L6.4 8.5Z"
            fill="#FFDD00"
            stroke="#1F2937"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M5.4 8.5h11.6M7.6 6.2h7.2" stroke="#1F2937" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16 10.3h1.65a1.85 1.85 0 0 1 0 3.7h-1.95" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9.6 12.2c.45-.5.95-.5 1.4 0 .45-.5.95-.5 1.4 0 .35.4.2 1.15-.25 1.55l-1.15.95-1.15-.95c-.45-.4-.6-1.15-.25-1.55Z" fill="#1F2937" />
        </svg>
      );

    case 'topmate':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.8" fill="#E11D48" />
          <path
            d="M8.1 9.2h7.8v2.1h-2.8v5.5h-2.2v-5.5H8.1V9.2Z"
            fill="#FFFFFF"
          />
          <circle cx="16.4" cy="15.3" r="1.45" fill="#FDE047" />
        </svg>
      );

    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12c0 4.2 2.72 7.76 6.5 9.02.47.09.65-.2.65-.46 0-.23-.01-.98-.01-1.78-2.39.44-3.01-.58-3.2-1.12-.11-.28-.58-1.14-.99-1.37-.34-.18-.82-.63-.01-.64.76-.01 1.3.7 1.48.99.87 1.46 2.26 1.05 2.81.8.09-.63.34-1.05.62-1.29-2.12-.24-4.34-1.06-4.34-4.71 0-1.04.37-1.9.98-2.57-.1-.24-.43-1.22.09-2.54 0 0 .8-.26 2.62.98a9.06 9.06 0 0 1 4.76 0c1.82-1.24 2.62-.98 2.62-.98.52 1.32.19 2.3.09 2.54.61.67.98 1.52.98 2.57 0 3.66-2.23 4.47-4.35 4.71.35.3.65.88.65 1.78 0 1.29-.01 2.33-.01 2.65 0 .26.18.56.65.46A9.503 9.503 0 0 0 21.5 12c0-5.25-4.25-9.5-9.5-9.5Z"
            fill="#111827"
          />
        </svg>
      );

    case 'portfolio':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.2" stroke={accentColor} strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="3.7" ry="8.2" stroke={accentColor} strokeWidth="1.75" />
          <path d="M4.2 9.4h15.6M4.2 14.6h15.6" stroke={accentColor} strokeWidth="1.7" />
        </svg>
      );

    case 'devs':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" aria-hidden="true">
          <path
            d="M8.4 7.6 4 12l4.4 4.4M15.6 7.6 20 12l-4.4 4.4M13.5 6.3l-3 11.4"
            stroke={accentColor}
            strokeWidth="2.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" aria-hidden="true">
          <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.4" stroke={accentColor} strokeWidth="2" />
          <path
            d="M4.3 6.8 12 12.7l7.7-5.9"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export const FacetedBadge: React.FC<FacetedBadgeProps> = ({ icon, accentColor }) => {
  const clipId = React.useId();

  return (
    <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:scale-[1.06]">
      {/* Subtle purple radial bloom on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-full opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-85 bg-purple-500/45"
      />

      {/* Low-poly faceted white crystal circular badge */}
      <svg
        viewBox="0 0 100 100"
        className="relative w-full h-full drop-shadow-[0_6px_14px_rgba(10,6,28,0.65)]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <polygon points="50,2 74,9 91,26 98,50 91,74 74,91 50,98 26,91 9,74 2,50 9,26 26,9" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {/* Outer faceted crystal ring segments */}
          <polygon points="50,2 74,9 58,28 42,28 26,9" fill="#FFFFFF" />
          <polygon points="74,9 91,26 72,40 58,28" fill="#F2EEFF" />
          <polygon points="91,26 98,50 76,50 72,40" fill="#E3DCF9" />
          <polygon points="98,50 91,74 72,62 76,50" fill="#D4C9F3" />
          <polygon points="91,74 74,91 58,72 72,62" fill="#CAC0EC" />
          <polygon points="74,91 50,98 50,74 58,72" fill="#DCD4F6" />
          <polygon points="50,98 26,91 42,72 50,74" fill="#E9E4FA" />
          <polygon points="26,91 9,74 28,62 42,72" fill="#D7CFF3" />
          <polygon points="9,74 2,50 24,50 28,62" fill="#E5DFF8" />
          <polygon points="2,50 9,26 28,40 24,50" fill="#F4F1FF" />
          <polygon points="9,26 26,9 42,28 28,40" fill="#FBF9FF" />

          {/* Inner planar crystal facets */}
          <polygon points="42,28 58,28 72,40 76,50 72,62 58,72 50,74 42,72 28,62 24,50 28,40" fill="#FAF8FF" />
          <polygon points="42,28 58,28 50,50" fill="#FFFFFF" opacity="0.85" />
          <polygon points="58,28 72,40 76,50 50,50" fill="#F2EEFF" opacity="0.7" />
          <polygon points="76,50 72,62 58,72 50,50" fill="#E6E0F8" opacity="0.75" />
          <polygon points="58,72 50,74 42,72 50,50" fill="#ECE7FA" opacity="0.8" />
          <polygon points="42,72 28,62 24,50 50,50" fill="#F3F0FD" opacity="0.8" />
          <polygon points="24,50 28,40 42,28 50,50" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Crisp faceted geometric edge lines */}
        <polygon
          points="50,2 74,9 91,26 98,50 91,74 74,91 50,98 26,91 9,74 2,50 9,26 26,9"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.6"
        />
        <polygon
          points="42,28 58,28 72,40 76,50 72,62 58,72 50,74 42,72 28,62 24,50 28,40"
          fill="none"
          stroke="rgba(167,139,250,0.28)"
          strokeWidth="1"
        />
      </svg>

      {/* Centered platform SVG icon */}
      <div className="relative z-10 flex items-center justify-center pointer-events-none">
        <PlatformGlyph icon={icon} accentColor={accentColor} />
      </div>
    </div>
  );
};
