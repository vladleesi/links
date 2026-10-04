import type { Theme } from '../lib/theme';

export default {
  fonts: { body: 'system-ui, sans-serif', heading: 'system-ui, sans-serif' },
  light: { background: '#faf9f5', surface: '#fffffc', text: '#34352c', muted: '#666756', border: '#dddfce', accent: '#536a1b', hover: '#f0f2e7', pressed: '#e5ebd4' },
  dark: { background: '#272822', surface: '#30312a', text: '#f8f8f2', muted: '#c0c0ae', border: '#4b4c40', accent: '#a6e22e', hover: '#3a3c31', pressed: '#454939' },
} satisfies Theme;
