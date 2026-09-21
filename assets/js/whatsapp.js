/**
 * Havilah Sarees — WhatsApp helpers.
 *
 * Everything WhatsApp-related lives here. The phone number and business
 * details are read from config/business.js (injected into each page as
 * window.HAVILAH_CONFIG by the build script), so you change them in ONE
 * place only.
 */

(function () {
  'use strict';

  var config = window.HAVILAH_CONFIG || {};

  /** True when a real number has been configured (placeholder otherwise). */
  function hasRealNumber() {
    var num = (config.whatsappNumber || '').toString().trim();
    return num !== '' && !/REPLACE_WITH_REAL_NUMBER|XXXXX/i.test(num);
  }

  /** Build a wa.me link for a given message. */
  function buildLink(message) {
    var num = (config.whatsappNumber || '').toString().replace(/\D/g, '');
    var text = encodeURIComponent(message);
    return 'https://wa.me/' + num + '?text=' + text;
  }

  /** Warn the owner when the placeholder number is still in use. */
  function placeholderNotice() {
    var msg =
      'The WhatsApp number has not been set up yet.\n\n' +
      'Open config/business.js and replace\n' +
      '  whatsappNumber: "REPLACE_WITH_REAL_NUMBER"\n' +
      'with the real business number, then rebuild the site.';
    if (window.confirm(msg)) {
      window.open('https://www.whatsapp.com/', '_blank', 'noopener');
    }
  }

  /** Open WhatsApp with a composed message. */
  function openWhatsApp(message) {
    if (!hasRealNumber()) {
      placeholderNotice();
      return;
    }
    window.open(buildLink(message), '_blank', 'noopener');
  }

  /** General enquiry, e.g. "I have a question". */
  function generalEnquiry(extra) {
    var msg = 'Hello ' + config.name + '! I would like to know more about your handloom sarees.';
    if (extra) msg += '\n\n' + extra;
    openWhatsApp(msg);
  }

  /** Enquiry for a specific product (uses the product name). */
  function productEnquiry(productName) {
    var msg =
      'Hello ' + config.name + '!\n\n' +
      'I would like to enquire about the following saree:\n' +
      '• ' + productName;
    openWhatsApp(msg);
  }

  /** Enquiry about the whole collection. */
  function collectionEnquiry() {
    var msg =
      'Hello ' + config.name + '!\n\n' +
      'Could you share the latest collection of handloom sarees and their prices?';
    openWhatsApp(msg);
  }

  /** Enquiry from the contact form (validated fields). */
  function contactFormEnquiry(data) {
    var msg =
      'Hello ' + config.name + '!\n\n' +
      'New enquiry from your website:\n' +
      '—\n' +
      'Name: ' + data.name + '\n' +
      'Phone: ' + (data.phone || 'not provided') + '\n' +
      'Email: ' + (data.email || 'not provided') + '\n' +
      (data.interest ? 'Interested in: ' + data.interest + '\n' : '') +
      '—\n' +
      data.message;
    openWhatsApp(msg);
  }

  /** Expose the API. */
  window.HavilahWhatsApp = {
    hasRealNumber: hasRealNumber,
    buildLink: buildLink,
    generalEnquiry: generalEnquiry,
    productEnquiry: productEnquiry,
    collectionEnquiry: collectionEnquiry,
    contactFormEnquiry: contactFormEnquiry,
  };

  /**
   * Wire up declarative buttons: any element with [data-wa] attribute.
   * Supported values:
   *   data-wa="general"          → general enquiry
   *   data-wa="collection"       → collection enquiry
   *   data-wa="product"          → product enquiry (use data-wa-product="Name")
   */
  function wireButtons() {
    var buttons = document.querySelectorAll('[data-wa]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        var action = this.getAttribute('data-wa');
        if (action === 'product') {
          HavilahWhatsApp.productEnquiry(this.getAttribute('data-wa-product') || 'a saree');
        } else if (action === 'collection') {
          HavilahWhatsApp.collectionEnquiry();
        } else {
          HavilahWhatsApp.generalEnquiry();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }
})();