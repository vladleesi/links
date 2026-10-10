# Changelog

## 1.4.5 - 2026-10-10

- Add a README showcase with four mobile configurations in a single row and six Open Graph previews generated from the existing application and themes.
- Demonstrate varied profile content, optional fields, detected icons, hostnames, and adaptive sharing-image typography using small local PNG assets.

## 1.4.4 - 2026-10-10

- Replace the OG monogram with a larger text-first layout using theme fonts and colors, a minimal “Links” cue, and optional profile details.
- Respect `site.mode` in OG images; default to light when empty or omitted.
- Fit measured text within safe margins, wrap naturally, omit empty fields, and use ellipsis only at readable size limits.
- Keep generation local and deterministic with licensed static font weights; warn when fonts cannot render a character.
- Add descriptive OG/Twitter alt text and content-fingerprinted images; retain `og.png`. Upload the complete build directory to include `og/`.
- Test both modes of all ten themes for layout, typography, contrast, Unicode, and sharing URLs.

## 1.4.3 - 2026-10-10

- Make the required `@username` the first and largest text in the Open Graph image, with the optional full name and profile title as supporting details.
- Reduce the monogram's prominence and preserve the text hierarchy when long profile fields shrink or wrap.
- Distinguish the full name from the smaller profile title through typography and spacing, and recenter the visible content when either optional field is omitted.

## 1.4.2 - 2026-10-10

- Balance the generated Open Graph image with a centered monogram and a larger, aligned profile text column, using the selected theme's local fonts and colors.
- Include the configured profile title below the name and username.
- Measure text with the bundled fonts, wrap long profile fields at safe character boundaries, and shorten exceptionally long content with an ellipsis to preserve readable spacing.
- Preserve static build-time PNG generation and existing sharing metadata.
- Ignore local IntelliJ IDEA project settings.

## 1.4.1 - 2026-10-05

- Match the portfolio favicon’s bold Arial initials, tight spacing, and transparent background while keeping profile initials generated from configuration.
- Use each theme’s accent color for the favicon and synchronize it with saved, configured, and system appearance choices, plus the debug theme picker.
- Keep the static favicon usable without JavaScript and respect an explicitly configured appearance.

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
