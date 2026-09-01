// ══════════════════════════════════════════════════════════════════════════
// CYBER OVERSIGHT — CORE CLIENT RUNTIME (theme.js)
// Theme persistence, mobile drawer, dual-hub world clocks, global interactions
// ══════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';
  const THEME_KEY = 'cyber_oversight_theme';
  // Mark the document as JS-enabled immediately (reveal animations gate on this)
  document.documentElement.classList.add('js');

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
    function updateThemeUI(theme) {
      themeToggles.forEach(btn => {
        btn.innerHTML = (theme === 'dark') ? SUN_ICON : MOON_ICON;
        btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      });
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
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.classList.toggle('open', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close mobile drawer on outside click
      document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('open') && !mobileDrawer.contains(e.target) && e.target !== mobileToggle) {
          mobileDrawer.classList.remove('open');
          mobileToggle.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          mobileToggle.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
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

    // 5. Dual-Hub Live Clocks (Tallinn EET & Riyadh AST)
    function updateAllClocks() {
      const now = new Date();
      const tallinnTime = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Tallinn', hour12: false });
      const riyadhTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour12: false });

      // Homepage & presence clocks
      const t1 = document.getElementById('tallinnClock');
      if (t1) t1.textContent = `TALLINN TIME: ${tallinnTime} EET`;
      const r1 = document.getElementById('riyadhClock');
      if (r1) r1.textContent = `RIYADH TIME: ${riyadhTime} AST`;

      // Contact page clocks
      const t2 = document.getElementById('contactTallinnClock');
      if (t2) t2.textContent = `LOCAL TIME: ${tallinnTime} EET`;
      const r2 = document.getElementById('contactRiyadhClock');
      if (r2) r2.textContent = `LOCAL TIME: ${riyadhTime} AST`;
    }
    setInterval(updateAllClocks, 1000);
    updateAllClocks();

    // 6. Homepage Quick Scan Input Redirect
    const quickScanInput = document.getElementById('searchTarget');
    if (quickScanInput) {
      quickScanInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = encodeURIComponent(quickScanInput.value.trim() || 'IMO 0098110');
          window.location.href = `shipcrawler.html?target=${val}`;
        }
      });
    }
  });
})();
