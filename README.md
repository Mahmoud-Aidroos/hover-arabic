# Hover Arabic

English-to-Arabic translation on hover for websites and selectable PDFs.

Publisher: **Hover Arabic project**  
Support: **aidroos7@gmail.com**

## Features

- Automatic hover translation after an explicit first-use enable choice.
- Arabic RTL popups, short text selection and optional Alt-only mode.
- Local PDF reader with zoom and page navigation.
- Open arXiv PDFs from the current tab or a pasted PDF link.
- Session caching; free no-key MyMemory and optional personal Azure credentials.
- No offline dictionary, advertising, analytics or publisher-operated translation backend.

## Install a download

Download the manual ZIP from the [Releases page](https://github.com/Mahmoud-Aidroos/hover-arabic/releases), extract it and keep the folder. Open `chrome://extensions`, enable Developer mode, choose Load unpacked and select the `hover-arabic` folder containing manifest.json. Click the icon, read the disclosure and choose Enable automatic translation. Chrome 140+ is required.

After cloning the GitHub repository, first run `python3 tools/vendor_pdfjs.py` to download the pinned, checksum-verified Mozilla PDF.js dependency, then load the `extension` folder. The manual release ZIP and full source ZIP already bundle it and need no download/build step. A Chrome Web Store URL will be added only after a listing is actually approved and public.

PDFs use the included reader, not Chrome's protected native PDF viewer. Scanned images require OCR, which is not included. Provider quotas and translation quality vary.

## Privacy

[Privacy policy](PRIVACY.md). Uncached hovered/selected text goes to the chosen online provider; the full PDF does not. Optional user email and Azure credentials stay in local settings and go only to their configured service as described in the policy. Do not embed shared production credentials in a distributed extension.

## Development and release

No build is needed to run the extension. Full setup and tests: [extension/README.md](extension/README.md). Run `node extension/tests/unit.cjs` for core tests and install Playwright only if you want browser tests. `python3 BUILD_RELEASE.py` creates clean manual/store packages under dist/. [Publishing guide](PUBLISHING.md) and [release notes](RELEASE_NOTES.md) are included.

## License

Own source: MIT. Bundled PDF.js and data assets retain their upstream licenses. See [LICENSE](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md). This is an independent project, not affiliated with EasyLingo or the external providers.
