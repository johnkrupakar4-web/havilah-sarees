import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'images');

/* ------------------------------------------------------------------ */
/* Minimal PNG encoder (RGBA, no dependencies)                         */
/* ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, pixels) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

/* ------------------------------------------------------------------ */
/* Tiny raster drawing helpers (all colors as [r,g,b])                 */
/* ------------------------------------------------------------------ */

function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

function blend(base, top, alpha) {
  return [
    Math.round(base[0] * (1 - alpha) + top[0] * alpha),
    Math.round(base[1] * (1 - alpha) + top[1] * alpha),
    Math.round(base[2] * (1 - alpha) + top[2] * alpha),
  ];
}

function makeCanvas(width, height, base) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = base[0];
    data[i * 4 + 1] = base[1];
    data[i * 4 + 2] = base[2];
    data[i * 4 + 3] = 255;
  }
  return data;
}

function setPx(data, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 4;
  data[i] = color[0];
  data[i + 1] = color[1];
  data[i + 2] = color[2];
  data[i + 3] = 255;
}

function fillRect(data, width, height, x0, y0, x1, y1, color) {
  const sx = Math.max(0, Math.min(x0, x1));
  const ex = Math.min(width - 1, Math.max(x0, x1));
  const sy = Math.max(0, Math.min(y0, y1));
  const ey = Math.min(height - 1, Math.max(y0, y1));
  for (let y = sy; y <= ey; y++) for (let x = sx; x <= ex; x++) setPx(data, width, height, x, y, color);
}

function fillCircle(data, width, height, cx, cy, r, color) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPx(data, width, height, x, y, color);
    }
  }
}

/** Diagonal woven thread overlay */
function addWeave(data, width, height, spacing, color, alpha) {
  const off = Math.floor(spacing / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if ((x + y) % spacing === 0 || (x - y + off) % spacing === 0) {
        const i = (y * width + x) * 4;
        const [r, g, b] = blend([data[i], data[i + 1], data[i + 2]], color, alpha);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }
  }
}

/** Horizontal tonal bands */
function addBands(data, width, height, colors, bandH) {
  for (let y = 0; y < height; y++) {
    const band = Math.floor(y / bandH);
    const [r, g, b] = colors[band % colors.length];
    const i = (y * width) * 4;
    for (let x = 0; x < width; x++) {
      const j = i + x * 4;
      // blend softly toward the band color
      data[j] = Math.round((data[j] + r) / 2);
      data[j + 1] = Math.round((data[j + 1] + g) / 2);
      data[j + 2] = Math.round((data[j + 2] + b) / 2);
    }
  }
}

/** Centered diamond outline medallion */
function addDiamond(data, width, height, cx, cy, size, color, thickness) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const d = dx + dy;
      if (d >= size - thickness && d <= size + thickness) setPx(data, width, height, x, y, color);
    }
  }
}

function addCircleRing(data, width, height, cx, cy, r, color, thickness) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dist - r) <= thickness) setPx(data, width, height, x, y, color);
    }
  }
}

/** Small paisley-ish dot cluster */
function addCluster(data, width, height, cx, cy, color) {
  fillCircle(data, width, height, cx, cy, 6, color);
  fillCircle(data, width, height, cx + 16, cy - 4, 4, color);
  fillCircle(data, width, height, cx - 16, cy + 5, 4, color);
}

function savePNG(relPath, width, height, data) {
  const file = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodePNG(width, height, data));
  console.log('generated', path.relative(ROOT, file));
}

/* ------------------------------------------------------------------ */
/* Placeholder designs                                                 */
/* ------------------------------------------------------------------ */

const PALETTES = [
  { deep: hex('#2a1a10'), band: hex('#3a2716'), gold: hex('#c9a876'), thread: hex('#d8c09a'), mid: hex('#8a4b2c') },
  { deep: hex('#1f2730'), band: hex('#2e3c47'), gold: hex('#c0a97c'), thread: hex('#cfc2a6'), mid: hex('#6f5b8e') },
  { deep: hex('#301b1b'), band: hex('#43282a'), gold: hex('#d3b285'), thread: hex('#e2cfa8'), mid: hex('#9c5b4a') },
  { deep: hex('#18231b'), band: hex('#24382a'), gold: hex('#c8b07e'), thread: hex('#d9c8a4'), mid: hex('#5f7d5c') },
  { deep: hex('#2b1d27'), band: hex('#3d2a37'), gold: hex('#cfad83'), thread: hex('#dfd0b0'), mid: hex('#a2654f') },
  { deep: hex('#202420'), band: hex('#2f3930'), gold: hex('#c4a76f'), thread: hex('#d5c4a6'), mid: hex('#9a6b3f') },
];

