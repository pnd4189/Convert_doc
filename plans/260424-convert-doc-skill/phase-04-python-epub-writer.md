# Phase 4: Python EPUB Writer

**Priority:** High
**Status:** pending
**Description:** Implement EPUB generation using ebooklib, matching web app output quality

## Key Insights

- Web app uses JSZip + custom XML templates for EPUB 3.0 generation
- `ebooklib` provides high-level EPUB abstraction — no need to hand-write XML
- ebooklib handles mimetype, container.xml, OPF, NCX automatically
- Must match features: chapter XHTML, TOC (NCX + nav), cover image, CSS styles
- EPUB 3.0 format for all outputs (consistent with web app's multi-chapter path)
- Chapter headers in web app include: book title, author, translator, chapter title

## Files to Create

- `~/.claude/skills/convert-doc/scripts/epub_writer.py`

## Architecture

```python
from ebooklib import epub
from dataclasses import dataclass
from typing import Optional

@dataclass
class EpubMetadata:
    title: str
    author: str = "Unknown"
    translator: str = ""
    language: str = "vi"
    cover_image: str = ""  # path to cover image

@dataclass
class EpubChapter:
    index: int
    title: str
    content: str  # plain text or HTML

def generate_epub(metadata: EpubMetadata, chapters: list[EpubChapter], output_path: str) -> str:
    """Generate EPUB file from metadata and chapters"""

def _build_chapter_xhtml(chapter: EpubChapter, metadata: EpubMetadata) -> str:
    """Build XHTML content for a chapter with header"""

def _get_epub_styles() -> str:
    """Return CSS styles for EPUB content"""

def _text_to_html(text: str) -> str:
    """Convert plain text to HTML paragraphs"""

def _escape_xml(text: str) -> str:
    """Escape XML special characters"""
```

## Implementation Steps

### Step 1: Core generate_epub()

```python
def generate_epub(metadata, chapters, output_path):
    book = epub.EpubBook()
    book.set_identifier(str(uuid.uuid4()))
    book.set_title(metadata.title)
    book.set_language(metadata.language)
    book.add_author(metadata.author)

    # Create chapter items
    epub_chapters = []
    toc = []
    spine = ['nav']

    for ch in chapters:
        epub_ch = epub.EpubHtml(
            title=ch.title,
            file_name=f'chapter-{ch.index:03d}.xhtml',
            lang=metadata.language
        )
        epub_ch.content = _build_chapter_xhtml(ch, metadata)
        epub_ch.add_item(_get_epub_styles())
        book.add_item(epub_ch)
        epub_chapters.append(epub_ch)
        toc.append(epub_ch)
        spine.append(epub_ch)

    # TOC and spine
    book.toc = toc
    book.spine = spine

    # Cover
    if metadata.cover_image:
        _add_cover(book, metadata.cover_image)

    epub.write_epub(output_path, book)
    return output_path
```

### Step 2: Chapter XHTML Builder

Match web app's chapter-header structure (title > author > translator > chapter title):

```python
def _build_chapter_xhtml(chapter, metadata):
    # Remove duplicate title from content start
    content = chapter.content
    if content.startswith(chapter.title):
        content = content[len(chapter.title):].strip()

    html = f"""<html xmlns="http://www.w3.org/1999/xhtml" lang="{metadata.language}">
<head><title>{_escape_xml(chapter.title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
<div class="chapter-header">
  <p class="book-title">{_escape_xml(metadata.title)}</p>
  <p class="author">Tác giả: {_escape_xml(metadata.author)}</p>
  {f'<p class="translator">Dịch giả: {_escape_xml(metadata.translator)}</p>' if metadata.translator else ''}
  <h1 class="chapter-title">{_escape_xml(chapter.title)}</h1>
</div>
<div class="chapter-content">
  {_text_to_html(content)}
</div>
</body></html>"""
    return html
```

### Step 3: CSS Styles

Port directly from `epub/styles.ts`:

```python
EPUB_STYLES = """body { font-family: Georgia, serif; line-height: 1.6; margin: 1em; }
h1 { text-align: center; margin-bottom: 1em; }
p { text-indent: 1em; margin: 0.5em 0; }
.chapter-header { margin-bottom: 2em; text-align: center; }
.book-title { font-size: 0.9em; color: #666; }
.author, .translator { font-size: 0.85em; color: #888; }
.chapter-title { font-size: 1.5em; margin-top: 1em; }
.chapter-content { margin-top: 1em; }
.toc-title { text-align: center; margin-bottom: 1.5em; }
.toc-list { list-style-type: none; padding-left: 0; }
.toc-list li { margin: 0.5em 0; border-bottom: 1px solid #eee; }"""
```

### Step 4: Cover Image Handling

```python
def _add_cover(book, cover_path):
    # ebooklib cover API
    with open(cover_path, 'rb') as f:
        book.set_cover("cover.jpg", f.read())
```

Note: Full cover crop/resize handled by `cover_handler.py` (Phase 6). This step just embeds the processed image.

### Step 5: Utilities

- `_text_to_html()`: split by double-newlines, wrap in `<p>` tags, convert single newlines to `<br/>`
- `_escape_xml()`: replace &, <, >, ", '

### Step 6: Test

Generate a test EPUB with 3 chapters, verify with epubcheck or manual inspection.

## Success Criteria

- [ ] `generate_epub()` creates valid EPUB 3.0 file
- [ ] Chapter XHTML includes header (title, author, translator, chapter title)
- [ ] CSS styles match web app output
- [ ] Cover image embedded correctly
- [ ] TOC and navigation generated
- [ ] File under 200 lines
