import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"IBM Plex Sans", system-ui, sans-serif', heading: '"IBM Plex Sans", system-ui, sans-serif',
    faces: [{ family: 'IBM Plex Sans', src: '/fonts/ibm-plex-sans.ttf', weight: '100 700' }],
    preview: '/fonts/ibm-plex-sans.ttf',
  },
  light: { background: '#edf3f8', surface: '#f9fcff', text: '#233448', muted: '#425a70', border: '#c8d7e4', accent: '#285a83', hover: '#e0ebf4', pressed: '#d0e1ee' },
  dark: { background: '#182530', surface: '#213443', text: '#e8f3fb', muted: '#bdd4e5', border: '#3e5a6f', accent: '#87c7ef', hover: '#2b4254', pressed: '#2f4a5e' },
} satisfies Theme;
