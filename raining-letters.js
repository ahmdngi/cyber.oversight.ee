/**
 * RainingLetters — digital rain background effect
 * Recreated from Framer Marketplace component by Orxan Qasimov
 * https://www.framer.com/marketplace/components/rainingletters/
 *
 * Canvas-based falling characters confined to side gutters
 * so main content stays readable.
 */

(function () {
  'use strict';

  const CONFIG = {
    chars: 280,               // total across both gutters
    minSize: 10,              // px
    maxSize: 20,              // px
    minSpeed: 0.5,            // px/frame
    maxSpeed: 2.0,
    flickerMs: 120,           // character highlight cycle
    phraseMs: 5000,           // glitch title rotation
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&{}[]+=:;<>',
  };

  /* ── colour helpers ── */
  function getStyle(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function getColours() {
    const ink = getStyle('--color-ink');
    const accent = getStyle('--color-accent');
    return { ink, accent };
  }

  /* ── compute gutters ── */
  function getGutters(vpW) {
    const container = document.querySelector('.container');
    let contentW = 860;
    if (container) {
      const cw = container.getBoundingClientRect().width;
      if (cw > 0) contentW = cw;
    }
    const margin = Math.max((vpW - contentW) / 2, 0);
    return { leftW: margin, rightStart: vpW - margin, margin };
  }

  /* ── character drops ── */
  function makeDrop(w, h, gutters) {
    const charset = CONFIG.charset;
    // Randomly assign to left or right gutter
    const side = Math.random() < 0.5 ? 'left' : 'right';
    let x;
    if (side === 'left') {
      x = Math.random() * gutters.leftW;
    } else {
      x = gutters.rightStart + Math.random() * (w - gutters.rightStart);
    }
    return {
      x,
      y: Math.random() * h * 2 - h * 2,
      size: CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize),
      speed: CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed),
      char: charset[Math.floor(Math.random() * charset.length)],
      active: false,
      flickerTimer: 0,
      opacity: 0.5 + Math.random() * 0.5,
      side,
    };
  }

  /* ── main ── */
  function init() {
    const canvas = document.createElement('canvas');
    canvas.id = 'raining-canvas';
    const s = canvas.style;
    s.position = 'fixed';
    s.top = '0';
    s.left = '0';
    s.width = '100vw';
    s.height = '100vh';
    s.zIndex = '0';
    s.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let drops = [];
    let w, h;

    /* ── glitch title ── */
    const phrases = ['Cybersecurity & infrastructure', 'Maritime OSINT & defence', 'Zero-trust edge ops', 'Industrial cyber resilience'];
    const heroH1 = document.querySelector('.hero h1');
    let phraseIdx = 0;
    let glitchTimer = 0;
    let glitching = false;

    function randomGlitch() {
      if (!heroH1) return;
      const phrase = phrases[phraseIdx % phrases.length];
      const len = phrase.length;
      let result = '';
      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.4) {
          result += CONFIG.charset[Math.floor(Math.random() * CONFIG.charset.length)];
        } else {
          result += phrase[i];
        }
      }
      heroH1.textContent = result;
    }

    function resolveGlitch() {
      if (heroH1) {
        const phrase = phrases[phraseIdx % phrases.length];
        heroH1.textContent = phrase;
        document.title = 'oversight.ee — ' + phrase.toLowerCase();
      }
      phraseIdx++;
      glitching = false;
    }

    /* ── resize ── */
    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      const gutters = getGutters(w);
      drops = [];
      for (let i = 0; i < CONFIG.chars; i++) {
        drops.push(makeDrop(w, h, gutters));
      }
    }
    window.addEventListener('resize', resize);

    /* ── draw ── */
    function draw(now) {
      ctx.clearRect(0, 0, w, h);

      const colours = getColours();
      const gutters = getGutters(w);
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';

      for (const d of drops) {
        d.y += d.speed;

        // Recycle — keep in gutter
        if (d.y > h + d.size) {
          Object.assign(d, makeDrop(w, h, gutters));
          d.y = -d.size * (1 + Math.random() * 3);
        }

        // Clamp x to gutter (in case viewport changed)
        if (gutters.margin > 0) {
          if (d.x < gutters.leftW) {
            // left gutter — fine
          } else if (d.x >= gutters.rightStart) {
            // right gutter — fine
          } else {
            // drifted into content zone — push to nearest gutter
            d.x = d.x < w / 2
              ? Math.random() * gutters.leftW
              : gutters.rightStart + Math.random() * (w - gutters.rightStart);
          }
        }

        // Flicker
        d.flickerTimer++;
        if (d.flickerTimer > CONFIG.flickerMs / 16) {
          d.active = !d.active;
          d.flickerTimer = 0;
          d.char = CONFIG.charset[Math.floor(Math.random() * CONFIG.charset.length)];
        }

        // Draw
        ctx.font = '500 ' + d.size + 'px "JetBrains Mono", "SF Mono", Monaco, monospace';

        if (d.active) {
          ctx.fillStyle = colours.accent;
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = colours.ink;
          ctx.globalAlpha = d.opacity;
        }

        ctx.fillText(d.char, d.x, d.y);
      }

      ctx.globalAlpha = 1;

      /* ── glitch title scheduler ── */
      if (!glitching) {
        glitchTimer += 16;
        if (glitchTimer > CONFIG.phraseMs) {
          glitching = true;
          glitchTimer = 0;
          let steps = 0;
          const maxSteps = 10 + Math.floor(Math.random() * 8);
          const interval = setInterval(() => {
            randomGlitch();
            steps++;
            if (steps >= maxSteps) {
              clearInterval(interval);
              resolveGlitch();
            }
          }, 50 + Math.random() * 30);
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    requestAnimationFrame(draw);

    window.__rainingLetters = { resize };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
