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
  username: vladleesi
site:
  url: https://links.vladleesi.dev
  theme: default
links:
  - name: Website
    url: https://vladleesi.dev
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
npm run check
npm run test:config
npm run build
npm run verify
npm run test:browser
```

Browser checks use installed Chrome, build fixture configurations, and restore your YAML afterward. Results go to ignored `artifacts/verification/`. They cover all themes, system appearance, small screens, keyboard access, reduced motion, custom fonts, base paths, and no-JavaScript operation. SVG/font licenses are stored beside their local assets.

Pull requests and pushes to `main` run type, configuration, build, and static-output checks. The Pages workflow runs the same checks before deployment. Browser checks are optional and start a temporary local server.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and validation steps. Project code is licensed under [MIT](LICENSE); icons and fonts retain their upstream licenses, listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The site includes a Credits link to the generated license notices.

The committed profile is a public example. Replace the name, username, email, links, and site URL with your own before publishing a fork. All values in `config.yaml` are public build inputs; do not put secrets there. `private: true` in `package.json` prevents accidental npm publishing and does not restrict reuse under MIT.
