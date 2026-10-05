import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"Archivo", system-ui, sans-serif', heading: '"Archivo", system-ui, sans-serif',
    faces: [{ family: 'Archivo', src: '/fonts/archivo.ttf', weight: '100 900' }],
    preview: '/fonts/archivo.ttf',
  },
  light: { background: '#f1efea', surface: '#faf9f6', text: '#151412', muted: '#625f5a', border: '#cbc7bf', accent: '#c9231c', hover: '#e9e6e0', pressed: '#ddd9d1' },
  dark: { background: '#0a0a0a', surface: '#141414', text: '#f2f0ec', muted: '#92908c', border: '#33302d', accent: '#ee342c', hover: '#1d1b1a', pressed: '#292624' },
} satisfies Theme;
