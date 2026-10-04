import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"Open Sans", system-ui, sans-serif', heading: '"Open Sans", system-ui, sans-serif',
    faces: [{ family: 'Open Sans', src: '/fonts/opensans.woff2', weight: '300 800' }],
    preview: '/fonts/opensans.ttf',
  },
  light: { background: '#fef7ff', surface: '#f3edf7', text: '#1d1b20', muted: '#49454f', border: '#cac4d0', accent: '#6750a4', hover: '#ece6f0', pressed: '#eaddff' },
  dark: { background: '#141218', surface: '#211f26', text: '#e6e1e5', muted: '#cac4d0', border: '#49454f', accent: '#d0bcff', hover: '#2b2930', pressed: '#38313f' },
} satisfies Theme;
