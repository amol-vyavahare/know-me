// Favicon generated from the profile's name + active role colour.
// A profile can ship its own `public/favicon.svg` instead (Base.astro prefers it).
import { initials, activeRole } from '../lib/site';

export function GET() {
  const size = initials.length > 1 ? 26 : 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#111827"/><text x="32" y="42" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" fill="${activeRole.accent}" text-anchor="middle">${initials.replace(/[<&]/g, '')}</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
