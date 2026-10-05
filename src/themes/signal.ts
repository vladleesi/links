import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"Space Grotesk", system-ui, sans-serif', heading: '"Space Grotesk", system-ui, sans-serif',
    faces: [{ family: 'Space Grotesk', src: '/fonts/space-grotesk.ttf', weight: '300 700' }],
    preview: '/fonts/space-grotesk.ttf',
  },
  light: { background: '#fafafa', surface: '#ffffff', text: '#151515', muted: '#4c4c4c', border: '#9c9c9c', accent: '#b23b00', hover: '#f0f0f0', pressed: '#e6e6e6' },
  dark: { background: '#090909', surface: '#161616', text: '#fafafa', muted: '#bcbcbc', border: '#606060', accent: '#ff8b3d', hover: '#242424', pressed: '#303030' },
} satisfies Theme;
