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
site:
  url: https://vladleesi.dev/links # public site URL; include a base path if needed
  theme: default # optional; default, material, monokai, or a custom theme
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

Choose `default`, `material`, or `monokai` in YAML. Each starts with the system’s light/dark preference. The sun/moon button switches appearance immediately and saves your choice in this browser. Links and system appearance still work without JavaScript; the switch stays hidden.

Link hover adds a small bounce and icon wiggle on devices with a mouse. Animations respect the system’s reduced-motion preference.

Add one file under `src/themes/` and select its filename in YAML. Copy an existing theme to start; themes contain colors and fonts only. Local custom fonts go under `public/fonts/` and are declared in `fonts.faces`. Optional `fonts.preview` names a local TTF/OTF font for the generated sharing image. The image uses the theme’s light palette; the favicon supports both appearances.

## Build

```sh
npm run build
npm run preview
```

The complete static site is in `dist/`. YAML validation, favicon initials, the 1200×630 sharing image, SEO metadata, robots.txt, and sitemap are generated automatically. Builds make no requests to linked sites, icon APIs, or font services.

## GitHub Pages

1. Fork the repository and edit `config.yaml`.
2. Set `site.url` to `https://username.github.io/repository/` (or your custom domain).
3. Set **Settings → Pages → Source → GitHub Actions**.
4. Push to `main`; the included workflow builds and deploys `dist/`.

The URL’s pathname automatically sets the asset base path. For a custom domain, configure it in GitHub Pages settings and update the YAML URL. Other static hosts can serve `dist/` directly.

## Checks

```sh
npm run verify:version
npm run test:version
npm run check
npm run test:config
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

The first release uses the existing `1.0.0`; skip the bump for that release. After reviewing changes and obtaining approval to commit and publish:

1. Run the checks above, then `npm run verify:version -- v1.0.0` (substitute the chosen version).
2. Commit the reviewed changes to `main`, for example `chore(release): prepare v1.0.0`, and push `main`.
3. Create and push an annotated tag matching the version:

```sh
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

The release workflow validates the version/tag and that the commit belongs to `main`, runs all static checks, and publishes a GitHub release with generated notes and `link-site-v1.0.0.zip`. The ZIP contains the built site, its configured profile/base URL, and license notices; source archives are available through GitHub. Forks should change `config.yaml` and rebuild before hosting. Releases do not publish to npm or enable GitHub Pages.

Release publication uses the workflow's built-in GitHub token; no personal access token is required. Treat a version-tag push as approval to publish that release. Leave published tags unchanged and release fixes under a new version.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and validation steps. Project code is licensed under [MIT](LICENSE); icons and fonts retain their upstream licenses, listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The site includes a Credits link to the generated license notices.

The committed profile is a public example. Replace the name, username, email, links, and site URL with your own before publishing a fork. All values in `config.yaml` are public build inputs; do not put secrets there. `private: true` in `package.json` prevents accidental npm publishing and does not restrict reuse under MIT.
