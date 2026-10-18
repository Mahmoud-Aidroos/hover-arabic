# Hover Arabic 2.3 — public release

An EasyLingo-style English → Arabic Chrome extension for Ubuntu, using Manifest V3. Hover an English word on a website or in the included PDF reader and its Arabic translation appears automatically in a small right-to-left popup. Text selection is also supported. **There is no offline dictionary, no bundled word list and no manual translation button.** Previously fetched online results can be reused from the session cache.

## Install on Ubuntu

Already using an older version? See the update instructions at the end of the PDF section below to preserve your provider settings.

1. Extract `easylingo-arabic.zip` into a **fresh, permanent folder**. Do not extract over the old offline version, which could leave its unused dictionary file behind.
2. Open `chrome://extensions`. If upgrading, remove the old **Hover Arabic — Offline Translator** entry first.
3. Enable **Developer mode**, click **Load unpacked**, and select the new `easylingo-arabic` folder containing `manifest.json`.
4. Pin **Hover Arabic — Online Translator** through Chrome's puzzle-piece Extensions menu.
5. Click the extension icon, read the privacy notice and choose **Enable automatic translation**. New installations and upgrades without a recorded choice stay paused until you enable them. The choice is optional, and you can pause translation any time.
6. Reload any already-open webpages. Hover over an English word for about **650 ms**. MyMemory works without credentials by default, subject to its availability and usage limits.

Chrome 140 or newer is required; tested with Chrome 155 on Linux. No compilation, npm packages or terminal commands are needed for installation. Keep the extracted folder because Chrome runs the extension from it. Chrome may show an unpacked-extension reminder. Managed browsers can prohibit developer mode or site access.

## Translate words inside a PDF

Chrome's built-in PDF viewer does not allow this extension's hover script to access its words. Version 2.1 introduced a separate **PDF reader inside the extension**.

**For an arXiv PDF already open in Chrome:**

1. Keep the arXiv PDF tab active, for example `https://arxiv.org/pdf/2607.08383`.
2. Click the Hover Arabic extension icon, then **Translate this arXiv PDF**.
3. The paper opens in the extension reader automatically. Hover a word there for Arabic translation.

Alternatively, click **Open PDF reader**, paste the arXiv PDF link into **arXiv PDF link**, and click **Open link**. The link box is also useful when opening the full settings page instead of the toolbar popup. Direct online opening is restricted to HTTPS `arxiv.org/pdf/` links; other domains are not fetched.

**For a PDF saved on your computer or from another website:**

1. Save/download it first if necessary.
2. Click the extension icon, then **Open PDF reader**.
3. In the reader tab, click **Open PDF** and choose the saved file.
4. Hover a word or select a short phrase. The same provider, Arabic RTL popup, cache and settings are used.

The original Chrome PDF tab will still have Chrome’s normal toolbar. Translation works in the newly opened reader tab, which has the **Hover Arabic** heading and green **Open PDF** button.

Use the arrow buttons or page-number field to change pages. Choose **Fit width** or a zoom level. **Translation settings** opens the same provider/settings page. Pause, resume, provider changes and other settings also apply to an already-open reader.

Your PDF is parsed/rendered locally with bundled Mozilla PDF.js **6.4.299**. When using an arXiv link, the reader first downloads that PDF directly from arXiv over HTTPS, omitting cookies and referrer; it does not upload the document to the translation provider. The file, filename and file path are never uploaded by this reader. Only hovered words or selected text go to the configured translation provider. Opening the file alone does not request a translation. Reader controls and filenames do not trigger hover translation. No file-URL access setting, CDN or account is needed to read a local file. Version 2.2 adds `activeTab` to read the current PDF URL when you click the extension, and host access only to `https://arxiv.org/*` for the direct arXiv download. Downloads time out after 30 seconds and are limited to 100 MB. If downloading fails, save the file in Chrome and use Open PDF.

