import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"IBM Plex Sans", system-ui, sans-serif', heading: '"IBM Plex Sans", system-ui, sans-serif',
    faces: [{ family: 'IBM Plex Sans', src: '/fonts/ibm-plex-sans.ttf', weight: '100 700' }],
    preview: '/fonts/ibm-plex-sans.ttf',
  },
  light: { background: '#e9edf2', surface: '#f7f9fc', text: '#18212f', muted: '#475569', border: '#aebdce', accent: '#1d4fc4', hover: '#e1e8f1', pressed: '#d3ddea' },
  dark: { background: '#10151d', surface: '#19212d', text: '#eef3fb', muted: '#b3c1d4', border: '#46576e', accent: '#7eafff', hover: '#222e3f', pressed: '#2c3a4f' },
} satisfies Theme;
