# cyber.oversight.ee

**Oversight** — cybersecurity implementation, consultancy, and managed infrastructure for operational environments where standard IT security models don't apply: maritime vessels, industrial networks, research infrastructure, and distributed operational technology.

This is the company website.

## Stack

Vanilla HTML/CSS/JS — served via Python `http.server`.

## Features

- **PWA** — Installable on home screen (manifest.json + service worker)
- Responsive layout for mobile, tablet, and desktop
- Digital rain (RainingLetters) background effect, confined to side gutters
- Glitch-scrambling hero title that rotates through taglines
- Hallmark design system with dark/light mode awareness
- Zero-dependency, multi-page static site

## Design

- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- **Tokens-based CSS** using oklch color space
- **Accent:** green 160° hue
- **Paper/ink contrast** for readability in both light and dark mode

## Deployment

Published to **https://cyber.oversight.ee** via GitHub Pages.
Push to `main` triggers automatic deploy.
