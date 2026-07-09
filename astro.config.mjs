import { defineConfig } from 'astro/config';

// GitHub Pages PROJECT site: served under https://ahmed310.github.io/dev/
export default defineConfig({
  site: 'https://ahmed310.github.io',
  base: '/dev/',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'always',
  },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: false },
  },
});
