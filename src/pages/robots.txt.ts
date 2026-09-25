// With share_links on, every page is unlisted: ask search engines to stay away.
import { sharing } from '../lib/site';

export function GET() {
  return new Response(`User-agent: *\n${sharing ? 'Disallow: /' : 'Allow: /'}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
