# Phase 6: Python Cover Handler + Main CLI

**Priority:** High
**Status:** pending
**Description:** Implement cover image processing (Pillow) and main CLI entry point (argparse)

## Key Insights

- Web app uses canvas API for cover crop/resize (browser-only)
- Python equivalent: Pillow with `Image.crop()` and `Image.resize()`
- Target: 1600x2560px (5:8 ratio), JPEG, 80% quality — fixed, not customizable
- Main CLI uses argparse with subcommands matching the 6 web app tabs
- Batch mode: process multiple files, output to directory

## Files to Create

- `~/.claude/skills/convert-doc/scripts/cover_handler.py`
- `~/.claude/skills/convert-doc/scripts/convert.py`

## Architecture

### cover_handler.py

```python
from PIL import Image

TARGET_WIDTH = 1600
TARGET_HEIGHT = 2560
QUALITY = 80

def process_cover(input_path: str, output_path: str = None) -> str:
    """Center-crop to 5:8 ratio, resize to 1600x2560, save as JPEG"""

def _center_crop(img: Image.Image) -> Image.Image:
    """Crop image to 5:8 aspect ratio centered"""
```

### convert.py

```python
import argparse
import sys

def cmd_convert(args):
    """Convert file format: txt→docx, docx→txt, txt→epub, docx→epub"""

def cmd_split(args):
    """Split file by chapters"""

def cmd_merge(args):
    """Merge multiple files into one"""

def cmd_epub_to_doc(args):
    """Convert EPUB to DOCX or TXT"""

def cmd_doc_to_epub(args):
    """Convert DOCX/TXT to EPUB"""

def cmd_detect(args):
    """Detect chapters in file"""

def main():
    parser = argparse.ArgumentParser(description='Document file converter')
    subparsers = parser.add_subparsers(dest='command')
    # ... setup each subparser

if __name__ == '__main__':
    main()
```

## Implementation Steps

### Step 1: cover_handler.py

```python
def process_cover(input_path, output_path=None):
    img = Image.open(input_path)

    # Convert to RGB if necessary (for PNG→JPEG)
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    # Center-crop to 5:8 ratio
    target_ratio = TARGET_WIDTH / TARGET_HEIGHT  # 0.625
    source_ratio = img.width / img.height

    if source_ratio > target_ratio:
        # Source wider - crop sides
        crop_width = int(img.height * target_ratio)
        crop_x = (img.width - crop_width) // 2
        img = img.crop((crop_x, 0, crop_x + crop_width, img.height))
    else:
        # Source taller - crop top/bottom
        crop_height = int(img.width / target_ratio)
        crop_y = (img.height - crop_height) // 2
        img = img.crop((0, crop_y, img.width, crop_y + crop_height))

    # Resize to target
    img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

    # Save as JPEG
    if not output_path:
        output_path = input_path.rsplit('.', 1)[0] + '_cover.jpg'
    img.save(output_path, 'JPEG', quality=QUALITY)
    return output_path
```

### Step 2: convert.py - Argument Parser Setup

