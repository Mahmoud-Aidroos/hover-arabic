# Publish Hover Arabic on GitHub and Chrome Web Store

Publisher: Hover Arabic project  
Public contact: aidroos7@gmail.com

## Current state

These materials were prepared before first publication. Check the repository Releases page and the official Chrome Web Store listing for current availability. Prepared files alone do not mean a release or store listing has been published.

## 1. GitHub — public source and free manual download

1. Connect the GitHub integration in Codex, or sign in to your GitHub account.
2. Create a public repository named `hover-arabic` under your account (or a project organisation you control).
3. Upload the contents of `source/` to the repository root. This includes the extension, source, MIT license, upstream notices, tests, privacy policy and packaging helper. No personal provider credentials are included.
4. Create a release tagged `v2.3.0`, titled `Hover Arabic 2.3.0`.
5. Use RELEASE_NOTES.md as the release description. Attach `hover-arabic-v2.3.0.zip` and `SHA256SUMS.txt`. The store-only ZIP is intended for Google upload; publishing it as an extra asset is optional.
6. After the release exists, use its actual URL to share downloads. The repository's releases page is the permanent place to find new releases. Do not invent a GitHub username or URL before it exists.
7. Publish `privacy.html` with `privacy.css` from the source's docs folder using GitHub Pages (repository Settings → Pages → deploy from branch, `/docs`). This provides a public HTML privacy-policy URL. Pages may take time to deploy; open the resulting URL and verify it works before using it in the store.

Until a store listing is approved, users must extract the manual ZIP, go to `chrome://extensions`, enable Developer mode, Load unpacked, and choose the folder containing manifest.json. A public ZIP does not provide one-click installation or automatic store updates. The MIT license allows redistribution and improvements, subject to preserving notices; bundled third-party components retain their own licenses.

## 2. Chrome Web Store — easier installation after review

1. Open https://chrome.google.com/webstore/devconsole in your browser and sign in with the account you intend to use as the long-term owner.
2. Follow Google's developer registration, review its agreement and pay the one-time registration fee shown on the official page. Payment details and account verification are entered directly with Google, not in chat. Registration availability and account requirements are determined by Google.
3. Use **Hover Arabic project** as the public project/publisher name where appropriate and **aidroos7@gmail.com** as the support contact. Your account's required legal/contact details may differ from the public project name; complete those accurately.
4. Create a new item. Upload `hover-arabic-webstore-v2.3.0.zip`. Its manifest is at the ZIP root, as Google requires; do not upload the outer publishing-kit ZIP.
5. Fill the listing and single-purpose/permission explanations using STORE_LISTING.md. Use the real GitHub project URL and live privacy-policy URL created in step 1.
6. Upload the 128×128 icon and 440×280 promotional tile from store-assets, plus the 1280×800 real website screenshot. Add other screenshots only if they accurately represent the extension and meet the current size requirements.
7. Complete the privacy-practices form honestly, including online transmission of hovered/selected content, optional email and optional credentials. Review policy consistency, contact details and provider terms. Preparing these files is not certification that Google will approve every provider or permission.
8. Review the concrete final listing and choose the desired visibility, then submit for review. Google decides approval and timing. After approval, share the actual store listing URL so users can install through Chrome.

No publisher API key should be added to a distributed extension. MyMemory is the default no-key option; each user supplies their own optional Azure credentials. Translation service quotas and terms remain external dependencies. If you later run a shared paid translation backend, privacy, authentication, cost controls and this policy must be updated first.

## Checks before public links are announced

- Public download points to the release asset, not a local path or private chat.
- Public source and runtime archives contain no real API credentials or browser profiles.
- Hosted privacy page is reachable without signing in.
- Published listing uses the intended project name/contact address.
- Chrome installation and first-use Enable automatic translation work.
- A public or store release has actually been created; preparation alone is not publication.

Official guidance: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases and https://developer.chrome.com/docs/webstore/register
