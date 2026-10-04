export const services = {
  github: ['github.com'], gitlab: ['gitlab.com'], bitbucket: ['bitbucket.org'], stackoverflow: ['stackoverflow.com', 'stackexchange.com'],
  npm: ['npmjs.com'], docker: ['hub.docker.com'], codepen: ['codepen.io'], devdotto: ['dev.to'], hackerrank: ['hackerrank.com'], leetcode: ['leetcode.com'],
  linkedin: ['linkedin.com'], x: ['x.com', 'twitter.com'], instagram: ['instagram.com'], facebook: ['facebook.com', 'fb.com'], threads: ['threads.net', 'threads.com'],
  bluesky: ['bsky.app'], mastodon: ['mastodon.social', 'mastodon.online'], reddit: ['reddit.com', 'redd.it'], tumblr: ['tumblr.com'],
  telegram: ['t.me', 'telegram.me'], whatsapp: ['wa.me', 'whatsapp.com'], discord: ['discord.com', 'discord.gg'], slack: ['slack.com'],
  youtube: ['youtube.com', 'youtu.be'], twitch: ['twitch.tv'], tiktok: ['tiktok.com'], vimeo: ['vimeo.com'],
  spotify: ['spotify.com'], soundcloud: ['soundcloud.com'], applemusic: ['music.apple.com'], bandcamp: ['bandcamp.com'],
  behance: ['behance.net'], dribbble: ['dribbble.com'], artstation: ['artstation.com'], pinterest: ['pinterest.com', 'pin.it'],
  medium: ['medium.com'], substack: ['substack.com'], patreon: ['patreon.com'], kofi: ['ko-fi.com'], buymeacoffee: ['buymeacoffee.com'],
} as const;

export type IconId = keyof typeof services | 'website' | 'email' | 'external';
export const iconIds = [...Object.keys(services), 'website', 'email', 'external'] as IconId[];

export function detectIcon(value: string): IconId {
  const url = new URL(value);
  if (url.protocol === 'mailto:') return 'email';
  const host = url.hostname.toLowerCase();
  for (const [icon, domains] of Object.entries(services)) if (domains.some(domain => host === domain || host.endsWith(`.${domain}`))) return icon as IconId;
  return 'website';
}

export function isProfileLink(value: string, icon: IconId): boolean {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || ['website', 'email', 'external', 'discord', 'slack', 'whatsapp'].includes(icon)) return false;
  if (!url.pathname.replace(/\//g, '') && ['bandcamp', 'substack', 'tumblr', 'mastodon'].includes(icon)) return true;
  if (/\/(watch|status|statuses|posts?|reel|reels|p|video|videos|track|album)\b/.test(url.pathname)) return false;
  if (icon === 'github' || icon === 'gitlab' || icon === 'bitbucket') return url.pathname.split('/').filter(Boolean).length === 1;
  if (icon === 'linkedin') return url.pathname.startsWith('/in/');
  if (icon === 'youtube') return /^\/(?:@|channel\/|c\/|user\/)/.test(url.pathname);
  return url.pathname.length > 1;
}
