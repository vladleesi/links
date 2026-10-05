# Third-party assets

The project code is MIT licensed. The following assets retain their upstream licenses.

| Assets | Author / source | License file |
| --- | --- | --- |
| Manrope fonts in `public/fonts/` | [The Manrope Project Authors](https://github.com/sharanda/manrope) | [SIL OFL 1.1](public/fonts/OFL.txt) |
| Open Sans fonts in `public/fonts/` and `src/assets/fonts/` | [The Open Sans Project Authors](https://github.com/googlefonts/opensans) | [SIL OFL 1.1](public/fonts/OFL-OpenSans.txt) |
| Source Sans 3 font in `public/fonts/` | [Adobe / Paul D. Hunt](https://github.com/adobe-fonts/source-sans) | [SIL OFL 1.1](public/fonts/OFL-SourceSans3.txt) |
| Lora font in `public/fonts/` | [The Lora Project Authors](https://github.com/cyrealtype/Lora-Cyrillic) | [SIL OFL 1.1](public/fonts/OFL-Lora.txt) |
| IBM Plex Sans font in `public/fonts/` | [IBM](https://github.com/IBM/plex) | [SIL OFL 1.1](public/fonts/OFL-IBMPlexSans.txt) |
| Brand icons identified as Simple Icons in the manifest | [Simple Icons contributors](https://github.com/simple-icons/simple-icons) | [CC0 1.0](src/assets/icons/simple-icons.txt) |
| Brand icons identified as Font Awesome Free in the manifest | [Fonticons, Inc.](https://fontawesome.com/) | [CC BY 4.0 for icons](src/assets/icons/font-awesome.txt) |
| Website, email, and external-link icons | [Lucide contributors](https://lucide.dev/) | [ISC / MIT notices](src/assets/icons/lucide.txt) |

[The icon manifest](src/assets/icons/sources.json) records the exact upstream revision, URL, and license for each brand SVG. Vendored SVGs are used as supplied; their display color and size are set with CSS. Brand names and logos remain the trademarks of their respective owners; inclusion does not imply endorsement.

The build generates `credits.txt` with asset attribution and full license texts. Keep this file and the footer credit link when distributing the site. Font license files also ship under `fonts/`.

[The new font manifest](public/fonts/sources.json) records the pinned Google Fonts revision and exact download URLs for Source Sans 3, Lora, and IBM Plex Sans. These variable TTF files are vendored without modification; Ember reuses the existing Manrope assets.

npm dependencies retain their individual licenses, included in their installed packages and recorded in `package-lock.json`.
