/* ============================================================
   DATACREX — Interactions
   ============================================================ */
(function () {
  'use strict';

  /* --- Mobile nav toggle --- */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function setNav(open) {
    navLinks.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    // lock page scroll behind the overlay menu
    document.body.style.overflow = open ? 'hidden' : '';
  }
  function closeNav() { setNav(false); }

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      setNav(!navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    // close the menu if the viewport grows back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* --- Sticky header background on scroll --- */
  const header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Reveal on scroll --- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // small stagger for grouped elements
          setTimeout(function () { entry.target.classList.add('in'); }, i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* --- Animated stat counters --- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = Number.isInteger(target) ? 0 : 1;
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = (target * eased).toFixed(decimals);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* --- Active nav link highlighting (scrollspy) --- */
  // Derive a section key from a nav href: "/services.html" -> "services",
  // "/blog/" -> "blog", "/" -> null. Lets the page-based nav highlight the
  // matching section as you scroll the home page.
  function sectionKeyFromHref(href) {
    if (!href || href === '/' || href.charAt(0) === '#') return null;
    var file = href.split('/').pop();
    if (file && file.indexOf('.html') !== -1) return file.replace('.html', '');
    var parts = href.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
  }
  const linkMap = {};
  document.querySelectorAll('.nav-links a:not(.btn)').forEach(function (a) {
    const key = sectionKeyFromHref(a.getAttribute('href'));
    if (key) linkMap[key] = a;
  });
  // Only spy on sections that correspond to a nav link (so sub-pages, which
  // keep their server-rendered .active class, are left untouched).
  const spySections = [];
  document.querySelectorAll('section[id]').forEach(function (s) {
    if (linkMap[s.id]) spySections.push(s);
  });
  if ('IntersectionObserver' in window && spySections.length) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const link = linkMap[entry.target.id];
        if (!link) return;
        Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove('active'); });
        link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach(function (s) { navObserver.observe(s); });
  }

  /* --- Randomize the home "Latest from the blog" section to a random 3 --- */
  (function () {
    const grid = document.getElementById('homeBlogGrid');
    if (!grid) return;
    const cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
    const SHOW = 3;
    if (cards.length <= SHOW) return;
    // Fisher–Yates shuffle of indices, then hide all but the first SHOW
    const order = cards.map(function (_, i) { return i; });
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    const keep = order.slice(0, SHOW);
    cards.forEach(function (card, i) {
      if (keep.indexOf(i) === -1) card.style.display = 'none';
    });
  })();

  /* --- Footer year --- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Contact form (Web3Forms AJAX, inline success) --- */
  document.querySelectorAll('.contact-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const result = form.querySelector('.form-result');
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
      if (result) { result.style.display = 'none'; result.className = 'form-result'; }

      const payload = JSON.stringify(Object.fromEntries(new FormData(form).entries()));
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: payload
      })
        .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          if (res.ok && res.data.success) {
            form.reset();
            if (result) {
              result.textContent = "✅ Thanks — your message is on its way. We'll reply within one business day.";
              result.classList.add('success');
              result.style.display = 'block';
            }
          } else {
            throw new Error((res.data && res.data.message) || 'submit failed');
          }
        })
        .catch(function () {
          if (result) {
            result.textContent = '⚠ Something went wrong. Please email contact@datacrex.com directly.';
            result.classList.add('error');
            result.style.display = 'block';
          }
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = original; }
        });
    });
  });
})();
