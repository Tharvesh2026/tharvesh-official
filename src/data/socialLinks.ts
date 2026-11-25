export type SocialIconId =
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'devto'
  | 'medium'
  | 'buymeacoffee'
  | 'topmate'
  | 'github'
  | 'portfolio'
  | 'devs'
  | 'mail';

export interface SocialLinkItem {
  id: string;
  platform: string;
  handle: string;
  url: string;
  icon: SocialIconId;
  isEmail?: boolean;
  accentColor: string;
}

export const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'instagram-imtharvesh',
    platform: 'Instagram',
    handle: '@imtharvesh',
    url: 'https://instagram.com/imtharvesh',
    icon: 'instagram',
    accentColor: '#E1306C',
  },
  {
    id: 'instagram-tharvesh-muhaideen',
    platform: 'Instagram',
    handle: '@tharvesh_muhaideen',
    url: 'https://instagram.com/tharvesh_muhaideen',
    icon: 'instagram',
    accentColor: '#E1306C',
  },
  {
    id: 'youtube-tharveshmuhaideen',
    platform: 'YouTube',
    handle: '@tharveshmuhaideen',
    url: 'https://youtube.com/@tharveshmuhaideen',
    icon: 'youtube',
    accentColor: '#FF0000',
  },
  {
    id: 'linkedin-tharvesh2005',
    platform: 'LinkedIn',
    handle: '/in/tharvesh2005',
    url: 'https://linkedin.com/in/tharvesh2005',
    icon: 'linkedin',
    accentColor: '#0A66C2',
  },
  {
    id: 'devto-tharvbytes',
    platform: 'Dev.to',
    handle: 'tharvbytes',
    url: 'https://dev.to/tharvbytes',
    icon: 'devto',
    accentColor: '#111827',
  },
  {
    id: 'devto-tharvesh-muhaideen',
    platform: 'Dev.to',
    handle: 'tharvesh_muhaideen',
    url: 'https://dev.to/tharvesh_muhaideen',
    icon: 'devto',
    accentColor: '#111827',
  },
  {
    id: 'medium-tharveshmuhaideen',
    platform: 'Medium',
    handle: '@tharveshmuhaideen',
    url: 'https://medium.com/@tharveshmuhaideen',
    icon: 'medium',
    accentColor: '#111827',
  },
  {
    id: 'buymeacoffee-tharveshmuhaideen',
    platform: 'Buy Me a Coffee',
    handle: '/tharveshmuhaideen',
    url: 'https://buymeacoffee.com/tharveshmuhaideen',
    icon: 'buymeacoffee',
    accentColor: '#D97706',
  },
  {
    id: 'topmate-tm-projects',
    platform: 'Topmate',
    handle: 'tm_projects',
    url: 'https://topmate.io/tm_projects',
    icon: 'topmate',
    accentColor: '#DC2626',
  },
  {
    id: 'github-tharvesh588',
    platform: 'GitHub',
    handle: 'tharvesh588',
    url: 'https://github.com/tharvesh588',
    icon: 'github',
    accentColor: '#111827',
  },
  {
    id: 'github-tharvesh2026',
    platform: 'GitHub',
    handle: 'tharvesh2026',
    url: 'https://github.com/tharvesh2026',
    icon: 'github',
    accentColor: '#111827',
  },
  {
    id: 'portfolio-imtharvesh',
    platform: 'Portfolio',
    handle: 'imtharvesh.me',
    url: 'https://imtharvesh.me',
    icon: 'portfolio',
    accentColor: '#7C3AED',
  },
  {
    id: 'devs-tmnexustech',
    platform: 'Devs',
    handle: 'me.tmnexustech.in',
    url: 'https://me.tmnexustech.in',
    icon: 'devs',
    accentColor: '#6D28D9',
  },
  {
    id: 'mail-tmnexustech',
    platform: 'Mail',
    handle: 'tharvesh@tmnexustech.in',
    url: 'mailto:tharvesh@tmnexustech.in',
    icon: 'mail',
    isEmail: true,
    accentColor: '#7C3AED',
  },
];
