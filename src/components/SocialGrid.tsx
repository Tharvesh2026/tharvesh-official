import React from 'react';
import { SOCIAL_LINKS } from '../data/socialLinks';
import { FacetedBadge } from './SocialIcons';

export const SocialGrid: React.FC = () => {
  return (
    <nav
      aria-label="Social and developer links"
      className="pointer-events-auto w-full lg:w-auto"
    >
      <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-3.5 lg:gap-x-7 lg:gap-y-4">
        {SOCIAL_LINKS.map((item, idx) => {
          const linkProps = item.isEmail
            ? {}
            : {
                target: '_blank',
                rel: 'noopener noreferrer',
              };

          return (
            <li
              key={item.id}
              className="animate-badge-reveal"
              style={{ animationDelay: `${140 + idx * 32}ms` }}
            >
              <a
                href={item.url}
                {...linkProps}
                aria-label={`${item.platform} — ${item.handle}`}
                className="group flex items-center gap-3 sm:gap-3.5 rounded-xl px-2 py-1.5 -mx-2 -my-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-purple-500/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050611]"
              >
                <FacetedBadge icon={item.icon} accentColor={item.accentColor} />

                <div className="min-w-0 flex flex-col">
                  <span className="font-display text-[14px] sm:text-[15px] font-semibold leading-tight text-white/95 transition-colors duration-200 group-hover:text-white truncate">
                    {item.platform}
                  </span>
                  <span className="text-[12px] sm:text-[12.5px] leading-snug text-[#a59ec9] transition-colors duration-200 group-hover:text-[#dcd3ff] truncate">
                    {item.handle}
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
