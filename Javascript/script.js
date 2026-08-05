// Small interactive helpers: lightbox for gallery and simple RSVP handling

document.addEventListener('DOMContentLoaded', function () {
  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.querySelector('.lb-image');
  const lbClose = document.querySelector('.lb-close');
  const thumbs = Array.from(document.querySelectorAll('.thumb'));

  function openLightbox(src, alt='') {
    lbImage.src = src;
    lbImage.alt = alt;
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
    lbImage.alt = '';
  }

  thumbs.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src || btn.querySelector('img').src;
      const alt = btn.querySelector('img').alt || '';
      openLightbox(src, alt);
    });
  });
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // RSVP form simple validation + localStorage (no backend)
  const form = document.getElementById('rsvpForm');
  const nameEl = document.getElementById('rsvpName');
  const emailEl = document.getElementById('rsvpEmail');
  const guestsEl = document.getElementById('rsvpGuests');
  const messageEl = document.getElementById('rsvpMessage');

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const guests = parseInt(guestsEl.value, 10) || 0;

    if (!name) {
      messageEl.textContent = 'Please enter your name.';
      nameEl.focus();
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      messageEl.textContent = 'Please enter a valid email address.';
      emailEl.focus();
      return;
    }

    // Save to localStorage as a lightweight "RSVP record"
    try {
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      stored.push({name, email, guests, time: new Date().toISOString()});
      localStorage.setItem('rsvps', JSON.stringify(stored));
    } catch (err) {
      // ignore storage errors
      console.warn('RSVP storage failed', err);
    }

    // Show a small thank-you message
    messageEl.textContent = `Thanks ${name.split(' ')[0] || name}! Your RSVP has been recorded.`;
    form.reset();
    // keep message visible for a while
    setTimeout(()=> messageEl.textContent = '', 9000);
  });
});
