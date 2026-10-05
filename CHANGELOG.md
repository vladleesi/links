# Changelog

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
