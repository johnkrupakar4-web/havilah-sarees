/**
 * Havilah Sarees — product catalogue.
 *
 * These are SAMPLE products included only for development and design
 * purposes. They are NOT real inventory. Replace the array contents with
 * real sarees as they become available. The website renders the complete
 * Collection page and every product detail page automatically from this
 * single file — you do not need to touch the HTML pages.
 *
 * A product entry looks like this:
 *
 * {
 *   slug:        'kanjivaram-silk-saree',        // unique, lower-case, hyphens
 *   name:        'Kanjivaram Silk Saree',
 *   category:    'Kanjivaram Silk',
 *   fabric:      'Pure Silk',
 *   color:       'Deep Maroon',
 *   price:       12500,                          // INR. Use null for "Price on Request"
 *   availability:'in-stock',                     // 'in-stock' | 'made-to-order' | 'out-of-stock'
 *   blurb:       'A short line shown on the Collection card.',
 *   description: 'A longer paragraph shown on the product detail page.',
 *   images:      ['product-1.png', 'product-2.png'],  // files inside assets/images/products/
 *   featured:    true,                           // shows on the Home page
 * }
 */

// Keep sample data clearly separated so it is easy to delete later.
module.exports = {
  sampleNotice: 'Sample products shown for development only.',

  categories: [
    'Kanjivaram Silk',
    'Banarasi Silk',
    'Handloom Cotton',
    'Kalamkari',
    'Ikat',
    'Tussar Silk',
    'Organza',
  ],

  products: [
    {
      slug: 'kanjivaram-silk-saree',
      name: 'Kanjivaram Silk Saree',
      category: 'Kanjivaram Silk',
      fabric: 'Pure Silk',
      color: 'Deep Maroon',
      price: 12500,
      availability: 'in-stock',
      blurb: 'A classic festive weave with a rich, textured body.',
      description:
        'A classic handloom weave known for its lustre and durability. This sample entry demonstrates the Kanjivaram category — replace with the real piece, its genuine description, and photographs.',
      images: ['product-1.png', 'product-2.png'],
      featured: true,
    },
    {
      slug: 'banarasi-silk-saree',
      name: 'Banarasi Silk Saree',
      category: 'Banarasi Silk',
      fabric: 'Pure Silk',
      color: 'Midnight Blue',
      price: 9800,
      availability: 'in-stock',
      blurb: 'An ornate zari-touched drape for festive evenings.',
      description:
        'A richly patterned handloom weave. This sample entry demonstrates the Banarasi category — replace with the real piece, its genuine description, and photographs.',
      images: ['product-3.png', 'product-4.png'],
      featured: true,
    },
    {
      slug: 'handloom-cotton-saree',
      name: 'Handloom Cotton Saree',
      category: 'Handloom Cotton',
      fabric: 'Pure Cotton',
      color: 'Indigo',
      price: 2400,
      availability: 'in-stock',
      blurb: 'Lightweight breathable weave for everyday elegance.',
      description:
        'A soft, airy every-day handloom cotton weave. This sample entry demonstrates the Handloom Cotton category — replace with the real piece, its genuine description, and photographs.',
      images: ['product-5.png'],
      featured: true,
    },
    {
      slug: 'kalamkari-cotton-saree',
      name: 'Kalamkari Cotton Saree',
      category: 'Kalamkari',
      fabric: 'Pure Cotton',
      color: 'Rust & Natural',
      price: 3200,
      availability: 'in-stock',
      blurb: 'Hand-drawn artistry on a gentle cotton base.',
      description:
        'A hand-printed cotton weave. This sample entry demonstrates the Kalamkari category — replace with the real piece, its genuine description, and photographs.',
      images: ['product-6.png'],
      featured: false,
    },
    {
      slug: 'ikat-handloom-saree',
      name: 'Ikat Handloom Saree',
      category: 'Ikat',
      fabric: 'Cotton Silk',
      color: 'Terracotta',
      price: null,
      availability: 'made-to-order',
      blurb: 'Resist-dyed geometric patterns, woven by hand.',
      description:
        'A resist-dyed handloom weave produced to order. Price is currently on request. This sample entry demonstrates the Ikat category and the "made-to-order" availability state.',
      images: ['product-7.png'],
      featured: false,
    },
    {
      slug: 'tussar-silk-saree',
      name: 'Tussar Silk Saree',
      category: 'Tussar Silk',
      fabric: 'Tussar Silk',
      color: 'Mustard',
      price: 5600,
      availability: 'in-stock',
      blurb: 'A textured natural silk with a soft matte drape.',
      description:
        'A natural silk weave with characterful texture. This sample entry demonstrates the Tussar Silk category — replace with the real piece, its genuine description, and photographs.',
      images: ['product-8.png'],
      featured: true,
    },
    {
      slug: 'organza-handloom-saree',
      name: 'Organza Handloom Saree',
      category: 'Organza',
      fabric: 'Pure Silk Organza',
      color: 'Powder Blush',
      price: 6800,
      availability: 'in-stock',
      blurb: 'A translucent, feather-light weave for special days.',
      description:
        'A light, translucent silk organza weave. This sample entry demonstrates the Organza category — replace with the real piece, its genuine description, and photographs.',
      images: ['product-9.png'],
      featured: false,
    },
    {
      slug: 'festive-kanjivaram-saree',
      name: 'Festive Kanjivaram Saree',
      category: 'Kanjivaram Silk',
      fabric: 'Pure Silk',
      color: 'Emerald',
      price: null,
      availability: 'out-of-stock',
      blurb: 'A celebratory drape currently being rewoven.',
      description:
        'A festive handloom weave currently out of stock while a fresh piece is being woven — enquire on WhatsApp for revival timelines. This sample entry demonstrates the "out-of-stock" availability state.',
      images: ['product-10.png'],
      featured: false,
    },
  ],
};