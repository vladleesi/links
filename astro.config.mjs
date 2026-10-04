import { defineConfig } from 'astro/config';
import { config } from './src/lib/config.ts';

const url = new URL(config.site.url);

export default defineConfig({
  site: url.origin,
  base: url.pathname,
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
