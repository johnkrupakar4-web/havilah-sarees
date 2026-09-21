/**
 * Havilah Sarees — contact / enquiry form.
 *
 * There is no backend server, so the form opens WhatsApp with the enquiry
 * pre-filled (or falls back to a mailto link). No data is submitted to any
 * server; the customer simply sends their message from WhatsApp or email.
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  var fields = {
    name: form.querySelector('#name'),
    phone: form.querySelector('#phone'),
    email: form.querySelector('#email'),
    interest: form.querySelector('#interest'),
    message: form.querySelector('#message'),
  };

  var status = document.querySelector('[data-form-status]');

  function setStatus(kind, message) {
    status.className = 'form__status is-visible form__status--' + kind;
    status.textContent = message;
    status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  }

  function clearStatus() {
    status.className = 'form__status';
    status.textContent = '';
  }

  function setError(name, on) {
    var wrap = fields[name].closest('.form__field');
    if (wrap) wrap.classList.toggle('has-error', on);
    return on;
  }

  function showErrors() {
    clearStatus();
    var ok = true;
    var errs = [];

    if (!fields.name.value.trim()) {
      setError('name', true);
      errs.push('Please tell us your name.');
      ok = false;
    }

    var emailOk = !fields.email.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value);
    if (!emailOk) {
      setError('email', true);
      errs.push('That email address does not look right.');
      ok = false;
    }

    var phoneOk = !fields.phone.value || /^[0-9+\-\s()]{7,}$/.test(fields.phone.value);
    if (!phoneOk) {
      setError('phone', true);
      errs.push('That phone number does not look right.');
      ok = false;
    }

    if (!fields.message.value.trim()) {
      setError('message', true);
      errs.push('Please write your message or question.');
      ok = false;
    }

    if (errs.length && status) {
      setStatus('error', errs[0]);
    }
    return ok;
  }

  // Clear a field's error state once the user starts typing in it
  Object.keys(fields).forEach(function (k) {
    fields[k].addEventListener('input', function () {
      setError(k, false);
    });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!showErrors()) return;

    if (window.HavilahWhatsApp) {
      window.HavilahWhatsApp.contactFormEnquiry({
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        interest: fields.interest.value,
        message: fields.message.value.trim(),
      });
    }
    setStatus(
      'success',
      'Thank you, ' + fields.name.value.trim().split(' ')[0] +
      '! Your message is being prepared in WhatsApp — just press send there. ' +
      'If WhatsApp has not opened, please check your number or email us at ' +
      (window.HAVILAH_CONFIG && window.HAVILAH_CONFIG.email ? window.HAVILAH_CONFIG.email : 'our support address') + '.'
    );
    form.reset();
  });
})();