The reader shows one page at a time to limit memory. Files up to **100 MB** are accepted. It supports selectable text, including embedded fonts. Password-protected PDFs need an unlocked copy. Image-only/scanned pages show a message and require OCR, which is not included. It is a reading/translation view, not a PDF editor: interactive forms, annotations, attachments, embedded JavaScript, print controls and PDF links are not provided. Large or unusually structured PDFs may still render differently; select a phrase if a word is split unusually.

To update while preserving your provider configuration, keep the existing extension folder path, replace its contents with the new ZIP's `easylingo-arabic` contents, click **Reload** on its card at `chrome://extensions`, and reload web/PDF-reader tabs. Reopen your PDF file after reloading. If installing into a different folder, remove the old extension and load the new one; re-enter settings if needed.

## Choose a provider

Click the extension's toolbar icon. General switches and hover delay save immediately. Provider and credential changes take effect after **Save provider**.

| Provider | Setup | Best use |
| --- | --- | --- |
| **MyMemory** (default) | No API key or account required. Optional contact email. | Free, light personal use and quick setup. Quotas and service availability apply. |
| **Azure Translator** (recommended for regular use) | Azure account, Translator resource, API key and usually resource region. | An official supported translation API with a substantial free tier. |

No provider switching happens automatically. A failed request shows an error; you can change the provider in settings. Only the selected provider receives each new lookup. No unofficial Google Translate scraping endpoint is used.

### Free option: MyMemory

Select **MyMemory · free, no key**, leave the email blank, and click **Save provider**. That is all the configuration needed.

An optional contact email is sent using the provider's `de` parameter. MyMemory may grant different limits with an email; consult its current [usage limits](https://mymemory.translated.net/doc/usagelimits.php) and [API documentation](https://mymemory.translated.net/doc/spec.php). Exact daily allowances are not hard-coded or promised here. Service quality varies by word and context. An isolated word can have several correct translations.

### Recommended free tier: Azure Translator

As checked on 18 October 2026, Microsoft lists **2 million characters per month** on Translator's **F0 free tier**. Check [current pricing](https://azure.microsoft.com/en-us/pricing/details/translator/) and your account's eligibility. Choose **F0**, not a paid S1 tier, if you want to stay within the free offering. Azure account signup may require billing verification. Free-tier availability is an account/provider decision; the extension cannot create the resource for you.

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Create a **Translator** resource (a single-service Translator resource is simplest). Select a subscription, resource group, supported region and **F0** pricing tier where available.
3. After deployment, open the resource's **Keys and Endpoint** page. Copy **Key 1** (or Key 2) and the location/region identifier, such as `westeurope` or `eastus`.
4. In the extension settings, choose **Azure Translator**.
5. Paste the key into **Azure Translator API key**. Enter the matching region identifier into **Resource region**. For a global single-service resource, leave region blank. Regional and multi-service resources need their actual region. Enter the region, not an endpoint URL or a display name such as “West Europe.”
6. Click **Save provider**, return to a webpage and hover a word. The popup footer identifies **Azure Translator**.

The extension uses the public standard text endpoint `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=ar&textType=plain`. The key is sent in `Ocp-Apim-Subscription-Key`; a configured region goes in `Ocp-Apim-Subscription-Region`. It is never placed in a URL. Private-network/custom-endpoint-only resources are not supported by this build. See Microsoft's [authentication documentation](https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/authentication) and [Translate API](https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/v3/translate).

If you receive access errors, confirm the key belongs to a Translator-enabled resource, the region matches and the resource has remaining quota. Rotate keys in Azure when needed, then replace the stored key and save again. To remove a stored key, select MyMemory, clear the key field (temporarily select Azure to reveal it if necessary), return to MyMemory, and save. Removing the extension clears its settings as well.

**Personal-use credentials:** keys are stored locally in Chrome extension storage, without encryption or account sync. Webpage content scripts cannot read that storage. It is still not a secure vault against someone who controls your computer or browser profile. Never distribute a copy with a shared production key. A public multi-user release should use a controlled backend with authentication and limits instead of embedding a shared credential.

## Hover, selection and popup behavior

