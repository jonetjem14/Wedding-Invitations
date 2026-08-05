// script.js — lightweight client-side RSVP handling
// Notes:
// - This script validates the form, shows an on-page toast, and stores the RSVP locally in localStorage.
// - For production collection, replace the placeholder endpoint with a server endpoint or Formspree/Netlify Forms integration.
// - To enable server collection, set FORMS_ENDPOINT to a valid POST URL and adjust the format.

(() => {
  const form = document.getElementById('rsvp-form');
  const toast = document.getElementById('toast');

  // Set this to a real endpoint if you want form submissions sent to a server.
  // Example: 'https://formspree.io/f/your-id' (Formspree) or your webhook URL.
  const FORMS_ENDPOINT = '';

  function showToast(message, timeout = 4000) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.hidden = true;
    }, timeout);
  }

  function validate(formData) {
    const name = formData.get('fullName')?.trim();
    const contact = formData.get('contact')?.trim();
    const total = Number(formData.get('total'));
    const attendance = formData.get('attendance');

    if (!name) return 'Please enter your full name.';
    if (!contact) return 'Please enter a contact number.';
    if (!total || total < 1) return 'Please indicate the total number of attendees (minimum 1).';
    if (!attendance) return 'Please choose whether you will attend.';
    return '';
  }

  function saveLocally(submission) {
    try {
      const key = 'wedding_rsvps';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({ ...submission, createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      // ignore localStorage errors
      console.warn('Could not save RSVP locally', e);
    }
  }

  async function sendToEndpoint(endpoint, submission) {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submission)
    });
    return resp;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const error = validate(fd);
    if (error) {
      showToast(error);
      return;
    }

    const submission = {
      fullName: fd.get('fullName').trim(),
      contact: fd.get('contact').trim(),
      total: Number(fd.get('total')),
      attendance: fd.get('attendance'),
      respondedAt: new Date().toISOString()
    };

    // Save locally (useful when there's no server)
    saveLocally(submission);

    // If an endpoint is configured, attempt to POST
    if (FORMS_ENDPOINT) {
      try {
        const res = await sendToEndpoint(FORMS_ENDPOINT, submission);
        if (!res.ok) {
          showToast('Submission saved locally. Server responded with an error.');
          console.error('Server response', res.status, await res.text());
        } else {
          showToast('Thank you — your RSVP was sent.');
          form.reset();
        }
      } catch (err) {
        showToast('Submission saved locally (network error).');
        console.error('Network error', err);
      }
    } else {
      showToast('Thank you — your RSVP was saved locally.');
      form.reset();
    }

    // Also log to console so you can paste results manually later (if needed)
    console.log('RSVP submission:', submission);
  });
})();
