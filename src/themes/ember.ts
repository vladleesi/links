import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: 'Manrope, system-ui, sans-serif', heading: 'Manrope, system-ui, sans-serif',
    faces: [{ family: 'Manrope', src: '/fonts/manrope.woff2', weight: '200 800' }],
    preview: '/fonts/manrope.ttf',
  },
  light: { background: '#fff4ed', surface: '#fffaf6', text: '#402922', muted: '#754f41', border: '#e5c2b0', accent: '#9c3d1d', hover: '#f8e3d6', pressed: '#efd0bd' },
  dark: { background: '#251b18', surface: '#352520', text: '#ffece1', muted: '#dcbaaa', border: '#634437', accent: '#ffaf87', hover: '#452f27', pressed: '#573a2e' },
} satisfies Theme;
