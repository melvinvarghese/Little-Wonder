"""Recreate the 60 local illustrations from the reviewed original sheets.

Requires Pillow. Row boundaries are art-directed: generated sheets are not
perfectly uniform grids. Fit each complete crop into a consistent plate.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
# Pixel measurements made against the source images; preserve the full objects.
ROWS = {
    'thinking-room': [0, 453, 901, 1348, 1776, 2304],
    'between-the-lines': [0, 455, 892, 1328, 1765, 2304],
    'curious-past': [0, 462, 883, 1289, 1772, 2304],
    'natures-secrets': [0, 448, 876, 1304, 1758, 2304],
    'beyond-obvious': [0, 427, 827, 1285, 1713, 2304],
    'unanswered': [0, 421, 871, 1307, 1749, 2304],
}
records = []
for category, edges in ROWS.items():
    source = ROOT / 'assets/specimens/sheets' / f'{category}.png'
    sheet = Image.open(source).convert('RGB')
    assert sheet.size == (1536, 2304), (source, sheet.size)
    articles = json.loads((ROOT / 'content' / f'{category}.json').read_text())
    assert len(articles) == 10
    for i, article in enumerate(articles):
        row, col = divmod(i, 2)
        box = (col * 768 + 4, edges[row] + 4,
               (col + 1) * 768 - 4, edges[row + 1] - 4)
        crop = sheet.crop(box)
        # Pure geometric padding; no generated content or subject manipulation.
        plate = Image.new('RGB', (600, 360), crop.getpixel((0, 0)))
        fit = ImageOps.contain(crop, (576, 336), Image.Resampling.LANCZOS)
        plate.paste(fit, ((600 - fit.width) // 2, (360 - fit.height) // 2))
        target = ROOT / 'assets/specimens' / f'{article["id"]}.webp'
        plate.save(target, 'WEBP', quality=86, method=6)
        assert target.stat().st_size < 100_000, target
        records.append((category, article['id'], target.stat().st_size))
assert len(records) == 60 and len({r[1] for r in records}) == 60
lines = [
    '# Little Wonder specimen artwork', '',
    'Sixty original interpretive illustrations, one for each discovery. All images are stored locally; readers do not contact an image service.', '',
    '## Provenance', '',
    'Six original category sheets were generated for Little Wonder with GPT Image 2.5 at medium quality. No third-party reference images were incorporated. The source PNGs in `assets/specimens/sheets/` are each 1536 × 2304 pixels. Palette: mineral blue, marigold and vermilion on pale blue-white paper. The style is an interpretive ink-and-stipple notebook treatment, not scientific evidence or historical reconstruction.', '',
    'The sheets do not have perfectly equal rows. `scripts/crop-specimens.py` uses visually reviewed row boundaries, then proportionally fits each crop into a 600 × 360 WebP plate with a small margin. It does not stretch or invent image content. Run it with Python and Pillow to recreate the assets.', '',
    '## Article files', '',
    '| Collection | Article ID | File size |', '|---|---|---:|',
]
for category, article_id, size in records:
    lines.append(f'| {category} | `assets/specimens/{article_id}.webp` | {size:,} bytes |')
lines += ['', f'Verified: {len(records)} unique article illustrations, each 600 × 360 pixels and under 100 KB.', '']
(ROOT / 'assets/SPECIMENS.md').write_text('\n'.join(lines))
print(f'Recreated {len(records)} complete 600 × 360 specimen plates.')
