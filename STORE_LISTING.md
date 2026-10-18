# Chrome Web Store listing — prepared text

Publisher name: **Hover Arabic project**

Public support email: **aidroos7@gmail.com**

Extension name: **Hover Arabic — Online Translator**

Short description (also in manifest):

> Translate hovered English words into Arabic on websites and PDFs. Includes an arXiv reader, RTL popups and online caching.

Suggested category: Productivity / Tools, using the closest current dashboard category.

## Detailed description

Read English with Arabic meanings at your pointer. Hover Arabic translates the English word you hover over, or a short phrase you select, into Arabic in a small right-to-left popup.

Features:

- Automatic translation on hover, after you choose to enable it.
- English text selection and optional Alt-only hover.
- A PDF reader with selectable text, page navigation and zoom.
- Direct arXiv PDF opening from the active paper tab or a pasted PDF link.
- A session cache for repeated lookups.
- MyMemory works without a key for light personal use. Azure Translator is optional and uses your own API key and subscription.

Privacy:

Before enabling translation, you see an explanation of what is sent. Hovered words or selected text are sent to your chosen online provider; its usage limits and privacy terms apply. The full PDF, filename and surrounding paragraph are not sent to the translation provider. No analytics, advertising or publisher-operated translation server is included. You can pause translation or restrict site access in Chrome.

PDFs selected from your computer render locally. An arXiv link is downloaded directly from arXiv when requested. Translation inside PDFs runs in the extension's reader, not Chrome's built-in PDF viewer. Scanned images need OCR, which is not included. Other PDF websites can be used by saving the file and choosing Open PDF.

Chrome 140 or newer is required. Translation is online only; there is no offline dictionary. Provider availability, quota and translation quality vary. No shared developer key is included, so optional paid-provider usage belongs to the user's account. Independently developed; not affiliated with EasyLingo, Google, Microsoft, MyMemory, Mozilla or arXiv.

Support: aidroos7@gmail.com

## Single purpose

Help users understand English by translating hovered or selected English text into Arabic on webpages and in the included PDF reader.

## Permission explanations for dashboard fields

- **storage:** Keep preferences, affirmative first-use choice and user-supplied provider settings on the device; cache successful translations in session memory. Trusted extension contexts only.
- **activeTab:** Read the active tab's URL when the user invokes the extension, so Translate this arXiv PDF can transfer the requested paper into the reader.
- **HTTP/HTTPS content-script matches:** Identify hovered/selected visible English text on the sites where the user wants translation. Site access can be limited using Chrome controls. Editable fields are excluded.
- **api.mymemory.translated.net:** Send uncached text to the default no-key translation provider when enabled.
- **api.cognitive.microsofttranslator.com:** Send text using the optional Azure provider and the user's credentials, only when configured and selected.
- **arxiv.org:** Download an arXiv paper when the user opens an arXiv PDF link or invokes Translate this arXiv PDF.
- **wasm-unsafe-eval CSP token:** Permit bundled PDF.js image/colour decoders to run local WebAssembly; it does not permit remote JavaScript or JavaScript eval. PDF.js, workers and decoder assets are bundled, not loaded from a CDN.

Remote code: **No remote executable code.** Requests fetch translation data or a user-requested PDF, not JavaScript. Local PDF rendering does not execute embedded PDF JavaScript.

## Privacy-practices form notes

Use the current dashboard definitions and keep them consistent with PRIVACY.md. Do not simply claim that no data is handled: uncached hovered/selected content goes to the configured provider.

Relevant data handled includes website/user-selected content, the optional MyMemory contact email, optional Azure authentication information, provider-visible network IP, and the arXiv PDF URL used for a requested download. The publisher does not receive browsing history or operate an analytics/translation backend. Local-only storage and third-party transfers are distinguished in the policy. There is no sale of extension data, targeted advertising, creditworthiness use or unrelated profiling. Review each dashboard question against these actual behaviours.

## URLs and final submission

After GitHub publication, set the official project/support URL to the real public repository and the privacy-policy URL to the publicly accessible hosted policy. Do not enter a local file path or this chat's download link. Prefer a GitHub Pages HTML policy page; a public repository policy document can also be linked if accepted by the dashboard.

Account registration, fee payment and agreement acceptance must be completed by the account owner. Complete any identity/contact verification shown by Google. Upload the store ZIP, the 128px icon, the 440×280 promotional image and a real 1280×800 screenshot. Review the final listing, then submit it to Google. Approval and publication are not guaranteed or completed by preparing this package.

Official references:

- https://developer.chrome.com/docs/webstore/register
- https://developer.chrome.com/docs/webstore/prepare
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/webstore/publish
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