- Hover an English word; after the configured delay, the popup displays “Translating online…” and then the Arabic result. No click is required.
- Select one word or a short English phrase (up to **160 characters**) with the mouse. Shift + Arrow selection is supported too.
- Arabic uses `dir="rtl"`, `lang="ar"` and right alignment. Results are inserted as plain text, never interpreted as HTML.
- Press **Escape**, scroll, click elsewhere or leave the word/popup to dismiss. Delayed responses cannot reopen a dismissed popup or replace a newer result.
- **Require Alt** is optional. Hold Alt while moving over the word; release it to dismiss. If Ubuntu's window manager intercepts Alt, turn the setting off.
- The toolbar settings provide pause, hover/selection switches, Alt-only mode, delay, provider setup and **Clear translation cache**. Changes apply to open pages immediately.
- Words split across inline formatting, such as `<b>trans</b>lation`, are joined within their text block. Apostrophes and hyphens are supported. English case is preserved for the service and cache so `US` and `us` are distinct. Legacy Arabic presentation forms are normalized; when MyMemory supplies a near-exact alternative in modern Arabic Unicode, it is preferred over a legacy glyph record.

## Cache and request controls

- Only successful online translations are cached; there is no preloaded vocabulary and no local translation engine.
- Up to **500** results, keyed by provider, language pair and case-sensitive normalized text; **24-hour expiry**. Least-recently-used entries are evicted first during an active worker lifetime.
- Cache lives in `chrome.storage.session`, in browser memory. It survives service-worker suspension/restart but clears on browser restart, extension reload/update, removal, provider/credential changes, pause/resume or **Clear translation cache**. It is not saved as browsing history on disk by the extension.
- A valid cache hit makes no network request. It is labeled **cached** in the popup; a fresh result is labeled **online**.
- Simultaneous requests for the same text share one request. There are at most three active requests, with starts spaced by at least 350 ms, plus the hover delay.
- Requests time out after ten seconds. Rate/quota errors trigger cooldown instead of repeated automatic retries. No failed result is cached. A request already sent may finish after you move away; its result can enter the session cache, but it cannot reopen the popup. Clearing cache or changing provider invalidates in-flight results.

## Privacy and permissions

This version sends words **automatically** on hover, as requested. Pause it or use Chrome's per-site access controls on sensitive websites.

The chosen provider receives only the hovered word or selected English text, your network IP address and the language pair. MyMemory puts the text in its request URL and receives your email if configured; Azure receives the text in a JSON POST body and your configured authentication headers. Providers can log requests under their own policies. No page URL, surrounding paragraph, browsing history or cookies are sent by the extension. Requests omit credentials and referrers. Provider-side logging is outside the extension's control.

Permissions:

- **storage** for settings/credentials locally and online-result cache in session memory. Both storage areas are restricted to trusted extension contexts; content scripts obtain only nonsecret settings through messages.
- Content scripts on HTTP/HTTPS sites to detect words and selections, including inherited `about:blank`/`srcdoc` frames. Chrome may describe this as access to website data. The `activeTab` permission grants temporary access to the current tab URL when you invoke the extension, used by Translate this arXiv PDF. No broad `tabs`, history, clipboard or file-URL permission is requested.
- Host access to `https://api.mymemory.translated.net/*` and `https://api.cognitive.microsofttranslator.com/*` for the configured translation provider, plus `https://arxiv.org/*` to download papers only when you open an arXiv link or use the current-PDF button. Host access does not itself cause requests to the unselected provider.

No analytics, remote executable code, account synchronization or translation history is included. Input controls, textareas, selects, editable areas and role=textbox regions are skipped. The popup's closed Shadow DOM isolates layout; it is not a security boundary against the page.

