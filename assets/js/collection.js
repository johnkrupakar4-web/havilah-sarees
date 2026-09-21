/**
 * Havilah Sarees — Collection page filtering.
 *
 * Product cards are rendered in the HTML by the build script (good for SEO
 * and for users without JavaScript). This script simply shows / hides those
 * cards based on the selected filters and search text.
 */
(function () {
  'use strict';

  var bar = document.querySelector('[data-filter-bar]');
  if (!bar) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-product-card]'));
  var countEl = document.querySelector('[data-collection-count]');
  var emptyEl = document.querySelector('[data-collection-empty]');
  var form = document.querySelector('[data-filter-form]');
  var searchInput = form ? form.querySelector('[name="q"]') : null;

  /* ---------- Helpers ---------- */
  function param(name) {
    var p = new URLSearchParams(window.location.search);
    return (p.get(name) || '').trim();
  }

  function currentFilter() {
    var f = { category: '', fabric: '', color: '', price: '', availability: '', q: '' };
    if (form) {
      f.category = form.querySelector('[name="category"]').value;
      f.fabric = form.querySelector('[name="fabric"]').value;
      f.color = form.querySelector('[name="color"]').value;
      f.price = form.querySelector('[name="price"]').value;
      f.availability = form.querySelector('[name="availability"]').value;
    }
    f.q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    return f;
  }

  function priceRange(price) {
    if (price === null) return null; // Price on Request
    if (price < 3000) return 'under-3000';
    if (price < 6000) return '3000-6000';
    if (price < 10000) return '6000-10000';
    return 'above-10000';
  }

  function matches(card, f) {
    if (f.category && card.dataset.category !== f.category) return false;
    if (f.fabric && card.dataset.fabric !== f.fabric) return false;
    if (f.color && card.dataset.color !== f.color) return false;
    if (f.price) {
      var range = priceRange(
        card.dataset.price === '' ? null : Number(card.dataset.price)
      );
      if (range !== f.price) return false;
    }
    if (f.availability && card.dataset.availability !== f.availability) return false;
    if (f.q) {
      var hay = (
        card.dataset.name + ' ' +
        card.dataset.category + ' ' +
        card.dataset.fabric + ' ' +
        card.dataset.color
      ).toLowerCase();
      if (hay.indexOf(f.q) === -1) return false;
    }
    return true;
  }

  function apply() {
    var f = currentFilter();
    var visible = 0;
    cards.forEach(function (card) {
      var show = matches(card, f);
      card.hidden = !show;
      if (show) visible++;
    });
    if (countEl) {
      countEl.textContent = visible === 1
        ? '1 saree found'
        : visible + ' sarees found';
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  /* ---------- Events ---------- */
  form.addEventListener('change', apply);
  if (searchInput) {
    var timer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 200);
    });
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    apply();
  });

  /* Cleaner button */
  var clearBtn = form.querySelector('[data-filter-clear]');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      form.reset();
      if (searchInput) searchInput.value = '';
      apply();
      searchInput && searchInput.focus();
    });
  }

  // Remove price selection when "Price on Request" — keep simple; just reset price if it can't match.
  /* (Price filters intentionally hide "Price on Request" cards, since those
     have no listed price. This is documented in the filter UI.) */

  /* ---------- Initial state from URL ---------- */
  if (searchInput && param('q')) {
    searchInput.value = param('q');
  }
  var cat = param('category');
  if (cat && form.querySelector('[name="category"]')) {
    form.querySelector('[name="category"]').value = cat;
  }

  apply();
})();