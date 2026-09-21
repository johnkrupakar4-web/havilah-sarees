/**
 * Havilah Sarees — static site build script.
 *
 * Reads src/pages/*.html (content only) plus src/partials (head/header/
 * footer), fills in business config, products and gallery data, and writes
 * the finished static site to dist/.
 *
 * Run with:  node scripts/build.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const require = createRequire(import.meta.url);

/* ------------------------------------------------------------------ */
/* Load data (config is shared with nothing else — it is singular)     */
/* ------------------------------------------------------------------ */
const config = require(path.join(ROOT, 'config', 'business.js'));
const { products: productList, categories } = require(
  path.join(ROOT, 'data', 'products.js')
);
const galleryItems = require(path.join(ROOT, 'data', 'gallery.js'));

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatPrice = (price) =>
  price === null || price === undefined
    ? 'Price on Request'
    : '₹' + Number(price).toLocaleString('en-IN');

const priceAttr = (price) => (price === null ? '' : String(price));

const availabilityLabel = {
  'in-stock': 'In Stock',
  'made-to-order': 'Made to Order',
  'out-of-stock': 'Out of Stock',
};

const availabilityBadge = {
  'in-stock': 'badge--in-stock',
  'made-to-order': 'badge--made-to-order',
  'out-of-stock': 'badge--out-of-stock',
};

