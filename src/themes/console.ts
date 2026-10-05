import type { Theme } from '../lib/theme';

export default {
  fonts: {
    body: '"JetBrains Mono", ui-monospace, monospace', heading: '"JetBrains Mono", ui-monospace, monospace',
    faces: [{ family: 'JetBrains Mono', src: '/fonts/jetbrains-mono.ttf', weight: '100 800' }],
    preview: '/fonts/jetbrains-mono.ttf',
  },
  light: { background: '#f4f1e8', surface: '#faf8f0', text: '#202d24', muted: '#4e5d53', border: '#abb9ad', accent: '#23633d', hover: '#e9edde', pressed: '#dce5d6' },
  dark: { background: '#0f1211', surface: '#181c1a', text: '#d8ded9', muted: '#adb8b0', border: '#48514b', accent: '#68ee91', hover: '#202722', pressed: '#29352d' },
} satisfies Theme;
