/* ══════════════════════════════════════════════════════════════════
   Shared behavior for all project pages: scroll reveal + image lightbox.
   ══════════════════════════════════════════════════════════════════ */

// ── Scroll reveal (same behavior as index) ──
(function () {
  const items = document.querySelectorAll('.reveal-item');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => obs.observe(el));
})();

// ── Lightbox — clicking a media-frame image opens it near-fullscreen.
//    Frames without an <img> (placeholders, video) stay inert. ──
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lightbox-img');
  const closeBtn = lb.querySelector('.lightbox-close');
  let lastFocus = null;

  function open(img) {
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    closeBtn.focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('.media-frame').forEach(frame => {
    const img = frame.querySelector('img');
    if (!img) return;
    frame.setAttribute('role', 'button');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('aria-label', 'View image full screen');
    frame.addEventListener('click', () => open(img));
    frame.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
    });
  });

  lb.addEventListener('click', close); // click anywhere (incl. image) closes
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('open')) close();
  });

  // Scroll to in-page targets without leaving the #hash in the address bar.
  // Bare scrollIntoView() (no options) honours the CSS scroll-behavior, so it
  // stays smooth normally and jumps under prefers-reduced-motion.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView();
      history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // Same for arriving with a hash already set (a shared deep link). Let the
  // browser scroll, then tidy the URL once nothing is left to shift.
  window.addEventListener('load', () => {
    if (!location.hash) return;
    history.replaceState(null, '', location.pathname + location.search);
  });
})();
