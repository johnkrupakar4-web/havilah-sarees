/**
 * Havilah Sarees — build verification script.
 * Checks that every internal link and image reference in the built site
 * resolves to an existing file. Run with:  node scripts/verify.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) files.push(p);
  }
})(DIST);

let issues = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const base = path.dirname(file);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const raw of refs) {
    if (raw.startsWith('#') || raw.startsWith('http') || raw.startsWith('mailto:') || raw === '') continue;
    const u = raw.split('#')[0].split('?')[0];
    if (u === '') continue;
    const target = path.resolve(base, u.replace(/^\.\//, ''));
    if (!fs.existsSync(target)) {
      console.log('  BROKEN  ' + path.relative(DIST, file) + '  ->  ' + raw);
      issues++;
    }
  }
}

console.log(
  issues === 0
    ? '✔ All links OK (' + files.length + ' pages, ' + path.join('dist', '') + ')'
    : '✖ Found ' + issues + ' broken reference(s)'
);
process.exit(issues === 0 ? 0 : 1);