const WHATSAPP_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.92-4.45 9.92-9.92C21.96 6.45 17.5 2 12.04 2zm0 18.13c-1.49 0-2.95-.4-4.22-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24zm4.53-6.17c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.55.12-.17.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.41-.42-.55-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z"/>
  </svg>`;

/** Social link placeholder or real link from config. */
function buildSocialLinks(prefix) {
  const socials = [
    { key: 'instagram', label: 'Instagram', icon: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.58 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.53.01-4.78.07-1.08.05-1.67.23-2.06.38-.52.2-.89.44-1.28.83-.39.39-.63.76-.83 1.28-.15.39-.33.98-.38 2.06-.06 1.25-.07 1.63-.07 4.78s.01 3.53.07 4.78c.05 1.08.23 1.67.38 2.06.2.52.44.89.83 1.28.39.39.76.63 1.28.83.39.15.98.33 2.06.38 1.25.06 1.63.07 4.78.07s3.53-.01 4.78-.07c1.08-.05 1.67-.23 2.06-.38.52-.2.89-.44 1.28-.83.39-.39.63-.76.83-1.28.15-.39.33-.98.38-2.06.06-1.25.07-1.63.07-4.78s-.01-3.53-.07-4.78c-.05-1.08-.23-1.67-.38-2.06a3.44 3.44 0 0 0-.83-1.28 3.44 3.44 0 0 0-1.28-.83c-.39-.15-.98-.33-2.06-.38C15.53 4.01 15.15 4 12 4zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28zm5.15-2.97a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>' },
    { key: 'facebook', label: 'Facebook', icon: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7h2.4l.36-2.8H13.5V9.4c0-.81.22-1.36 1.39-1.36h1.48V5.55c-.26-.03-1.14-.11-2.17-.11-2.14 0-3.6 1.3-3.6 3.7v2.06H8.2V14h2.4v7h2.9z"/></svg>' },
    { key: 'pinterest', label: 'Pinterest', icon: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.64 19.32c-.08-.82-.16-2.09.03-2.99.17-.8 1.12-5.1 1.12-5.1s-.29-.57-.29-1.42c0-1.33.77-2.32 1.73-2.32.82 0 1.21.61 1.21 1.35 0 .82-.53 2.05-.8 3.19-.23.95.48 1.73 1.42 1.73 1.7 0 3.01-1.8 3.01-4.39 0-2.3-1.65-3.9-4-3.9a4.15 4.15 0 0 0-4.33 4.16c0 .82.32 1.7.71 2.18.08.1.09.18.07.28l-.27 1.08c-.04.18-.14.22-.33.13-1.23-.57-2-2.36-2-3.8 0-3.09 2.24-5.93 6.47-5.93 3.4 0 6.04 2.42 6.04 5.66 0 3.38-2.13 6.1-5.09 6.1-.99 0-1.93-.52-2.25-1.12l-.61 2.32c-.22.85-.82 1.92-1.22 2.57A10 10 0 1 0 12 2z"/></svg>' },
  ];

  return socials
    .map((s) => {
      const url = (config.social && config.social[s.key]) || '';
      if (url) {
        return `<a href="${url}" target="_blank" rel="noopener" aria-label="${s.label}">${s.icon}</a>`;
      }
      // Placeholder that explains where to add the real link
      return `<a href="#social-placeholder" aria-label="${s.label} (add link in config/business.js)" title="Add your ${s.label} link in config/business.js" onclick="event.preventDefault();alert('Add your ${s.label} URL in config/business.js, then rebuild.');">${s.icon}</a>`;
    })
    .join('');
}

/* ------------------------------------------------------------------ */
/* Page assembly                                                       */
/* ------------------------------------------------------------------ */
function readPartial(name) {
  return fs.readFileSync(path.join(SRC, 'partials', name), 'utf8');
}

function renderPage({ page, meta, prefix }) {
  const head = readPartial('head.html');
  const header = readPartial('header.html');
  const footer = readPartial('footer.html');

  const active = (key) =>
    meta.active === key ? ' aria-current="page"' : '';

  const configJson = JSON.stringify(
    {
      name: config.name,
      whatsappNumber: config.whatsappNumber,
      phone: config.phone,
      email: config.email,
      address: config.address,
      hours: config.hours,
    },
    null,
    2
  );

  const canonical = `${config.siteUrl.replace(/\/$/, '')}/${meta.canonical ||
    'index.html'}`;
  const ogImage = `${config.siteUrl.replace(/\/$/, '')}/assets/images/og-default.png`;

  const hoursSummary = config.hours
    .map((h) => `${h.days}: ${h.time}`)
    .join(' · ');

  let html = head
    .replaceAll('{{TITLE}}', escapeHtml(meta.title))
    .replaceAll('{{DESCRIPTION}}', escapeHtml(meta.description))
    .replaceAll('{{BUSINESS_NAME}}', escapeHtml(config.name))
    .replaceAll('{{CANONICAL}}', escapeHtml(canonical))
    .replaceAll('{{OG_IMAGE}}', escapeHtml(ogImage))
    .replaceAll('{{PREFIX}}', prefix)
    .replace('{{CONFIG_JSON}}', configJson);

  html += header
    .replaceAll('{{BUSINESS_NAME}}', escapeHtml(config.name))
    .replaceAll('{{PREFIX}}', prefix)
    .replaceAll('{{WHATSAPP_ICON}}', WHATSAPP_ICON)
    .replace('{{ACTIVE_HOME}}', active('home'))
    .replace('{{ACTIVE_COLLECTION}}', active('collection'))
    .replace('{{ACTIVE_ABOUT}}', active('about'))
    .replace('{{ACTIVE_GALLERY}}', active('gallery'))
    .replace('{{ACTIVE_CONTACT}}', active('contact'));

  html += page;

  html += footer
    .replaceAll('{{BUSINESS_NAME}}', escapeHtml(config.name))
    .replaceAll('{{PREFIX}}', prefix)
    .replaceAll('{{WHATSAPP_ICON}}', WHATSAPP_ICON)
    .replaceAll('{{TAGLINE}}', escapeHtml(config.tagline))
    .replace('{{SOCIAL_LINKS}}', buildSocialLinks(prefix))
    .replace('{{PAGE_SCRIPTS}}', meta.pageScript || '');

  // Contact page tokens (kept here so pages can use them too)
  html = html
    .replaceAll('{{PHONE}}', escapeHtml(config.phone))
    .replaceAll('{{EMAIL}}', escapeHtml(config.email))
    .replaceAll('{{ADDRESS}}', escapeHtml(config.address))
    .replaceAll('{{HOURS}}', hoursSummary)
    .replaceAll('{{HOURS_SUMMARY}}', escapeHtml(hoursSummary));

  return html;
}

/* ------------------------------------------------------------------ */
/* Component builders (product card, detail page, gallery item)        */
/* ------------------------------------------------------------------ */
function buildProductCard(p, prefix) {
  const badge =
    (config.developmentMode ? '<span class="product-card__badge badge--sample badge--sample-dev">Sample</span>' : '') +
    `<span class="product-card__badge ${availabilityBadge[p.availability]}">${availabilityLabel[p.availability] ||
      p.availability}</span>`;

  const price =
    p.price === null
      ? '<span class="product-card__price">Price on Request</span>'
      : `<span class="product-card__price">${formatPrice(p.price)}</span>`;

  const detailHref = `${prefix}products/${p.slug}.html`;

  return `
