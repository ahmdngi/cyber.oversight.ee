# cyber.oversight.ee

**Cyber Oversight** — maritime & fleet cybersecurity. Free 3-vessel exposure scan, automated fleet-wide monitoring, and edge data collection. Built by maritime researchers, peer-reviewed in IEEE Access 2026.

This is the company website.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?style=flat-square)](https://cyber.oversight.ee)
[![CI](https://img.shields.io/github/actions/workflow/status/ahmdngi/cyber.oversight.ee/ci.yml?style=flat-square)](https://github.com/ahmdngi/cyber.oversight.ee/actions/workflows/ci.yml)
[![Language](https://img.shields.io/badge/language-HTML-blue?style=flat-square)]()
[![Stars](https://img.shields.io/github/stars/ahmdngi/cyber.oversight.ee?style=flat-square)](https://github.com/ahmdngi/cyber.oversight.ee)

## Stack

Vanilla HTML/CSS/JS — served via GitHub Pages.

## Features

- **Logo:** `logo-header.webp` in the site header, `favicon.png` (32×32)
- **OG preview card:** `og-image.png` (1200×630) with the Cyber Oversight logo, for social link previews
- Digital rain (RainingLetters) background effect
- Hallmark design system with dark/light mode awareness (oklch tokens)
- PWA: manifest.json, service worker, install banner on all pages
- Sitemap.xml + robots.txt for SEO
- 5 blog posts covering VSAT security, ECDIS, PSC, Shodan, and case studies
- Zero-dependency static site

## Design

- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- Tokens-based CSS using oklch color space
- Accent: green 160° hue
- Paper/ink contrast for readability in both light and dark mode

## Pages

| Page | URL |
|------|-----|
| Home | `/` |
| Capabilities | `/capabilities/` |
| Architecture | `/architecture/` |
| Shipcrawler (free scan) | `/shipcrawler/` |
| Blog index | `/blog/` |
| VSAT Security | `/blog/vsat-security-fleet-managers.html` |
| ECDIS Vulnerabilities | `/blog/ecdis-vulnerabilities-fleet-managers.html` |
| PSC Cyber Requirements | `/blog/psc-cyber-requirements-2026.html` |
| Shodan Attack Surface | `/blog/how-attackers-find-ships-shodan.html` |
| Fleet Scan Case Study | `/blog/fleet-scan-case-study.html` |
| Contact | `/contact/` |

## Deployment

Published to **https://cyber.oversight.ee** via GitHub Pages.
Push to `main` triggers automatic deploy via `.github/workflows/ci.yml`.
