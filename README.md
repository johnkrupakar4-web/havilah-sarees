# Havilah Sarees

Traditional Indian handloom craftsmanship presented through a modern,
elegant digital experience. Havilah Sarees is a handloom saree business
operated by a family. This is its complete website.

> **Tradition Woven Into Every Thread**

---

## About this project

A lightweight, dependency-free static website built for a small business:

- **6 pages** — Home, Collection, Product Details, About, Gallery, Contact
- **Zero runtime frameworks** — plain HTML, CSS and a little vanilla JS
- **Zero npm dependencies** — Node's built-in modules do everything
- **Static, SEO-friendly output** — every page (including each product page)
  is a real `.html` file, no JavaScript required to see the content
- **WhatsApp ordering** — all enquiries and orders route through WhatsApp;
  there is no payment gateway and no backend server
- **Fully responsive** — designed for 320px mobile up to wide desktop
- **Accessible** — semantic HTML, visible focus, keyboard navigation,
  descriptive alt text, ARIA where needed

---

## Technologies used

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Markup     | Semantic HTML5                                        |
| Styles     | Custom CSS (design tokens, no framework)              |
| Scripts    | Vanilla JavaScript (plain scripts, no bundler)        |
| Build      | Node.js + built-in `fs`/`path` (no npm packages)      |
| Fonts      | Google Fonts (Cormorant Garamond + Outfit)            |
| Images     | Generated local placeholders (PNG)                    |

---

## Project structure

```
HavilahSarees/
├── config/
│   └── business.js        ← ALL business info (WhatsApp no., phone, email…)
├── data/
│   ├── products.js        ← Product catalogue (add/edit sarees here)
│   └── gallery.js         ← Gallery image list & captions
├── src/
│   ├── partials/          ← Shared header/footer/head templates
│   │   ├── head.html
│   │   ├── header.html
│   │   └── footer.html
│   └── pages/             ← Page content templates
│       ├── index.html
│       ├── collection.html
│       ├── product.html
│       ├── about.html
│       ├── gallery.html
│       ├── contact.html
│       └── 404.html
├── assets/
│   ├── css/main.css       ← The whole design system
│   ├── js/                ← whatsapp.js, main.js, collection.js, …
│   ├── favicon.svg
│   └── images/
│       ├── logo.png            ← REPLACE with the real logo
│       ├── hero/               ← hero photography
│       ├── products/           ← product photos (product-1.png …)
│       ├── gallery/            ← gallery photos (gallery-1.png …)
│       ├── about/              ← story/about image
│       └── og-default.png      ← social share image
├── scripts/
│   ├── build.mjs          ← Generates the final site into dist/
│   ├── serve.mjs          ← Tiny local web server
│   ├── verify.mjs         ← Checks all links/images resolve (in CI too)
│   └── generate-placeholders.mjs  ← Creates the placeholder PNGs
└── dist/                  ← GENERATED output, never edited by hand
```

---

## How to run locally

You need **Node.js v18+** (no other install).

```bash
# 1) Build the site from sources
npm run build

# 2) Start a local server at http://localhost:8080
npm start
```

That's it. `npm start` rebuilds automatically, so after editing any file in
`config/`, `data/`, `src/` or `assets/`, just restart it (or run
`npm start` again). The site is plain static HTML, so you can also deploy
the `dist/` folder anywhere — Netlify, Vercel, GitHub Pages, nginx, Apache.

Prefer a one-liner?

```bash
npm start          # build + serve at http://localhost:8080
npm run build      # build only, output into dist/
npm run verify     # check for broken links/images
```

---

## Where to replace the logo

1. Save your real logo as `assets/images/logo.png`
   (square works best; it is shown as a 52×52px circle).
2. Run `npm run build` (or `npm start`) again.

The favicon is `assets/favicon.svg` (an inline "H" mark) — replace it with
your real favicon if you have one.

---

## Where to add product images

Drop the photos into `assets/images/products/` (product-1.png, product-2.png,
…). Then either:

- **Option A (recommended):** edit `data/products.js` so each product's
  `images` array lists the real filenames, then rebuild; or
- **Option B (simplest):** overwrite the existing `product-N.png` files with
  your real photos, keeping the filenames, then rebuild.

Gallery images live in `assets/images/gallery/` and are listed in
`data/gallery.js`. The home hero image is `assets/images/hero/hero-1.png`.

