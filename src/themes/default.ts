import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: 'Manrope, system-ui, sans-serif', heading: 'Manrope, system-ui, sans-serif',
    faces: [{ family: 'Manrope', src: '/fonts/manrope.woff2', weight: '200 800' }],
    preview: '/fonts/manrope.ttf',
  },
  light: { background: '#f7f7f8', surface: '#ffffff', text: '#202127', muted: '#63656f', border: '#dedfe4', accent: '#303440', hover: '#f0f1f4', pressed: '#e4e6ec' },
  dark: { background: '#121316', surface: '#1c1e23', text: '#f3f3f6', muted: '#b0b2bd', border: '#34363e', accent: '#d6d9e2', hover: '#272a31', pressed: '#333740' },
} satisfies Theme;
