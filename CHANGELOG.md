# Changelog

## 1.4.0 - 2026-10-05

- Add `control`: near-black and warm-paper palettes with restrained red accents and local Archivo typography, preserving the shared layout, cards, and animations.
- Bundle the pinned Archivo variable font, upstream provenance, and full SIL Open Font License in the distributed credits.
- Check both palettes for readable text, graphical accent contrast, and selection contrast; document theme selection in the README.

## 1.3.0 - 2026-10-04

- Add a compact footer theme dropdown with an inset arrow in development and `npm run build:debug`, with separate output in `dist-debug/`.
- Keep production output free of debug UI, styles, and scripts; check both builds in CI.
- Add `console` (JetBrains Mono and green), `carbon` (IBM Plex Sans and blue), and `signal` (Space Grotesk and safety orange), each with accessible light and dark palettes.
- Include pinned local font sources and full licenses for JetBrains Mono and Space Grotesk.
- Document debug previews for comparing themes in the browser.

## 1.2.0 - 2026-10-04

### Added

- `paper`: warm cream and beige palettes with local Source Sans 3 body text and Lora headings.
- `arctic`: calm Nordic blue palettes with local IBM Plex Sans.
- `ember`: terracotta and orange palettes using the existing local Manrope fonts.
- Each new theme supports light and dark modes through the existing theme interface, with the shared layout, cards, animations, and behavior preserved.
- Include pinned font provenance and full font licenses in the distributed credits.

### Documentation

- Add concise self-hosting instructions covering the public URL, static serving, build-only Node.js requirements, and rebuilding after configuration changes.

## 1.1.0 - 2026-10-04

### Added

- Optional `profile.title` displayed below the username as readable, neutral text. Empty or omitted titles are hidden.
- Optional `site.mode` to choose light or dark appearance. Empty or omitted values follow the system setting. The appearance toggle stays available, and a visitor's saved choice takes precedence.
- Versioned release notes from this changelog are validated and included in GitHub releases.

### Changed

- The copyright footer always displays the configured username, including when a full name is set.

Existing configurations remain supported. No migration is required.