<article class="product-card" data-product-card
  data-name="${escapeHtml(p.name)}"
  data-category="${escapeHtml(p.category)}"
  data-fabric="${escapeHtml(p.fabric)}"
  data-color="${escapeHtml(p.color)}"
  data-price="${priceAttr(p.price)}"
  data-availability="${p.availability}">
  <div class="product-card__media">
    ${badge}
    <a href="${detailHref}" tabindex="-1" aria-hidden="true">
      <img src="${prefix}assets/images/products/${p.images[0]}" alt="${escapeHtml(p.name)} — ${escapeHtml(p.blurb)}" loading="lazy" width="600" height="750">
    </a>
    <div class="product-card__overlay">
      <a class="btn btn--gold-deep btn--sm" href="${detailHref}">View Details</a>
    </div>
  </div>
  <div class="product-card__body">
    <span class="product-card__category">${escapeHtml(p.category)} · ${escapeHtml(p.fabric)}</span>
    <h3 class="product-card__name"><a href="${detailHref}">${escapeHtml(p.name)}</a></h3>
    <p class="product-card__blurb">${escapeHtml(p.blurb)}</p>
    <div class="product-card__meta">
      ${price}
      <span class="product-card__availability"><span class="status-dot status-dot--${p.availability}"></span>${availabilityLabel[p.availability] || escapeHtml(p.availability)}</span>
    </div>
    <div class="product-card__actions">
      <a class="btn btn--outline-dark btn--sm" href="${detailHref}">View Details</a>
      <a class="btn btn--whatsapp btn--sm" href="#" data-wa="product" data-wa-product="${escapeHtml(p.name)}">${WHATSAPP_ICON} Order</a>
    </div>
  </div>
</article>`;
}

function buildProductCards(list, prefix) {
  return list.map((p) => buildProductCard(p, prefix)).join('\n');
}

function buildProductPage(p, prefix) {
  const price =
    p.price === null
      ? '<div class="product-detail__price">Price on Request</div><p class="form__hint">Send us a WhatsApp message and we will gladly share the price and details.</p>'
      : `<div class="product-detail__price">${formatPrice(p.price)}</div>`;

  const thumbs = p.images
    .map(
      (img, i) => `
      <button type="button" data-product-thumb aria-label="View image ${i + 1} of ${escapeHtml(p.name)}" ${i === 0 ? 'aria-current="true"' : ''}>
        <img src="${prefix}assets/images/products/${img}" alt="" loading="lazy" width="200" height="250">
      </button>`
    )
    .join('');

  const sampleNote =
    config.developmentMode
      ? `<p class="product-detail__note" style="background:rgba(201,138,46,.1);border:1px dashed rgba(201,138,46,.5);border-radius:8px;padding:.75rem 1rem;">Sample product for development. Images and description will be replaced with the real saree.</p>`
      : '';

  return `
<section class="section">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${prefix}index.html">Home</a>
      <span class="breadcrumbs__sep">/</span>
      <a href="${prefix}collection.html">Collection</a>
      <span class="breadcrumbs__sep">/</span>
      <span>${escapeHtml(p.name)}</span>
    </nav>
  </div>
</section>

