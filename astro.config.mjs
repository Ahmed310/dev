import { defineConfig } from 'astro/config';

// GitHub Pages PROJECT site: served under https://ahmed310.github.io/dev/
// `site` = your Pages origin, `base` = the repo name (with leading+trailing slash).
// If you rename the repo, change `base` to match.
export default defineConfig({
  site: 'https://ahmed310.github.io',
  base: '/dev/',
  trailingSlash: 'ignore',
});
