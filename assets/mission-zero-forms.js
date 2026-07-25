(() => {
  'use strict';

  const ENDPOINT = 'https://beardlogistics-crm.netlify.app/.netlify/functions/submit-website-quote';

  function value(form, name) {
    const field = form.elements.namedItem(name);
    return field ? String(field.value || '').trim() : '';
  }

  function setStatus(form, message, isError = false) {
    let status = form.querySelector('[data-mission-zero-status]');
    if (!status) {
      status = document.createElement('p');
      status.setAttribute('data-mission-zero-status', '');
      status.setAttribute('role', 'status');
      status.style.marginTop = '14px';
      status.style.fontWeight = '700';
      form.appendChild(status);
    }
    status.textContent = message;
    status.style.color = isError ? '#b71920' : '#16794f';
  }

  function contactPayload(form) {
    const firstName = value(form, 'first-name');
    const lastName = value(form, 'last-name');
    return {
      source: 'beardlogistic.com/contact',
      form_name: 'contact-quote',
      customer_name: [firstName, lastName].filter(Boolean).join(' '),
      first_name: firstName,
      last_name: lastName,
      company_name: value(form, 'company'),
      customer_email: value(form, 'email'),
      customer_phone: value(form, 'phone'),
      service_type: value(form, 'service'),
      details: value(form, 'message'),
      message: value(form, 'message'),
      website: value(form, 'bot-field')
    };
  }

  function quotePayload(form) {
    return {
      source: 'beardlogistic.com/quote-request',
      form_name: 'quote-bot',
      customer_name: value(form, 'name'),
      company_name: value(form, 'company'),
      customer_email: value(form, 'email'),
      customer_phone: value(form, 'phone'),
      service_type: value(form, 'service'),
      ready_date: value(form, 'ready-date'),
      origin: value(form, 'pickup'),
      destination: value(form, 'delivery'),
      weight: value(form, 'weight'),
      dimensions: value(form, 'dimensions'),
      details: value(form, 'details'),
      message: value(form, 'details'),
      website: value(form, 'bot-field')
    };
  }

  async function submit(form, payload) {
    const button = form.querySelector('button[type="submit"]');
    const originalText = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }
    setStatus(form, 'Securely sending your request…');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Your request could not be sent.');

      const tracking = result.tracking_number || result.quote_tracking_number || '';
      const target = new URL('/thank-you.html', window.location.origin);
      if (tracking) target.searchParams.set('tracking', tracking);
      window.location.assign(target.toString());
    } catch (error) {
      console.error('Mission Zero form submission failed', error);
      setStatus(form, `${error.message || 'Your request could not be sent.'} Please call Operations at (225) 366-0169.`, true);
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  function connect(form, payloadBuilder) {
    if (!form || form.dataset.missionZeroConnected === 'true') return;
    form.dataset.missionZeroConnected = 'true';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      submit(form, payloadBuilder(form));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    connect(document.querySelector('form[name="contact-quote"]'), contactPayload);
    connect(document.querySelector('form[name="quote-bot"]'), quotePayload);
  });
})();
