// Usage: npm run new -- debug "Flaky login test" 2019-04-02
//        npm run new -- project|post|til|experience "<title>" [YYYY-MM-DD]
// Writes into the active profile (PROFILE env var, default ./profile).
import fs from 'node:fs';
import path from 'node:path';
import { loadSiteConfig, profilePath, PROFILE_NAME } from '../src/lib/load-config.mjs';
const [type, title, date] = process.argv.slice(2);
const folders = { debug: 'debug', project: 'projects', post: 'posts', til: 'til', experience: 'experience' };
if (!folders[type] || !title) {
  console.log('Usage: npm run new -- <debug|project|post|til|experience> "<title>" [YYYY-MM-DD]');
  process.exit(1);
}
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const when = date || new Date().toISOString().slice(0, 10);
const rel = `content/${folders[type]}/${type === 'experience' ? when.slice(0, 4) + '-' : ''}${slug}.md`;
const file = profilePath(rel);
if (fs.existsSync(file)) { console.error(`${PROFILE_NAME}/${rel} already exists`); process.exit(1); }
let tpl = fs.readFileSync(`templates/${type}.md`, 'utf8')
  .replace(/^title: ""/m, `title: ${JSON.stringify(title)}`)
  .replace(/^(date|start): \d{4}-\d{2}-\d{2}/m, `$1: ${when}`)
  .replaceAll('__ROLE__', loadSiteConfig().active_role);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, tpl);
console.log(`Created ${PROFILE_NAME}/${rel}`);
