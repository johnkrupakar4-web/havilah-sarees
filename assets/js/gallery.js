/**
 * Havilah Sarees — Gallery lightbox.
 * Accessible: opens via buttons, closes on Escape/backdrop, arrow-key nav.
 */
(function () {
  'use strict';

  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var lb = document.querySelector('[data-lightbox-dialog]');
  if (!lb || items.length === 0) return;

  var img = lb.querySelector('[data-lightbox-img]');
  var caption = lb.querySelector('[data-lightbox-caption]');
  var closeBtn = lb.querySelector('[data-lightbox-close]');
  var prevBtn = lb.querySelector('[data-lightbox-prev]');
  var nextBtn = lb.querySelector('[data-lightbox-next]');
  var current = 0;
  var lastFocused = null;

  function srcAt(i) {
    return items[i].querySelector('img').getAttribute('src');
  }
  function fullSrcAt(i) {
    return items[i].getAttribute('data-full') || srcAt(i);
  }
  function altAt(i) {
    return items[i].querySelector('img').getAttribute('alt') || '';
  }
  function captionAt(i) {
    return items[i].getAttribute('data-caption') || '';
  }

  function show(i) {
    current = (i + items.length) % items.length;
    img.setAttribute('src', fullSrcAt(current));
    img.setAttribute('alt', altAt(current));
    caption.textContent = captionAt(current);
  }

  function open(i) {
    lastFocused = document.activeElement;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    show(i);
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () {
      open(i);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });

  // Close on backdrop click
  lb.addEventListener('click', function (ev) {
    if (ev.target === lb || ev.target === img) close();
  });

  // Keyboard
  lb.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') close();
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); show(current - 1); }
    if (ev.key === 'ArrowRight') { ev.preventDefault(); show(current + 1); }
    if (ev.key === 'Tab') {
      // Keep focus within the dialog
      var focusables = [prevBtn, img, closeBtn, nextBtn];
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  });
})();