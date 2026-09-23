// Usage: npm run new -- debug "Flaky login test" 2019-04-02
//        npm run new -- project|post|til|experience "<title>" [YYYY-MM-DD]
import fs from 'node:fs';
const [type, title, date] = process.argv.slice(2);
const folders = { debug: 'debug', project: 'projects', post: 'posts', til: 'til', experience: 'experience' };
if (!folders[type] || !title) {
  console.log('Usage: npm run new -- <debug|project|post|til|experience> "<title>" [YYYY-MM-DD]');
  process.exit(1);
}
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const when = date || new Date().toISOString().slice(0, 10);
const file = `content/${folders[type]}/${type === 'experience' ? when.slice(0, 4) + '-' : ''}${slug}.md`;
if (fs.existsSync(file)) { console.error(`${file} already exists`); process.exit(1); }
let tpl = fs.readFileSync(`templates/${type}.md`, 'utf8')
  .replace(/^title: ""/m, `title: ${JSON.stringify(title)}`)
  .replace(/^(date|start): \d{4}-\d{2}-\d{2}/m, `$1: ${when}`);
fs.writeFileSync(file, tpl);
console.log(`Created ${file}`);
