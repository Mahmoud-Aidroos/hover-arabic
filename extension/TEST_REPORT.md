# Hover Arabic 2.3 — test report

Tested on **18 October 2026**, Linux, Google Chrome **155.0.8059.84**. The actual unpacked Manifest V3 extension ran in a disposable headless Chrome profile, with a demo server bound to 127.0.0.1. No existing browser profile was changed. The source and final ZIP contain **no offline dictionary or bundled word list**.

## Public-release checks

Version 2.3.0 adds project icons, a local privacy policy with the confirmed project/support contact, and an affirmative first-use enable choice. New installations and upgrades with no recorded choice remain paused. The worker independently refuses translation before that choice. No shared provider key is embedded.

- **25 website browser checks passed**, including the new no-transmission-before-enabling check, local privacy-page check, the full existing website flow and real MyMemory translation.
- **15 local-PDF regression checks passed** after enablement.
- **16 unit test groups passed**, including worker enforcement of the first-use choice.
- Store screenshots were captured from the actual extension at 1280x800. The icon is PNG with a 128px version, and the promotional tile is 440x280.
- Store and manual packages are built separately: the store ZIP puts manifest.json at its root; both runtime packages exclude browser profiles, tests, test screenshots and personal API settings. The separate source archive retains tests and license notices.

These are local preparation/verification results. GitHub publication, hosted privacy-policy availability and Chrome Web Store review/approval require their respective accounts and are not claimed to have happened.

## Reported arXiv paper: 9 checks passed

Tested the exact user-reported PDF, `https://arxiv.org/pdf/2607.08383`, by downloading it directly into the extension reader. No source PDF is included in the ZIP.

1. Chrome's real extension action grants activeTab, and the actual **Translate this arXiv PDF** click handler transfers the active PDF URL into a new reader tab. For the URL-handoff portion, a test HTML response stands in for the source tab because headless Chrome's native PDF/popup UI is not exposed normally. The reader itself downloads the real paper from arXiv.
2. The actual paper loads, with ten pages and selectable first-page text.
3. **historical**, the word highlighted in the screenshot, is detected and sent alone to the translation service.
4. The same word works at **150% zoom** in the two-column layout.
5. **All ten pages** render with text layers.
6. URLs outside the supported arXiv origin are rejected with clear instructions rather than fetched.
7. Pasting the exact paper URL into the reader's link box loads it too.
8. A **live no-key MyMemory request** for historical returns Arabic (`تاريخي, عام`) and displays in the RTL popup.
9. No reader page errors occur during this flow.

`arxiv-preview.png` records the real live result in the user's paper. The original problem shown in the attachment is the Chrome built-in PDF viewer: scripts cannot translate its protected PDF content. This update makes the correct reader accessible directly from that tab instead of requiring a manual download/file-picker workflow. It does not inject translation into Chrome's native PDF viewer itself.

The new scope is limited to `activeTab` (current URL after invoking the extension) and `https://arxiv.org/*` for user-requested PDF downloads. Download requests omit cookies/referrers, enforce a 100 MB bound and a 30-second timeout, and validate that the response is a PDF. Third-party PDF hosts remain accessible through the local-file picker rather than broad network permissions.

## Website regression: 22 checks passed

1. Chrome accepts and loads the Manifest V3 extension.
2. Hover automatically requests online translation and renders Arabic with RTL direction.
3. Escape dismisses the popup.
4. Text split across inline formatting is recognized as one word.
5. Repeated hover uses the cached online result without another request.
6. An arbitrary English word translates through the provider without a dictionary lookup.
7. Editable inputs are skipped.
8. Whitespace does not snap to neighboring words.
9. Mouse selection opens the popup.
10. Alt-only mode, Alt-hover and release work.
11. Pause applies to already-open pages.
12. A popup near the viewport edge remains inside it.
13. Scrolling dismisses the popup.
14. Keyboard selection translates selected text.
15. Inherited srcdoc frames receive hover translation.
16. Settings persist with the no-key provider selected.
17. Clear-cache forces a subsequent hover to request a new translation.
18. A delayed online result cannot reopen a dismissed popup.
19. The provider form configures Azure POST requests and authentication headers; public settings exclude the key.
20. The real content-script context cannot read stored credentials through Chrome local storage.
21. A provider quota response produces a clear error and suppresses repeated requests during cooldown.
22. No webpage errors occur in the tested flow.
A separate optional live check was also passed during version 2.0 verification: a no-key HTTPS request to MyMemory translated `hello` to `مرحبًا`. Version 2.1 additionally passed the live PDF-hover check described below.

Checks 1–22 run the real extension with deterministic provider responses substituted inside its background worker. The optional live check restores the real fetch implementation and contacts MyMemory. The final 2.1 website regression run used deterministic responses, and its separate PDF run included a real network translation. Azure was tested with a fake test key and simulated responses; **no live Azure credential was available**, so live Azure authentication, account eligibility and billing were not tested.

The live test exposed a MyMemory result using legacy Arabic presentation forms. The implementation now accepts/normalizes Arabic presentation forms and prefers a near-exact modern-Unicode alternative when supplied by that service. Regression tests cover both cases. This does not guarantee translation quality for arbitrary words.

