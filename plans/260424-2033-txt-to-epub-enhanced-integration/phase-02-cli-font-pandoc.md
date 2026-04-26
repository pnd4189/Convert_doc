# Phase 2: CLI - Font Embedding & Pandoc Backend

**Priority:** High
**Status:** Pending

## Overview

Add CJK font embedding to ebooklib EPUB writer and create Pandoc subprocess backend as alternative EPUB generator.

## Key Insights

- `epub_writer.py` uses ebooklib, already supports CSS styling and cover images
- Font embedding in ebooklib: `book.add_item()` with `EpubItem` for font file, CSS `@font-face` rule
- Pandoc generates EPUB from Markdown with `--toc`, `--epub-embed-font`, `--epub-metadata`
- Pandoc is a system dependency (not pip) - must check availability gracefully
- TXT_to_Epub's Pandoc approach: txt → markdown with `# headings` → pandoc → EPUB

## Requirements

### Functional
- Embed custom font files into EPUB (ebooklib path)
- Embed bundled NotoSans SC font via flag
- Pandoc backend: txt → markdown → pandoc subprocess → EPUB
- Pandoc availability check with graceful error message

### Non-functional
- Font file read must handle large files (~8MB for NotoSans)
- Pandoc subprocess timeout at 60 seconds
- Pandoc not found → print helpful install message, don't crash

## Related Code Files

### Create
- `~/.claude/skills/convert-doc/scripts/pandoc_writer.py` - Pandoc backend

### Modify
- `~/.claude/skills/convert-doc/scripts/epub_writer.py` - Add font embedding

### Copy
- NotoSansSC-Regular.otf → `~/.claude/skills/convert-doc/assets/NotoSansSC-Regular.otf`
- NotoSansSC-compatible CSS → embedded in epub_writer

## Implementation Steps

### 1. Copy NotoSans SC font

```bash
mkdir -p ~/.claude/skills/convert-doc/assets/
# Copy from TXT_to_Epub project (need git lfs pull first)
cp /home/dung/VIBE_CODING/TXT_to_Epub/NotoSansSC-Regular.otf ~/.claude/skills/convert-doc/assets/
```

Note: If LFS not pulled, download NotoSansSC-Regular.otf from Google Fonts.

### 2. Enhance `epub_writer.py` - Add font embedding

Add `embed_font()` function:

```python
def embed_font(book: epub.EpubBook, font_path: str, font_name: str = "EmbeddedFont") -> str:
    """Embed a font file into the EPUB. Returns CSS filename for @font-face reference."""
    from pathlib import Path
    font_data = Path(font_path).read_bytes()
    ext = Path(font_path).suffix.lower()
    mime = {'otf': 'font/otf', 'ttf': 'font/ttf', 'woff': 'font/woff', 'woff2': 'font/woff2'}
    font_item = epub.EpubItem(
        uid=f"font-{font_name}",
        file_name=f"fonts/{font_name}{ext}",
        media_type=mime.get(ext.lstrip('.'), 'font/otf'),
        content=font_data,
    )
    book.add_item(font_item)
    return f"fonts/{font_name}{ext}"
```

Add CJK CSS variant to `_CSS`:

```python
_CJK_CSS = """\
@font-face {
    font-family: 'NotoSansSC';
    src: url('fonts/NotoSansSC-Regular.otf');
    font-weight: normal;
    font-style: normal;
}
body { font-family: 'NotoSansSC', sans-serif; line-height: 1.7; text-align: justify; }
p { text-indent: 2em; margin-top: 0.5em; margin-bottom: 0.5em; }
h1, h2, h3 { font-family: 'NotoSansSC', sans-serif; font-weight: bold; text-align: left; margin-top: 2em; margin-bottom: 1em; line-height: 1.4; }
"""
```

Modify `generate_epub()` to accept `font_path` parameter:

```python
def generate_epub(metadata, chapters, output_path, font_path=None, use_cjk_css=False):
    # ... existing code ...
    if font_path:
        font_file = embed_font(book, font_path)
        # Add @font-face CSS
    # ... rest of existing code ...
```

### 3. Create `pandoc_writer.py`

