# personal-site

Personal portfolio website for [Alexander Barzik](https://alexanderbarzik.de), inspired by LinkedIn's visual language. Built with vanilla JavaScript and CSS — zero dependencies, zero build steps.

## Features

- **DE/EN language toggle** — full i18n with 400+ translation keys, language detection via URL param or localStorage
- **AI chat panel** — ask questions about my background, skills, and experience (powered by a backend API)
- **Site search** — real-time search across all sections with inline results
- **Easter eggs** — Konami code terminal, cover theme switcher, pixel scatter animation, and more
- **Responsive** — mobile-first layout with bottom nav, condensed header on scroll, and touch-friendly interactions
- **SEO** — structured data (JSON-LD), sitemap, robots.txt, and [llms.txt](https://alexanderbarzik.de/llms.txt) for LLM discoverability

## Tech

| | |
|---|---|
| **Markup** | Single `index.html` with inline CSS |
| **Scripts** | Vanilla JS — `interactions.js`, `easter-eggs.js`, `i18n.js`, `translations.js` |
| **Dependencies** | None |
| **Build** | None — deploy the files as-is |

## Structure

```
├── index.html          Main page (markup + styles)
├── interactions.js     Click handlers, search, navigation
├── easter-eggs.js      AI chat panel, terminal, cover themes
├── i18n.js             Language engine (detection, DOM translation, toggle)
├── translations.js     All DE/EN translation strings
├── assets/             Images and fonts
├── datenschutz.html    Privacy policy (German, required by law)
├── impressum.html      Legal notice (German, required by law)
├── robots.txt          Crawler rules
├── sitemap.xml         Sitemap
├── llms.txt            LLM-readable site summary
└── llms.en.txt         LLM-readable site summary (English)
```

## Live

**[alexanderbarzik.de](https://alexanderbarzik.de)**

## License

[MIT](LICENSE)