`preview.png` is the website test screenshot with a simulated Arabic result. `pdf-preview.png` shows the local-PDF deterministic test result; `arxiv-preview.png` shows the real MyMemory translation for historical. Both were visually inspected for Arabic right alignment and layout.

## Local PDF reader: 15 regression checks passed; prior live check also passed

The PDF suite opens the actual reader through the settings button and selects the bundled PDF through the real Open PDF file picker. It verifies:

1. The settings button opens the extension-local reader tab.
2. The PDF renders locally with selectable text; opening it alone makes no translation request, upload or CDN request.
3. Hover sends only the word under the pointer and displays RTL Arabic.
4. Escape dismisses the popup.
5. Repeated PDF hover uses the shared online-result cache.
6. Mouse selection translates the selected PDF phrase.
7. Page navigation replaces visible/selectable text and preserves hover behavior.
8. Zoom regenerates the text layer and keeps hover hit-testing usable.
9. A blank page produces the no-text/OCR message.
10. Pause/resume from settings updates an already-open reader.
11. Toolbar labels and filenames do not cause translation requests.
12. A malformed PDF produces a readable error.
13. A valid PDF can be reopened after that error.
14. Responsive fit-width resizing preserves usable text and hover.
15. No page errors, document uploads or CDN requests occur during the deterministic PDF flow.
The optional live `Hello` check also passed in version 2.1. The version 2.2 final run used the 15 deterministic local-PDF checks plus the live historical check in the actual arXiv paper above.

Tests 1-15 use simulated provider responses while real PDF.js parsing, rendering and text selection run inside the extension. The optional check restores real network fetch; version 2.2 live coverage uses the actual arXiv paper. No full PDF, filename or file path is sent to MyMemory. The sample has two pages of selectable text with embedded DejaVu Sans fonts, followed by an intentional blank page. All three PDF pages were also rendered with Poppler and visually inspected. A standard-font sample was tested during development before the embedded-font fixture was finalized.

Mozilla PDF.js 6.4.299 was downloaded from the official npm distribution, pinned and verified using its registry SHA-512 integrity. Its unmodified runtime, worker, data/decoder assets and required licenses are bundled locally. Version 2.1 needed no additional API permission. Version 2.2 adds narrowly used activeTab and arXiv host access as described above. Chrome 140+ is required by this build; the actual test browser was Chrome 155. Large PDF limits, password failures and unusual production PDFs were not exhaustively tested. Password handling is deliberately limited to an unlocked-copy error message; OCR, PDF editing and form/annotation interaction are not included.

## Core/background: 15 test groups passed

- Input normalization, English case preservation, apostrophes, length boundaries, rejected scripts/punctuation and word offsets.
- Automatic credential-free MyMemory request and cached repeat, with no manual-online flag or local dictionary lookup.
- Deduplication of simultaneous requests for the same word.
- 24-hour expiry and explicit clearing.
- Session-cache restoration and 500-entry bound.
- Trusted-only storage and nonsecret public settings.
- Official Azure POST URL, English→Arabic parameters, key/region headers and no URL key.
- Missing Azure credentials, paused translation and invalid inputs cause no request.
- Provider/credential changes invalidate old cache and notify open pages without secrets.
- Clearing cache during a request invalidates its result.
- Quota/access errors trigger cooldown; failures are never cached.
- HTTP failures, network errors, malformed JSON and non-Arabic results are handled.
- Timeout aborts fetch and returns a readable error (accelerated clock in the test).
- Legacy Arabic glyph response can use a near-exact modern Arabic alternative.
- Presentation forms normalize even when no alternative exists.

These tests execute the shipped background worker with mocked Chrome APIs and fetch responses. Expiry and worker-restoration tests simulate elapsed time/storage rather than waiting 24 hours or restarting a physical browser.

## Other verification

All JavaScript files passed syntax checks. Manifest JSON parsed successfully. No dictionary file is present. ZIP integrity and file listing were checked after packaging. No credentials or user data are shipped; fake strings in tests are test fixtures.

## Reproduce

With Node.js 22+ and a compatible installed Chrome, from the extracted extension folder:

```sh
node tests/unit.cjs
npm install --no-save playwright
node tests/browser.cjs
node tests/pdf-browser.cjs
# Network test of the actual public arXiv paper:
node tests/arxiv-browser.cjs
# Optional real network check using only the public word "hello":
LIVE_TRANSLATION=1 node tests/browser.cjs
LIVE_TRANSLATION=1 node tests/pdf-browser.cjs
LIVE_TRANSLATION=1 node tests/arxiv-browser.cjs
```

The live check depends on provider/network availability and uses provider quota. Normal installation requires none of these test dependencies. See README for manual installation, provider configuration and the local demo.

These checks do not establish exhaustive website compatibility, provider uptime, free-tier eligibility, private-network Azure support or comprehensive linguistic accuracy. Protected browser pages, image/canvas text and closed shadow-root content remain unsupported, as documented in README. The included PDF reader exposes a selectable text layer; Chrome’s own PDF viewer remains outside this extension’s hover injection.