```python
"""Pandoc-based EPUB writer - alternative backend using pandoc subprocess."""

import subprocess, tempfile, os
from pathlib import Path

_CSS = """\
@font-face {
    font-family: 'NotoSansSC';
    src: url('NotoSansSC-Regular.otf');
    font-weight: normal;
    font-style: normal;
}
body { font-family: 'NotoSansSC', sans-serif; line-height: 1.7; text-align: justify; }
p { text-indent: 2em; margin: 0.5em 0; }
h1, h2, h3 { font-family: 'NotoSansSC', sans-serif; font-weight: bold; text-align: left; margin-top: 2em; margin-bottom: 1em; }
"""

def check_pandoc_available() -> bool:
    """Check if pandoc is installed and accessible."""
    try:
        result = subprocess.run(['pandoc', '--version'], capture_output=True, timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def generate_epub_with_pandoc(
    text: str,
    output_path: str,
    title: str = "Untitled",
    author: str = "Unknown",
    language: str = "zh",
    font_path: str | None = None,
    cover_path: str | None = None,
    chapter_pattern: str | None = None,
    start_chapter: int = 0,
    end_chapter: int = 0,
) -> str:
    """Generate EPUB using Pandoc subprocess.

    Pipeline: text → markdown (# headings) → pandoc → EPUB
    """
    if not check_pandoc_available():
        raise RuntimeError(
            "Pandoc not found. Install: sudo apt install pandoc / brew install pandoc"
        )

    with tempfile.TemporaryDirectory() as tmpdir:
        # 1. Convert text to markdown with # headings
        md_content = _text_to_markdown(text, chapter_pattern, start_chapter, end_chapter)
        md_file = os.path.join(tmpdir, "input.md")
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(md_content)

        # 2. Create metadata.xml
        meta_file = os.path.join(tmpdir, "metadata.xml")
        with open(meta_file, 'w', encoding='utf-8') as f:
            f.write(f'<dc:title>{title}</dc:title>\n<dc:creator>{author}</dc:creator>\n<dc:language>{language}</dc:language>')

        # 3. Create CSS file
        css_file = os.path.join(tmpdir, "stylesheet.css")
        with open(css_file, 'w', encoding='utf-8') as f:
            f.write(_CSS)

        # 4. Build pandoc command
        cmd = [
            "pandoc", md_file,
            "-o", output_path,
            "--from=markdown",
            f"--css={css_file}",
            "--toc",
            "--epub-chapter-level=1",
            "-s",
        ]
        if font_path and Path(font_path).is_file():
            cmd.extend([f"--epub-embed-font={font_path}"])
        cmd.extend([f"--epub-metadata={meta_file}"])

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, encoding='utf-8')
        if result.returncode != 0:
            raise RuntimeError(f"Pandoc error: {result.stderr}")

    return output_path


def _text_to_markdown(text, pattern, start, end):
    """Convert text to markdown, converting chapter headings to # H1."""
    import re
    from chapter_detector import normalize_text, parse_chapters

    if pattern:
        chapters = parse_chapters(text, pattern)
    else:
        chapters = parse_chapters(text)

    # Range filtering
    if start > 0 or end > 0:
        filtered = []
        for ch in chapters:
            if start > 0 and ch.index < start:
                continue
            if end > 0 and ch.index > end:
                continue
            filtered.append(ch)
        chapters = filtered

    if not chapters:
        return text

    parts = []
    for ch in chapters:
        parts.append(f"# {ch.title}\n\n{ch.content}")
    return "\n\n".join(parts)
```

## Success Criteria
- [ ] NotoSansSC-Regular.otf available in assets/
- [ ] `embed_font()` correctly adds font to EPUB manifest
- [ ] CJK CSS variant applied when `use_cjk_css=True`
- [ ] `pandoc_writer.py` generates valid EPUB via Pandoc
- [ ] `check_pandoc_available()` returns False gracefully when missing
- [ ] Pandoc timeout at 60 seconds
- [ ] Temporary files cleaned up after generation

## Risk Assessment
- NotoSansSC-Regular.otf ~8MB increases EPUB size → optional flag
- Pandoc not installed → graceful error with install instructions
- Pandoc encoding issues → markdown is UTF-8, should be safe
