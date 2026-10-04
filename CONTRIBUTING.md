# Contributing

Use Node.js 24 and npm 9.6.5 or later. Install the locked dependencies with `npm ci`.

For a bug report, include the Node/npm versions, relevant configuration with private values removed, and steps to reproduce. For a pull request, explain the behavior that changes and keep the work focused.

Use commit messages such as `feat: add a theme`, `fix: correct URL validation`, or `ci: update build checks`. Coding agents need explicit user permission before committing, pushing, tagging, or publishing a release. Local agent instructions are ignored by Git.

Before submitting:

```sh
npm run verify:version
npm run test:version
npm run check
npm run test:config
npm run build
npm run verify
```

For layout or interaction changes, also run `npm run test:browser`. This optional check uses installed Google Chrome, starts a temporary local server on port 4322, and builds fixture configurations. It restores `config.yaml` afterward; avoid editing that file while the check runs. Screenshots and reports go to ignored `artifacts/verification/`.

Keep the page static, use local assets, and preserve keyboard access, operation without JavaScript, and reduced-motion support. Themes should contain colors and fonts only. Add upstream provenance and license notices when introducing third-party assets.

Do not include generated output, credentials, local tooling files, or private profile data. Contributions to the code are provided under the project's MIT license; third-party assets keep their own licenses.

## Versioning and releases

Use `MAJOR.MINOR.PATCH`: major for breaking changes, minor for compatible features, and patch for compatible fixes. A breaking change should use `!` after the commit type/scope or a `BREAKING CHANGE:` footer. Documentation and maintenance commits need a version bump only if they change the released product.

Use `npm run version:patch`, `npm run version:minor`, or `npm run version:major` to update the version and lockfile together. These commands create neither commits nor tags. Keep a version bump in the release preparation commit, such as `chore(release): prepare v1.1.0`.

Follow [the release steps in README.md](README.md#releases). Pushing `main` with an unpublished package version triggers automatic tag creation and GitHub release publication after CI checks pass. Obtain approval for the release before pushing; manual tagging is unnecessary. Already-published versions are skipped. Never move a published tag; ship corrections with a new version.