<section class="section" style="padding-top:1.5rem">
  <div class="container">
    <div class="product-detail">
      <div class="product-detail__gallery">
        <div class="product-detail__main" data-product-main>
          <img src="${prefix}assets/images/products/${p.images[0]}" alt="${escapeHtml(p.name)} — large image" width="800" height="1000">
        </div>
        ${p.images.length > 1 ? `<div class="product-detail__thumbs">${thumbs}</div>` : ''}
      </div>

      <div class="product-detail__info">
        <span class="eyebrow">${escapeHtml(p.category)}</span>
        <h1 class="product-detail__name">${escapeHtml(p.name)}</h1>
        ${price}
        <dl class="meta-list product-detail__meta">
          <div><dt>Fabric</dt><dd>${escapeHtml(p.fabric)}</dd></div>
          <div><dt>Colour</dt><dd>${escapeHtml(p.color)}</dd></div>
          <div><dt>Category</dt><dd>${escapeHtml(p.category)}</dd></div>
          <div><dt>Availability</dt><dd><span class="status-dot status-dot--${p.availability}"></span>${availabilityLabel[p.availability] || escapeHtml(p.availability)}</dd></div>
        </dl>
        <div class="product-detail__desc">
          ${escapeHtml(p.description).replace(/\n/g, '<br>')}
        </div>
        ${sampleNote}
        <div class="product-detail__actions">
          <a class="btn btn--whatsapp" href="#" data-wa="product" data-wa-product="${escapeHtml(p.name)}">${WHATSAPP_ICON} Order on WhatsApp</a>
          <a class="btn btn--outline-dark" href="${prefix}collection.html">Browse the Collection</a>
        </div>
        <p class="product-detail__note">Questions about this saree? Message us on WhatsApp and we will reply personally.</p>
      </div>
    </div>
  </div>
</section>`;
}

function buildGalleryItem(item, prefix) {
  return `
<button type="button" class="gallery-item" data-lightbox data-full="${prefix}assets/images/gallery/${item.src}" data-caption="${escapeHtml(item.caption)}" aria-label="View ${escapeHtml(item.caption)} in full size">
  <img src="${prefix}assets/images/gallery/${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" width="600" height="600">
  <span class="gallery-item__caption">${escapeHtml(item.caption)}</span>
