// ══════════════════════════════════════════════════════════════════════════
// OVERSIGHT — CORE CLIENT RUNTIME (theme.js)
// Theme persistence, mobile drawer, dual-hub world clocks, global interactions
// ══════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';
  const THEME_KEY = 'cyber_oversight_theme';
  // Mark the document as JS-enabled immediately (reveal animations gate on this)
  document.documentElement.classList.add('js');

  // 0. Clean URL enforcement: strip .html extension from address bar immediately
  try {
    if (location.protocol !== 'file:' && location.pathname.endsWith('.html')) {
      var cleanPath = location.pathname.replace(/\.html$/, '');
      if (cleanPath.endsWith('/index')) cleanPath = cleanPath.slice(0, -5) || '/';
      window.history.replaceState(null, '', cleanPath + location.search + location.hash);
    }
  } catch(e) {}

  // 1. Initial Theme Determination & Immediate Application (No Flash)
  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark'; // Default to dark command center theme
  }

  const currentTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  // SVG Icons
  const SUN_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const MOON_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  document.addEventListener('DOMContentLoaded', () => {
    // 2. Initialize Theme Switchers
    const themeToggles = document.querySelectorAll('.theme-toggle-btn');
    function syncLogo(theme) {
      document.querySelectorAll('.brand-logo-img').forEach(img => {
        const base = img.getAttribute('data-logo-dark') || 'logo-full.png';
        img.src = (theme === 'light') ? (img.getAttribute('data-logo-light') || 'logo-full-light.png') : base;
      });
    }
    function updateThemeUI(theme) {
      themeToggles.forEach(btn => {
        btn.innerHTML = (theme === 'dark') ? SUN_ICON : MOON_ICON;
        btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      });
      syncLogo(theme);
    }
    updateThemeUI(document.documentElement.getAttribute('data-theme') || currentTheme);

    themeToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const active = document.documentElement.getAttribute('data-theme');
        const next = active === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeUI(next);
      });
    });
    // 3. Mobile Navigation Drawer & Backdrop Handling
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    
    if (mobileToggle && mobileDrawer) {
      const setDrawerState = (isOpen) => {
        mobileDrawer.classList.toggle('open', isOpen);
        mobileToggle.classList.toggle('open', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('drawer-open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setDrawerState(!mobileDrawer.classList.contains('open'));
      });

      // Close mobile drawer on outside click
      document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('open') && !mobileDrawer.contains(e.target) && e.target !== mobileToggle) {
          setDrawerState(false);
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
          setDrawerState(false);
        }
      });
    }

    // 4. Header Scroll State
    const navHeader = document.getElementById('nav') || document.querySelector('nav, header');
    if (navHeader) {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          navHeader.classList.add('scrolled');
        } else {
          navHeader.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // 5. Dual-Hub Live Clocks (Tallinn EET & Riyadh AST) — only run when clock elements exist
    function updateAllClocks() {
      const now = new Date();
      const tallinnTime = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Tallinn', hour12: false });
      const riyadhTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour12: false });

      // Homepage & presence clocks
      const t1 = document.getElementById('tallinnClock');
      if (t1) t1.textContent = `TALLINN TIME: ${tallinnTime} EET`;
      const r1 = document.getElementById('riyadhClock');
      if (r1) r1.textContent = `RIYADH TIME: ${riyadhTime} AST`;

      // Contact page clocks (HTML already renders the "LOCAL TIME:" label; write only the time)
      const t2 = document.getElementById('contactTallinnClock');
      if (t2) t2.textContent = `${tallinnTime} EET`;
      const r2 = document.getElementById('contactRiyadhClock');
      if (r2) r2.textContent = `${riyadhTime} AST`;

      // Stop the interval if no clock element exists anywhere (13 pages have none)
      if (!t1 && !r1 && !t2 && !r2 && window.__clockTimer) {
        clearInterval(window.__clockTimer);
        window.__clockTimer = null;
      }
    }
    const hasAnyClock = ['tallinnClock', 'riyadhClock', 'contactTallinnClock', 'contactRiyadhClock']
      .some(id => document.getElementById(id));
    if (hasAnyClock) {
      updateAllClocks();
      window.__clockTimer = setInterval(updateAllClocks, 1000);
    }

    // 6. Homepage Quick Scan Input Redirect (only binds when the element exists)

    // 7. Clean URL Interceptor & Offline file:// Protocol Link Compatibility
    try {
      if (location.protocol === 'file:') {
        // When opening files directly on local hard drive, adapt clean links to .html
        document.querySelectorAll('a[href]').forEach(a => {
          const h = a.getAttribute('href');
          if (h && !h.startsWith('http') && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('javascript:')) {
            if (!h.includes('.')) {
              if (h === '/' || h === './' || h === '') a.setAttribute('href', 'index.html');
              else if (h === '../') a.setAttribute('href', '../index.html');
              else a.setAttribute('href', h + '.html');
            }
          }
        });
      } else {
        // On live web: intercept any internal .html links to navigate cleanly without extension
        document.addEventListener('click', e => {
          const a = e.target.closest('a[href]');
          if (!a) return;
          const h = a.getAttribute('href');
          if (h && h.endsWith('.html') && !h.startsWith('http:') && !h.startsWith('https:') && !h.startsWith('//')) {
            e.preventDefault();
            let clean = h.replace(/\.html$/, '');
            if (clean === 'index' || clean === './index') clean = './';
            else if (clean === '../index') clean = '../';
            window.location.href = clean;
          }
        });
      }
    } catch(e) {}
  });
})();
