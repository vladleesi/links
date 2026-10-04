# vladleesi / personal links

A static Astro + TypeScript link hub for Vladislav Kochetov. Graphite surfaces, restrained amber highlights, locally hosted typography, a portrait energy ring, and service-specific previews. No backend, analytics, runtime API calls, or client framework.

## Development

Use Node.js 22.12+ and npm 9.6.5+.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run verify
npm run preview
```

`dist/` is the complete deployable static site. Builds do not need network access. Astro telemetry can be disabled with `ASTRO_TELEMETRY_DISABLED=1`.

## Editing

- `src/data/profile.ts` owns the identity, avatar source, all destinations, descriptions, and ordering. `socials` and JSON-LD derive from it.
- `src/components/LinkCard.astro` renders every card; service-specific preview blocks are decorative HTML, with no remote Open Graph fetching. They are designed compositions rather than screenshots of live services.
- `src/styles/global.css` owns responsive layout and motion. Pointer light tracking is a small progressive enhancement restricted to fine-pointer desktop devices. Touch states and all links work without JavaScript. Reduced motion removes transitions and entrance animations.
- `public/images/avatar.webp` and `avatar-192.webp` are cached GitHub portrait variants with matching responsive preload metadata and fixed display dimensions. `npm run refresh:profile` explicitly refreshes both; a download failure preserves existing images.
- `public/og.png` is the 1200×630 sharing card. Original assets and its generation brief live in `assets/`. Run `node scripts/prepare-images.mjs` to re-optimize originals.

## Hosting and SEO

The default site origin is the registered Sites preview URL. To deploy at your own public domain, set `SITE_URL` to the final HTTPS origin before building (see `.env.example`). This updates canonical, Open Graph URLs, JSON-LD image URL, robots.txt, and sitemap.xml together. It does not change the personal-website card pointing to `https://vladleesi.dev`.

Sites previews start private. Public search and sharing crawlers require public hosting access and a reachable final domain. The generated HTML itself contains all identity, links, structured data, and social metadata without JavaScript. No DNS or existing portfolio changes are made by this project.

`public/_headers` supplies static-host security and cache headers for hosts that support this format. Other hosts should apply equivalent response headers.

## Verification

```sh
npm run check
npm run build
npm run verify
npm run test:browser
```

Browser verification uses installed Chrome (or edit the channel to use Playwright Chromium). It checks 320, 375, 390, 430, 768, 1280, and 1920px widths, landscape, axe WCAG A/AA findings, overflow, avatar preload reuse, keyboard focus, reduced motion, touch feedback, 200% text, and core content without JavaScript. Screenshots and results go to ignored `artifacts/`.

The October 4, 2026 local mobile Lighthouse run scored 100 for performance, accessibility, best practices, and SEO: LCP 1.2s, CLS 0, TBT 0ms. All eight browser layouts passed with zero axe violations or horizontal overflow. Client JavaScript is 977 bytes, the optimized 320px avatar is 11.8 KB, and the smaller mobile variant is about 5 KB. Local lab scores do not measure hosted authentication, real-network latency, or field INP.

## Profile sources

Profile copy and destinations were checked on October 4, 2026 against [vladleesi.dev](https://vladleesi.dev) and [GitHub](https://github.com/vladleesi). The short tagline paraphrases the portfolio’s focus on scalable mobile architecture and code quality. GitHub confirms the LinkedIn and X accounts. No live statistics or invented accounts are displayed. LinkedIn returns HTTP 999 to automated clients; its destination is verified through the portfolio and GitHub rather than an authenticated LinkedIn check. The email address comes from the supplied brief; deliverability is not tested.