MyMemory: [API](https://mymemory.translated.net/doc/spec.php), [terms](https://mymemory.translated.net/doc/en/tos.php). Azure: [Translator overview](https://learn.microsoft.com/en-us/azure/ai-services/translator/overview).

## Test the extension

A test page is included in `tests/demo.html`. To serve it as a normal webpage, open a terminal in the extracted extension folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/tests/demo.html`. Hover a word, hover the formatted word, select a phrase, test fields that should be skipped, then try Escape, scrolling, pause, Alt-only mode and the bottom-right word. Real manual tests contact your configured provider and consume its quota. Stop the server with Ctrl+C.

Optional developer tests with Node.js 22+ and compatible installed Chrome:

```sh
node tests/unit.cjs
npm install --no-save playwright
node tests/browser.cjs
node tests/pdf-browser.cjs
# Downloads the specific public paper reported by the user:
node tests/arxiv-browser.cjs
# Also contact the real MyMemory service with the public word "hello":
LIVE_TRANSLATION=1 node tests/browser.cjs
LIVE_TRANSLATION=1 node tests/pdf-browser.cjs
LIVE_TRANSLATION=1 node tests/arxiv-browser.cjs
```

The website and local-PDF tests run the real extension with deterministic provider responses substituted in its background worker. The optional live checks restore actual fetch and call MyMemory. The PDF test opens the included three-page sample and verifies rendering, hover, selection, navigation, zoom, settings, cache, error recovery and that no document or CDN requests occur. They use a temporary profile and a loopback-only HTTP test server, not your normal browser profile. Set `CHROME_BIN` for another compatible Chrome executable. The test-only `--no-sandbox` flag is for disposable container sessions; normal installation uses no browser flags. No npm packages are needed to run the extension itself. The arXiv test downloads the public ten-page paper at `https://arxiv.org/pdf/2607.08383` and checks historical at 150% zoom, every page, the active-tab button and pasted-link entry. Its toolbar test triggers Chrome’s real browser action, then runs the real settings handler; headless Chrome does not expose its native popup as a normal test page. No copy of that paper is redistributed. See `TEST_REPORT.md` for actual results and limits.

## Limitations and troubleshooting

- Website hover works with visible, selectable DOM text on ordinary HTTP/HTTPS pages. PDF hover works inside the included reader, not Chrome’s built-in PDF viewer. Chrome internal pages, Chrome Web Store, other applications, image/canvas text and videos remain unsupported. Open local PDFs with the reader’s file picker; this extension does not inject scripts into arbitrary local file URLs. There is no OCR.
- Closed shadow-root content is unsupported; complex web components and unusual text layouts may require selecting the text. Text blocks over 12,000 characters fall back to the current text node. Frames constrain their own popup; small frames can clip it.
- English letters, internal apostrophes/hyphens and spaces are accepted. Mixed scripts, digits and punctuation-heavy selections are rejected. Select just the English words.
- Missing popup: reload the webpage, check Enable translation and Chrome site access, disable Alt-only, and test the supplied demo.
- Internet/service failure: uncached text cannot translate. Check connectivity, provider settings, quota and the popup's error. Wait for cooldown or switch provider explicitly. Previously cached online results may still display until expiry/clear.
- After editing source, click **Reload** at `chrome://extensions` and reload webpages. Do not use a stale page's content script after extension reload.

## Source

`manifest.json`: Manifest V3 permissions/injection. `core.js`: shared validation and word offsets. `content.js`: hover/selection and RTL popup. `background.js`: online providers, trusted storage, cache and request controls. `settings.*`: provider setup and controls. `tests/`: reproducible tests and demo. MIT licensed, independently developed and not affiliated with EasyLingo. `pdf.html`, `pdf.css` and `pdf.mjs` implement the local PDF reader. Mozilla PDF.js and its worker/fonts/decoders are bundled under `vendor/pdfjs`, with Apache 2.0 and other upstream notices preserved in `THIRD_PARTY_NOTICES.md`. The extension’s own source is MIT licensed. No provider SDKs, translation word lists or offline dictionary files are bundled.

[Chrome unpacked-extension installation](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

## Public project and support

Publisher: **Hover Arabic project**. Public support email: **aidroos7@gmail.com**. Read [the privacy policy](PRIVACY.md) for the online-data flow, providers, local storage and your choices. Public download and store URLs are announced only after the corresponding releases are actually published.
