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

  /* --- Active nav link highlighting --- */
  const sections = document.querySelectorAll('section[id]');
  const linkMap = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const link = linkMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.values(linkMap).forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* --- Footer year --- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
