/**
 * Cyber Oversight — High-Performance Motion & FX Engine (fx.js)
 * Zero-dependency, 60/120fps requestAnimationFrame animations,
 * scroll progress, 3D card physics, magnetic interactions,
 * scroll reveals, counter telemetry, and marquee cloning.
 */
(function () {
  'use strict';

  // 1. Smooth Scroll Progress & Scrolled Header State
  const progress = document.getElementById('progress');
  const nav = document.getElementById('nav') || document.querySelector('nav, header');
  let isTicking = false;

  function handleScrollTick() {
    if (isTicking) return;
    isTicking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const totalScroll = doc.scrollHeight - doc.clientHeight;
      if (progress && totalScroll > 0) {
        progress.style.width = ((doc.scrollTop / totalScroll) * 100) + '%';
      }
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 24);
      }
      isTicking = false;
    });
  }
  window.addEventListener('scroll', handleScrollTick, { passive: true });
  handleScrollTick();

  // 2. Parallax Depth on Background Orbs & Grids
  const parallaxNodes = document.querySelectorAll('[data-parallax]');
  if (parallaxNodes.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.5) {
        parallaxNodes.forEach(node => {
          const factor = parseFloat(node.getAttribute('data-parallax')) || 0.15;
          node.style.transform = `translate3d(0, ${(y * factor).toFixed(1)}px, 0)`;
        });
      }
    }, { passive: true });
  }

  // 3. Magnetic Hover Physics on Interactive Elements
  if (window.matchMedia('(pointer: fine)').matches) {
    const magneticElements = document.querySelectorAll('.magnetic, .btn, .nav-cta, .theme-toggle-btn');
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.18;
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.22;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });

    // 4. 3D Tilt & Cursor-Tracking Spotlight Glow on Cards
    const interactiveCards = document.querySelectorAll('[data-tilt], [data-spot], .tile, .card-human, .board');
    interactiveCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);

        if (card.hasAttribute('data-tilt') || card.classList.contains('board')) {
          const nx = (x / rect.width - 0.5) * 6;
          const ny = (y / rect.height - 0.5) * -6;
          card.style.transform = `perspective(900px) rotateX(${ny.toFixed(2)}deg) rotateY(${nx.toFixed(2)}deg) translate3d(0, -2px, 0)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        if (card.hasAttribute('data-tilt') || card.classList.contains('board')) {
          card.style.transform = '';
        }
      });
    });
  }

  // 5. Scroll Reveal Intersection Observer
  const revealElements = document.querySelectorAll('.reveal, .bento, .tile, .card-human');
  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 6. Telemetry Animated Counters
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterObserver.unobserve(el);
        const target = parseFloat(el.getAttribute('data-count')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = String(target).includes('.');
        const startTime = performance.now();
        const duration = 1200;

        function updateCounter(currentTime) {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentVal = target * easeOutCubic;
          el.textContent = (isDecimal ? currentVal.toFixed(1) : Math.round(currentVal)) + suffix;
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        }
        requestAnimationFrame(updateCounter);
      });
    }, { threshold: 0.3 });

    counters.forEach(el => counterObserver.observe(el));
  }

  // 7. Infinite Marquee Ticker Track Duplication
  const track = document.getElementById('tickTrack');
  if (track && track.children.length > 0) {
    track.innerHTML += track.innerHTML;
  }
})();
