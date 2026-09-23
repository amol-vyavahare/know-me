// @ts-check
import { defineConfig } from 'astro/config';
import { loadSiteConfig } from './src/lib/load-config.mjs';
import remarkConfidential from './src/lib/remark-confidential.mjs';

const cfg = loadSiteConfig();

// On GitHub Actions these come from the workflow (owner + repo name),
// so the site works whatever you name the repository.
const site = process.env.SITE || cfg.site_url;
const base = process.env.BASE_PATH || cfg.base_path || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkConfidential],
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-dimmed' } },
  },
});
