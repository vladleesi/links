# Contributing

Use Node.js 24 and npm 9.6.5 or later. Install the locked dependencies with `npm ci`.

For a bug report, include the Node/npm versions, relevant configuration with private values removed, and steps to reproduce. For a pull request, explain the behavior that changes and keep the work focused.

Before submitting:

```sh
npm run check
npm run test:config
npm run build
npm run verify
```

For layout or interaction changes, also run `npm run test:browser`. This optional check uses installed Google Chrome, starts a temporary local server on port 4322, and builds fixture configurations. It restores `config.yaml` afterward; avoid editing that file while the check runs. Screenshots and reports go to ignored `artifacts/verification/`.

Keep the page static, use local assets, and preserve keyboard access, operation without JavaScript, and reduced-motion support. Themes should contain colors and fonts only. Add upstream provenance and license notices when introducing third-party assets.

Do not include generated output, credentials, local tooling files, or private profile data. Contributions to the code are provided under the project's MIT license; third-party assets keep their own licenses.