```python
def main():
    parser = argparse.ArgumentParser(
        prog='convert',
        description='Document converter: TXT/DOCX/EPUB format conversion'
    )
    sub = parser.add_subparsers(dest='command', required=True)

    # convert subcommand
    p = sub.add_parser('convert', help='Convert file format')
    p.add_argument('input', help='Input file path')
    p.add_argument('--to', required=True, choices=['docx', 'txt', 'epub', 'md'])
    p.add_argument('-o', '--output', help='Output file/directory')
    p.add_argument('--batch', action='store_true', help='Batch: input is glob pattern')
    p.set_defaults(func=cmd_convert)

    # split subcommand
    p = sub.add_parser('split', help='Split by chapters')
    p.add_argument('input', help='Input file path')
    p.add_argument('-n', '--chapters-per-file', type=int, default=10)
    p.add_argument('-o', '--output', help='Output directory')
    p.add_argument('--to', choices=['txt', 'docx'], default='txt')
    p.add_argument('--batch', action='store_true')
    p.set_defaults(func=cmd_split)

    # merge subcommand
    p = sub.add_parser('merge', help='Merge files')
    p.add_argument('inputs', nargs='+', help='Input files')
    p.add_argument('-o', '--output', required=True, help='Output file')
    p.set_defaults(func=cmd_merge)

    # epub-to-doc subcommand
    p = sub.add_parser('epub-to-doc', help='EPUB to DOCX/TXT')
    p.add_argument('input', help='Input EPUB file')
    p.add_argument('--format', choices=['docx', 'txt'], default='docx')
    p.add_argument('-o', '--output', help='Output directory')
    p.add_argument('--batch', action='store_true')
    p.set_defaults(func=cmd_epub_to_doc)

    # doc-to-epub subcommand
    p = sub.add_parser('doc-to-epub', help='DOCX/TXT to EPUB')
    p.add_argument('input', help='Input file')
    p.add_argument('--title', required=True)
    p.add_argument('--author', default='Unknown')
    p.add_argument('--translator', default='')
    p.add_argument('--cover', help='Cover image path')
    p.add_argument('--lang', default='vi', choices=['vi', 'en', 'zh'])
    p.add_argument('-o', '--output', help='Output EPUB path')
    p.add_argument('--batch', action='store_true')
    p.set_defaults(func=cmd_doc_to_epub)

    # detect subcommand
    p = sub.add_parser('detect', help='Detect chapters')
    p.add_argument('input', help='Input file')
    p.add_argument('--pattern', default='auto', help='Pattern ID or "auto"')
    p.set_defaults(func=cmd_detect)

    args = parser.parse_args()
    args.func(args)
```

### Step 3: Implement cmd_convert()

```python
def cmd_convert(args):
    ext = Path(args.input).suffix.lower()
    to_format = args.to

    if ext == '.txt' and to_format == 'docx':
        text = Path(args.input).read_text(encoding='utf-8')
        output = args.output or args.input.rsplit('.', 1)[0] + '.docx'
        write_docx(text, output)
    elif ext == '.docx' and to_format in ('txt', 'md'):
        text = read_docx(args.input)
        output = args.output or args.input.rsplit('.', 1)[0] + f'.{to_format}'
        Path(output).write_text(text, encoding='utf-8')
    elif ext in ('.txt', '.docx') and to_format == 'epub':
        # Use doc-to-epub logic
        ...
    print(f"Converted: {args.input} → {output}")
```

### Step 4: Implement cmd_split()

```python
def cmd_split(args):
    text = read_file_content(args.input)
    chapters = parse_chapters(text)
    per_file = args.chapters_per_file
    base_name = Path(args.input).stem
    out_dir = args.output or '.'

    os.makedirs(out_dir, exist_ok=True)

    for i in range(0, len(chapters), per_file):
        batch = chapters[i:i + per_file]
        content = '\n\n'.join(ch.content for ch in batch)
        start = batch[0].index
        end = batch[-1].index
        filename = f"{base_name}_chuong_{start:03d}-{end:03d}.txt"
        Path(os.path.join(out_dir, filename)).write_text(content, encoding='utf-8')

    print(f"Split {len(chapters)} chapters into {math.ceil(len(chapters) / per_file)} files")
```

### Step 5: Implement cmd_merge(), cmd_epub_to_doc(), cmd_doc_to_epub(), cmd_detect()

Each subcommand delegates to the appropriate module.

### Step 6: Test All Subcommands

```bash
# detect
python convert.py detect test_novel.txt

# convert txt→docx
python convert.py convert test.txt --to docx

# split
python convert.py split test.txt --chapters-per-file 10 -o ./output

# merge
python convert.py merge f1.txt f2.txt -o merged.txt

# doc-to-epub
python convert.py doc-to-epub test.docx --title "Test Novel" --author "Author"

# epub-to-doc
python convert.py epub-to-doc test.epub --format docx
```

## Success Criteria

- [ ] `cover_handler.py` center-crops and resizes to 1600x2560 JPEG
- [ ] `convert.py` has all 6 subcommands with proper argparse
- [ ] `convert` subcommand handles txt↔docx, txt/docx→epub
- [ ] `split` subcommand splits by chapters into multiple files
- [ ] `merge` subcommand combines files
- [ ] `epub-to-doc` converts EPUB to DOCX or TXT
- [ ] `doc-to-epub` converts DOCX/TXT to EPUB with metadata
- [ ] `detect` shows chapter detection results
- [ ] `--batch` flag works for convert, split, epub-to-doc, doc-to-epub
- [ ] Both files under 200 lines each
