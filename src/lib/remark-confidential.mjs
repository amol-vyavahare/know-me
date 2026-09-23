// In `mask` mode, swaps a confidential item's real company name for its alias
// inside the rendered Markdown body, so you can write naturally and still toggle.
import { loadSiteConfig, maskText } from './load-config.mjs';

function walk(node, fn) {
  fn(node);
  if (node.children) for (const c of node.children) walk(c, fn);
}

export default function remarkConfidential() {
  const { confidential_mode } = loadSiteConfig();
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter ?? {};
    if (confidential_mode === 'show' || !fm.confidential || !fm.company) return;
    walk(tree, (n) => {
      if ((n.type === 'text' || n.type === 'inlineCode' || n.type === 'code') && n.value) {
        n.value = maskText(n.value, fm.company, fm.company_alias);
      }
    });
  };
}