</button>`;
}

/* ------------------------------------------------------------------ */
/* Page meta                                                            */
/* ------------------------------------------------------------------ */
const meta = {
  home: {
    title: 'Havilah Sarees — Handloom Sarees Crafted with Timeless Artistry',
    description:
      'Discover handloom sarees crafted with timeless artistry, authentic textures, and the beauty of Indian tradition. Browse the collection, order on WhatsApp.',
    active: 'home',
    canonical: 'index.html',
  },
  collection: {
    title: 'Collection — Havilah Sarees',
    description:
      'Browse the handloom saree collection by category, fabric, colour and price. Order any saree directly on WhatsApp.',
    active: 'collection',
    canonical: 'collection.html',
    pageScript:
      '<script src="./assets/js/collection.js"></script>',
  },
  about: {
    title: 'About Us — Havilah Sarees',
    description:
      'Havilah Sarees is a family-led handloom saree business focused on quality, craftsmanship and warm personal service.',
    active: 'about',
    canonical: 'about.html',
  },
  gallery: {
    title: 'Gallery — Havilah Sarees',
    description:
      'A glimpse of the handloom artistry at Havilah Sarees. View fabrics, weaves and festive drapes.',
    active: 'gallery',
    canonical: 'gallery.html',
    pageScript:
      '<script src="./assets/js/gallery.js"></script>',
  },
  contact: {
    title: 'Contact — Havilah Sarees',
    description:
      'Get in touch with Havilah Sarees. Phone, WhatsApp, email and an enquiry form with no account required.',
    active: 'contact',
    canonical: 'contact.html',
    pageScript:
      '<script src="./assets/js/contact.js"></script>',
  },
  '404': {
    title: 'Page Not Found — Havilah Sarees',
    description:
      'The page you are looking for could not be found on the Havilah Sarees website.',
    active: '',
    canonical: '404.html',
  },
};

/* ------------------------------------------------------------------ */
/* Build                                                                */
/* ------------------------------------------------------------------ */
function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  /* 1) Static pages ------------------------------------------------- */
  const pageFiles = ['index.html', 'about.html', 'contact.html', '404.html'];

  for (const file of pageFiles) {
    const pagePath = path.join(SRC, 'pages', file);
    if (!fs.existsSync(pagePath)) continue;
    let content = fs.readFileSync(pagePath, 'utf8');
    const key = file.replace('.html', '');

    // Home page: featured product cards
    if (key === 'index') {
      const featured = buildProductCards(productList.filter((p) => p.featured), './');
      content = content.replace('{{FEATURED_CARDS}}', featured);
    }

    const html = renderPage({
      page: content,
      meta: meta[key] || meta.home,
      prefix: './',
    });
    fs.writeFileSync(path.join(DIST, file), html);
    console.log('built', file);
  }

  /* 2) Collection page — inject cards & filter options -------------- */
  const cardHtml = buildProductCards(productList, './');
  const categoryOptions = categories
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join('');
  const fabricOptions = [...new Set(productList.map((p) => p.fabric))]
    .sort()
    .map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`)
    .join('');
  const colourOptions = [...new Set(productList.map((p) => p.color))]
    .sort()
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join('');

  const collectionPage = fs.readFileSync(path.join(SRC, 'pages', 'collection.html'), 'utf8');

  const sampleBanner = config.developmentMode
    ? `<div class="notice"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg><div><strong>Development notice:</strong> the sarees below are sample products for testing only and are not real inventory. This notice disappears automatically when you add your real catalogue (set <code>developmentMode: false</code> in config/business.js).</div></div>`
    : '';

  const collectionHtml = renderPage({
    page: collectionPage,
    meta: meta.collection,
    prefix: './',
  })
    .replace('{{PRODUCT_CARDS}}', cardHtml)
    .replace('{{CATEGORY_OPTIONS}}', categoryOptions)
    .replace('{{FABRIC_OPTIONS}}', fabricOptions)
    .replace('{{COLOUR_OPTIONS}}', colourOptions)
    .replace('{{SAMPLE_BANNER}}', sampleBanner);
  fs.writeFileSync(path.join(DIST, 'collection.html'), collectionHtml);
  console.log('built collection.html (with products)');

  /* 3) Product detail pages ------------------------------------------ */
  const productTemplate = fs.readFileSync(path.join(SRC, 'pages', 'product.html'), 'utf8');
  for (const p of productList) {
    const html = renderPage({
      page: productTemplate.replace('{{PRODUCT}}', buildProductPage(p, '../')),
      meta: {
        title: `${p.name} — Havilah Sarees`,
        description: `${p.blurb} ${p.fabric} · ${p.category}. Order on WhatsApp.`,
        active: 'collection',
        canonical: `products/${p.slug}.html`,
        pageScript:
          '<script src="../assets/js/product-detail.js"></script>',
      },
      prefix: '../',
    });
    const dir = path.join(DIST, 'products');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${p.slug}.html`), html);
    console.log('built products/' + p.slug + '.html');
  }

  /* 4) Gallery page — inject items ----------------------------------- */
  const galleryPage = fs.readFileSync(path.join(SRC, 'pages', 'gallery.html'), 'utf8');
  const galleryHtml = renderPage({
    page: galleryPage,
    meta: meta.gallery,
    prefix: './',
  }).replace('{{GALLERY_ITEMS}}', galleryItems.map((g) => buildGalleryItem(g, './')).join('\n'));
  fs.writeFileSync(path.join(DIST, 'gallery.html'), galleryHtml);
  console.log('built gallery.html (with images)');

  /* 5) Assets & SEO --------------------------------------------------- */
  fs.cpSync(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });

  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + config.siteUrl.replace(/\/$/, '') + '/sitemap.xml\n'
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${config.siteUrl}/</loc></url>
  <url><loc>${config.siteUrl}/collection.html</loc></url>
  <url><loc>${config.siteUrl}/about.html</loc></url>
  <url><loc>${config.siteUrl}/gallery.html</loc></url>
  <url><loc>${config.siteUrl}/contact.html</loc></url>
  ${productList.map((p) => `  <url><loc>${config.siteUrl}/products/${p.slug}.html</loc></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
  console.log('built robots.txt, sitemap.xml');

  console.log('\n✔ Site built successfully into dist/');
}

build();