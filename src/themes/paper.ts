import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"Source Sans 3", system-ui, sans-serif', heading: 'Lora, Georgia, serif',
    faces: [
      { family: 'Source Sans 3', src: '/fonts/source-sans-3.ttf', weight: '200 900' },
      { family: 'Lora', src: '/fonts/lora.ttf', weight: '400 700' },
    ],
    preview: '/fonts/lora.ttf',
  },
  light: { background: '#f5f0e6', surface: '#fffcf5', text: '#332a22', muted: '#635646', border: '#d5c6ae', accent: '#6e482c', hover: '#eee4d3', pressed: '#e2d4be' },
  dark: { background: '#211d18', surface: '#2d2720', text: '#f2e9d8', muted: '#c3b59e', border: '#574938', accent: '#e3bd8b', hover: '#383025', pressed: '#473a2c' },
} satisfies Theme;
