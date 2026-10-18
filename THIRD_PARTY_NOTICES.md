# Third-party notices

## PDF.js 6.4.299

Copyright Mozilla Foundation and contributors. Distributed under Apache License 2.0. The full license is included in `vendor/pdfjs/LICENSE`. The unmodified upstream library, worker, viewer CSS, character maps, standard fonts, ICC profile and WebAssembly decoders are bundled locally. Font-specific licenses and decoder notices supplied by the package are preserved in their respective directories.

Official project: https://github.com/mozilla/pdf.js

Pinned npm tarball: https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.4.299.tgz

Verified SHA-512 package integrity: `sha512-AVl138zALtfaAPvADulE0PZThbYzCBS79nL4pOSL/6Sm/4AH5A21BD9VHt97OlCuzJuCpmeZtAtkinisF4Vb1g==`

Only the listed library files and data assets were copied from the package. No CDN or npm installation is needed to use the extension. Our integration (`pdf.html`, `pdf.css`, `pdf.mjs`) is separate from the unmodified library.

## Test fixture

`tests/sample.pdf` is an original three-page test fixture by Hover Arabic contributors: two text pages followed by an intentional blank page. It contains no user data and is MIT licensed with the extension. Embedded DejaVu Sans font subsets retain their upstream font license, included in `tests/FONT_LICENSE.txt`. The sample PDF previously downloaded during development is not distributed.

The extension's own source remains MIT licensed; see `LICENSE`.
