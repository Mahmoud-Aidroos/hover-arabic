"""Fetch the pinned, integrity-checked PDF.js assets for a source checkout.

Release ZIPs already contain these files; this is only needed after cloning
from GitHub, where generated third-party runtime assets are not checked in.
"""
from pathlib import Path
import urllib.request, hashlib, base64, tarfile, io
VERSION='6.4.299'
INTEGRITY='sha512-AVl138zALtfaAPvADulE0PZThbYzCBS79nL4pOSL/6Sm/4AH5A21BD9VHt97OlCuzJuCpmeZtAtkinisF4Vb1g=='
URL=f'https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-{VERSION}.tgz'
root=Path(__file__).resolve().parents[1]/'extension/vendor/pdfjs'
with urllib.request.urlopen(URL,timeout=60) as response:
    payload=response.read()
actual='sha512-'+base64.b64encode(hashlib.sha512(payload).digest()).decode()
if actual != INTEGRITY:
    raise RuntimeError('PDF.js checksum mismatch; no files were installed.')
with tarfile.open(fileobj=io.BytesIO(payload),mode='r:gz') as archive:
    for member in archive.getmembers():
        name=member.name.removeprefix('package/')
        if not member.isfile() or '..' in Path(name).parts or Path(name).is_absolute():
            continue
        if name in {'build/pdf.mjs','build/pdf.worker.mjs','web/pdf_viewer.css','LICENSE','package.json'} or name.startswith(('cmaps/','standard_fonts/','wasm/','iccs/')):
            file=root/name
            file.parent.mkdir(parents=True,exist_ok=True)
            file.write_bytes(archive.extractfile(member).read())
print(f'PDF.js {VERSION} installed with verified SHA-512 integrity.')
