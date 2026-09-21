/**
 * Havilah Sarees — product detail page helper.
 * Swaps the main image when a thumbnail is clicked.
 */
(function () {
  'use strict';

  var main = document.querySelector('[data-product-main]');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-product-thumb]'));
  if (!main || thumbs.length === 0) return;

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () {
      var img = main.querySelector('img');
      var base = thumb.getAttribute('data-full');
      var thumbImg = thumb.querySelector('img');
      img.src = base || (thumbImg ? thumbImg.getAttribute('src') : img.src);
      img.alt = thumb.getAttribute('data-alt') ||
        (thumbImg ? thumbImg.getAttribute('alt') : img.alt);
      thumbs.forEach(function (t, j) {
        t.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
      thumb.focus();
    });
  });
})();