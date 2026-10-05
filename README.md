# Link site

A minimal, YAML-driven static links page. Fork it, edit one file, and build.

## Quick start

Use Node.js 24 (or 22.18+) and npm 9.6.5+.

```sh
npm ci
npm run dev
```

## Configuration

Edit `config.yaml`. Your link names and their order are used exactly as configured.

```yaml
profile:
  fullName: Vladislav Kochetov # optional; an empty value is fine
  username: vladleesi # required; enter without @
  title: Mobile software engineer # optional; shown below username; an empty value is fine
site:
  url: https://vladleesi.dev/links # public site URL; include a base path if needed
  theme: default # optional; see Themes below; defaults to default
  mode: # optional; light or dark; empty or omitted follows the system
links: # displayed in this order; use [] for no links
  - name: Website # required; link label
    url: https://vladleesi.dev # required; http(s), mailto:, or tel: destination
    icon: website # optional; override the detected icon
    hostname: false # optional; set true to show the domain
  - name: GitHub
    url: https://github.com/vladleesi
```

Icons are detected from the hostname using the local collection in `src/assets/icons/`. Unknown sites use the website icon. Optional link fields: `icon: website` to override detection, and `hostname: true` to show a small hostname. HTTP(S), email (`mailto:`), and phone (`tel:`) links are supported.

## Themes

Set `site.theme` to `default`, `material`, `monokai`, `paper`, `arctic`, `ember`, `console`, `carbon`, `signal`, or `control`.

`control` pairs local Archivo typography with near-black, warm paper, and restrained red accents for a stark editorial feel. Set `site.theme: control` and optionally `site.mode: dark` for its strongest expression; light mode uses warm off-white surfaces. It keeps the shared cards, spacing, and animations.

**See the themes yourself:** run `npm run build:debug`, then `npm run preview -- --outDir dist-debug`, and use the footer dropdown to compare them. Selections are temporary and leave YAML unchanged.

All themes support light and dark appearances and use local fonts. Set `site.mode` to `light` or `dark` to choose the initial appearance regardless of the system setting; leave it empty or omit it to follow the system. The sun/moon button remains available, switches appearance immediately, and saves your choice in this browser. A saved visitor choice takes precedence over the configured mode. Without JavaScript, links and the configured or system appearance still work; the switch stays hidden.

Link hover adds a small bounce and icon wiggle on devices with a mouse. Animations respect the system’s reduced-motion preference.

Add one file under `src/themes/` and select its filename in YAML. Copy an existing theme to start; themes contain colors and fonts only. Local custom fonts go under `public/fonts/` and are declared in `fonts.faces`. Optional `fonts.preview` names a local TTF/OTF font for the generated sharing image. The image uses the theme’s light palette; the favicon supports both appearances.

## Build

```sh
npm run build
npm run preview
```

The complete static site is in `dist/`. YAML validation, favicon initials, the 1200×630 sharing image, SEO metadata, robots.txt, and sitemap are generated automatically. Builds make no requests to linked sites, icon APIs, or font services.

`npm run dev` also includes the theme dropdown. Production `npm run build` omits all debug UI, styles, and scripts.

## GitHub Pages

1. Fork the repository and edit `config.yaml`.
2. Set `site.url` to `https://username.github.io/repository/` (or your custom domain).
3. Set **Settings → Pages → Source → GitHub Actions**.
4. Push to `main`; the included workflow builds and deploys `dist/`.

The URL’s pathname automatically sets the asset base path. For a custom domain, configure it in GitHub Pages settings and update the YAML URL.

## Self-hosting

Set `site.url` to your public URL, including any subpath, run `npm run build`, and serve the contents of `dist/` with a static web server. Node.js is needed only for building. After changing `config.yaml`, rebuild and upload the updated files.

## Checks

```sh
npm run verify:version
npm run test:version
npm run check
npm run test:config
npm run test:themes
npm run build
npm run verify
npm run test:browser
```

Browser checks use installed Chrome, build fixture configurations, and restore your YAML afterward. Results go to ignored `artifacts/verification/`. They cover all themes, system appearance, small screens, keyboard access, reduced motion, custom fonts, base paths, and no-JavaScript operation. SVG/font licenses are stored beside their local assets.

Pull requests and pushes to `main` run type, configuration, build, and static-output checks. The Pages workflow runs the same checks before deployment. Browser checks are optional and start a temporary local server.

## Releases

Versions use `MAJOR.MINOR.PATCH`. Increase major for breaking changes, minor for compatible features, and patch for compatible fixes. `package.json` and both version fields in `package-lock.json` must agree.

For a subsequent release, choose one of these commands; it updates the package files without committing or tagging:

```sh
npm run version:patch
# or npm run version:minor / npm run version:major
```

The first release uses the existing `1.0.0`; skip the bump for that release. After reviewing changes and obtaining approval to commit, push, and publish:

1. Add a dated `## MAJOR.MINOR.PATCH - YYYY-MM-DD` entry to `CHANGELOG.md` with features, fixes, breaking changes, and migration steps when needed, then run the checks above. Version validation also requires release notes for the current version.
2. Commit the reviewed changes to `main`, for example `chore(release): prepare v1.0.0`, and push `main`.
3. CI checks the push, builds and verifies the site, then calls the release workflow only after the check job succeeds. Pull requests cannot publish releases.

The workflow reads the package version, automatically creates its `vMAJOR.MINOR.PATCH` tag at the exact checked commit, and publishes a GitHub release with that version's changelog notes and the checked build's ZIP (for example, `link-site-v1.0.0.zip`). No manual tag or release command is needed. If the version already has a published release, publication is skipped; bump the version for the next release. An unfinished draft or a conflicting tag fails visibly and needs review.

The ZIP contains the built site, its configured profile/base URL, and license notices; source archives are available through GitHub. Forks should change `config.yaml` and rebuild before hosting. Releases do not publish to npm or enable GitHub Pages.

Release publication uses the workflow's built-in GitHub token; no personal access token is required. A push to `main` with an unpublished version can publish a release automatically, so obtain release approval before that push. Leave published tags unchanged and release fixes under a new version.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and validation steps. Project code is licensed under [MIT](LICENSE); icons and fonts retain their upstream licenses, listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The site includes a Credits link to the generated license notices.

The committed profile is a public example. Replace the name, username, email, links, and site URL with your own before publishing a fork. All values in `config.yaml` are public build inputs; do not put secrets there. `private: true` in `package.json` prevents accidental npm publishing and does not restrict reuse under MIT.
