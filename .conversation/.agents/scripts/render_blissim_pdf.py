import fitz
from pathlib import Path
src = Path('attached_assets/Blissim_Analytics_–_Spec_Gestion_Utilisateurs_1790071866490.pdf')
out = Path('.agents/outputs/blissim_pdf')
doc = fitz.open(src)
print(f'pages={doc.page_count}')
all_text = []
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pix.save(out / f'page-{i+1:02d}.png')
    text = page.get_text().strip()
    all_text.append(f'\n--- PAGE {i+1} ---\n{text}\n')
    print(f'page {i+1}: {text[:180].replace(chr(10), " ")}')
(out / 'extracted.txt').write_text(''.join(all_text), encoding='utf-8')
