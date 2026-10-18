from pathlib import Path
import json, zipfile, hashlib
root=Path(__file__).resolve().parent
app=root/'extension'
out=root/'dist';out.mkdir(exist_ok=True)
manifest=json.loads((app/'manifest.json').read_text())
version=manifest['version']
assert len(manifest['description'])<=132
files=[f for f in app.rglob('*') if f.is_file() and f.relative_to(app).parts[0] not in {'tests','.git','node_modules'} and not f.name.endswith('preview.png') and f.name!='TEST_REPORT.md']
for name,prefix in [(f'hover-arabic-v{version}.zip','hover-arabic/'),(f'hover-arabic-webstore-v{version}.zip','')]:
    with zipfile.ZipFile(out/name,'w',zipfile.ZIP_DEFLATED) as z:
        for file in sorted(files): z.write(file,prefix+file.relative_to(app).as_posix())
    with zipfile.ZipFile(out/name) as z: assert z.testzip() is None
    print(out/name)
(out/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(f.read_bytes()).hexdigest()+'  '+f.name+'\n' for f in sorted(out.glob('*.zip'))))