The current placeholder images are clearly generated placeholders (woven
diamond motifs) — they are **not** real photography and are labeled "Sample"
throughout the site while `developmentMode: true`.

---

## Where to change the WhatsApp number

Open **`config/business.js`** and change:

```js
whatsappNumber: 'REPLACE_WITH_REAL_NUMBER',
```

Use your full international number **without** `+` or spaces, e.g.
`919876543210` for `+91 98765 43210`. Rebuild with `npm run build`.

> While the placeholder number is in place, WhatsApp buttons will politely
> tell visitors the number is being configured, instead of opening a broken
> chat.

---

## Where to edit product information

Everything about products lives in **`data/products.js`** — names, prices,
categories, fabrics, colours, availability, descriptions, images. The
Collection page, its filters, and every product detail page are generated
automatically from this single file.

```js
{
  slug: 'kanjivaram-silk-saree',
  name: 'Kanjivaram Silk Saree',
  category: 'Kanjivaram Silk',
  fabric: 'Pure Silk',
  color: 'Deep Maroon',
  price: 12500,                  // INR. Use null for "Price on Request"
  availability: 'in-stock',      // 'in-stock' | 'made-to-order' | 'out-of-stock'
  blurb: 'Short card text.',
  description: 'Product page paragraph(s).',
  images: ['product-1.png', 'product-2.png'],
  featured: true,                // true = shown on the Home page
}
```

When your real catalogue is ready:

1. Replace the sample entries in `data/products.js` with real products.
2. Put real photos in `assets/images/products/`.
3. In `config/business.js` set `developmentMode: false` — the "Sample"
   badges and the development banner will disappear automatically.

---

## Where to change other contact details

All of these live in **`config/business.js`**:

- `phone`, `email`, `address`, `hours` → shown on the Contact page and footer
- `social.instagram / facebook / pinterest` → footer icons (leave empty to
  show a gentle "add your link" placeholder)
- `siteUrl` → used for canonical URLs, Open Graph and `sitemap.xml`

---

## Content honesty

The website makes **no** claims that could be false:

- Products are clearly marked as samples until real inventory is added
- No invented customer reviews, awards, certifications, sales figures,
  heritage claims or contact details
- `about.html` shares the family's love for handlooms honestly, without
  fabricated personal history
- Social links, phone, email and address are placeholders until you replace
  them in `config/business.js`

---

## WhatsApp workflows

All WhatsApp logic is centralized in `assets/js/whatsapp.js` and keyed off
`config/business.js`. Three reusable functions are exposed as
`window.HavilahWhatsApp`:

- `generalEnquiry()` — "Order on WhatsApp" buttons
- `productEnquiry(name)` — product cards & detail pages (message includes the
  product name)
- `collectionEnquiry()` — "ask about the collection" buttons
- `contactFormEnquiry(data)` — used by the validated contact form

Buttons are wired automatically via `data-wa` attributes, e.g.
`data-wa="product" data-wa-product="Kanjivaram Silk Saree"`.

---

## Contact form behaviour

There is no backend, and the site does **not** pretend there is one. When a
visitor submits the contact form:

1. Fields are validated (name, message required; phone/email format-checked).
2. The enquiry is composed and opened in **WhatsApp** pre-filled, ready to
   send.
3. A message explains exactly what happened and offers a `mailto:` fallback.

No data is transmitted to any server.

---

## Deployment

The `dist/` folder is a complete static site. Push the project to GitHub and
tie the repo to any static host, or upload `dist/` manually. Examples:

- **Netlify / Vercel:** build command `npm run build`, publish `dist`
- **GitHub Pages:** serve the `dist/` folder contents (either commit it or
  use a GitHub Action that runs `npm run build`)
- **Your own server:** copy `dist/` into your web root

Before going live, remember to update `config/business.js` (WhatsApp number,
contact details, `siteUrl`, and `developmentMode: false`) and replace the
logo + product photos.

---

## Contributing / maintenance

Working guidelines:

- Edit content in `src/pages/`, `config/business.js`, `data/` — never `dist/`
- Run `npm run build && npm run verify` before deploying
- Keep the design system inside `assets/css/main.css`; colours and type live
  in the `:root` design tokens at the top of the file

---

© Havilah Sarees. Handloom craftsmanship — **Tradition Woven Into Every
Thread**.