const PRODUCT_SPEC = [
  { palette: 0, motif: 'diamond', feature: true },
  { palette: 1, motif: 'ring', feature: false },
  { palette: 2, motif: 'diamond', feature: true },
  { palette: 3, motif: 'cluster', feature: false },
  { palette: 4, motif: 'ring', feature: true },
  { palette: 5, motif: 'diamond', feature: false },
  { palette: 0, motif: 'cluster', feature: true },
  { palette: 1, motif: 'diamond', feature: false },
  { palette: 2, motif: 'cluster', feature: false },
  { palette: 3, motif: 'ring', feature: true },
];

function composition(width, height, palette, motif) {
  const data = makeCanvas(width, height, palette.deep);
  addBands(data, width, height, [palette.deep, palette.band, palette.deep], Math.max(18, Math.round(height / 14)));
  addWeave(data, width, height, 5, palette.thread, 0.06);
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);
  const base = Math.round(Math.min(width, height) * 0.3);
  addDiamond(data, width, height, cx, cy, base, palette.gold, 2);
  addDiamond(data, width, height, cx, cy, base - 14, palette.mid, 1);
  if (motif === 'ring') {
    addCircleRing(data, width, height, cx, cy, Math.round(base * 0.8), palette.thread, 1);
    fillCircle(data, width, height, cx, cy, 10, palette.gold);
  } else if (motif === 'cluster') {
    addCluster(data, width, height, cx, cy, palette.gold);
    addCluster(data, width, height, cx + base - 6, cy - base + 6, palette.thread);
    addCluster(data, width, height, cx - base + 6, cy + base - 6, palette.thread);
  } else {
    addCircleRing(data, width, height, cx, cy, base, palette.thread, 1);
  }
  return data;
}

// logo mark (placeholder weaving motif, not a real logo)
{
  const size = 640;
  const p = PALETTES[0];
  const data = makeCanvas(size, size, p.deep);
  addWeave(data, size, size, 6, p.thread, 0.08);
  addCircleRing(data, size, size, size / 2, size / 2, Math.round(size * 0.42), p.gold, 4);
  addDiamond(data, size, size, size / 2, size / 2, Math.round(size * 0.34), p.gold, 3);
  addDiamond(data, size, size, size / 2, size / 2, Math.round(size * 0.27), p.mid, 1);
  fillCircle(data, size, size, size / 2, size / 2, Math.round(size * 0.05), p.gold);
  savePNG('logo.png', size, size, data);
}

// hero
{
  const p = PALETTES[2];
  savePNG('hero/hero-1.png', 1600, 900, composition(1600, 900, p, 'diamond'));
  savePNG('hero/hero-2.png', 1600, 900, composition(1600, 900, PALETTES[4], 'ring'));
}

// products (portrait)
PRODUCT_SPEC.forEach((spec, i) => {
  const p = PALETTES[spec.palette];
  savePNG(`products/product-${i + 1}.png`, 900, 1200, composition(900, 1200, p, spec.motif));
});

// gallery (landscape)
for (let i = 0; i < 12; i++) {
  const p = PALETTES[i % PALETTES.length];
  const motif = i % 2 === 0 ? 'diamond' : i % 3 === 0 ? 'cluster' : 'ring';
  savePNG(`gallery/gallery-${i + 1}.png`, 1200, 800, composition(1200, 800, p, motif));
}

// about story image
{
  const p = PALETTES[1];
  savePNG('about/story.png', 1600, 1000, composition(1600, 1000, p, 'ring'));
}

// default Open Graph image
{
  const p = PALETTES[0];
  savePNG('og-default.png', 1200, 630, composition(1200, 630, p, 'diamond'));
}

console.log('All placeholder images generated.');