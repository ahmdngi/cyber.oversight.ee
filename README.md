# cyber.oversight.ee

**Oversight** — maritime & fleet cybersecurity. Free vessel exposure scan, automated fleet-wide monitoring, and edge data collection.

Company website — **https://www.oversight.ee** (GitHub Pages).

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| M-SOC | `M-SOC.html` (old `architecture.html` redirects here) |
| Shipcrawler (free scan) | `shipcrawler.html` / `free-scan.html` |
| Web Development | `web-design.html` |
| Mobile App Development | `mobile-app.html` |
| Networking | `networking.html` |
| Watchtower | `watchtower.html` |
| Blog | `blog.html` |
| Contact | `contact.html` |
| Arabic mirror | `ar/` |

## Stack

Vanilla HTML/CSS/JS — zero-dependency static site, served via GitHub Pages (`.github/workflows/deploy.yml`). Push to `main` auto-deploys.

## Design

- Tokens-based CSS (`tokens.css`), dark void `#060608` + lime `#a8d506`
- Fonts: Inter + JetBrains Mono
- `theme.js` handles dark/light, `fx.js` background effects
- Sitemap + robots.txt + 404 + `.htaccess` (SEO)
