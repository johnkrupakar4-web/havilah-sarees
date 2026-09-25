/**
 * Havilah Sarees — central business configuration.
 *
 * IMPORTANT
 * ---------
 * This is the ONE place to change business details. Everything on the
 * website (WhatsApp buttons, contact page, footer, SEO meta tags) is
 * generated from these values.
 *
 * Replace the placeholders below with the real business information.
 */

module.exports = {
  /* ---------- Core brand ---------- */
  name: 'Havilah Sarees',
  tagline: 'Tradition Woven Into Every Thread',
  description:
    'Discover handloom sarees crafted with timeless artistry, authentic textures, and the beauty of Indian tradition.',

  /* ---------- WhatsApp ordering ---------- */
  // NOTE: Use the full international number WITHOUT the "+" or any spaces.
  // Example: "919876543210" for +91 98765 43210
  whatsappNumber: 'REPLACE_WITH_REAL_NUMBER', // <-- CHANGE ME

  /* ---------- Contact details (placeholders) ---------- */
  phone: '+91 00000 00000', // CHANGE ME
  email: 'hello@havilahsarees.example', // CHANGE ME
  address: 'Your City, State, India', // CHANGE ME
  hours: [
    { days: 'Monday – Saturday', time: '10:00 AM – 7:00 PM' },
    { days: 'Sunday', time: 'Closed / by appointment' },
  ],

  /* ---------- Social media (leave empty to hide, then add real URLs) ---------- */
  social: {
    instagram: '',
    facebook: '',
    pinterest: '',
  },

  /* ---------- Website ---------- */
  // Used only for canonical URLs, Open Graph and the sitemap.
  // Example: 'https://www.havilahsarees.com'
  siteUrl: 'https://johnkrupakar4-web.github.io/havilah-sarees',

  /* ---------- Development-only notice ---------- */
  // Set to true while the site is under construction so sample products
  // are clearly labelled. Change to false when real inventory is added.
  developmentMode: true,
};