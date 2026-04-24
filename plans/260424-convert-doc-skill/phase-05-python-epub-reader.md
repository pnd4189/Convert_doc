# Phase 5: Python EPUB Reader

**Priority:** Medium
**Status:** pending
**Description:** Parse EPUB files and convert to DOCX/TXT format using ebooklib + beautifulsoup4

## Key Insights

- Web app uses JSZip + custom DOMParser to parse EPUB structure
- Python: `ebooklib` reads EPUB natively, `beautifulsoup4` parses XHTML content
- Web app converts XHTML→DOCX (preserving formatting) and XHTML→Markdown
- Python approach: ebooklib extracts chapters, bs4 parses XHTML, python-docx writes DOCX
- Already have lxml in .venv for faster bs4 parsing

## Files to Create

- `~/.claude/skills/convert-doc/scripts/epub_reader.py`

## Architecture

```python
from ebooklib import epub
from bs4 import BeautifulSoup
from docx import Document
from docx.shared import Pt, Inches
import re

@dataclass
class EpubContent:
    title: str
    author: str
    chapters: list[dict]  # [{id, title, content_html}]

def parse_epub(path: str) -> EpubContent:
    """Parse EPUB file, extract metadata and chapters"""

def epub_to_docx(epub_path: str, output_path: str) -> str:
    """Convert EPUB to DOCX"""

def epub_to_markdown(epub_path: str, output_path: str) -> str:
    """Convert EPUB to Markdown TXT"""

def xhtml_to_text(xhtml: str) -> str:
    """Extract plain text from XHTML"""

def xhtml_to_markdown(xhtml: str) -> str:
    """Convert XHTML to Markdown"""

def is_valid_epub(path: str) -> bool:
    """Quick validation"""
```

## Implementation Steps

### Step 1: parse_epub()

Use ebooklib to read EPUB and extract chapters in spine order:

```python
def parse_epub(path):
    book = epub.read_epub(path)

    # Get metadata
    title = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else 'Untitled'
    author = book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else ''

    # Get spine order items
    chapters = []
    for item in book.spine:
        doc = book.get_item_with_id(item[0])
        if doc and doc.get_type() == 9:  # ITEM_DOCUMENT
            chapters.append({
                'id': doc.get_id(),
                'title': doc.get_name(),
                'content_html': doc.get_content().decode('utf-8', errors='ignore')
            })

    return EpubContent(title=title, author=author, chapters=chapters)
```

### Step 2: epub_to_docx()

Convert XHTML content to DOCX preserving headings, bold, italic:

```python
def epub_to_docx(epub_path, output_path):
    epub_content = parse_epub(epub_path)
    doc = Document()

    for chapter in epub_content.chapters:
        soup = BeautifulSoup(chapter['content_html'], 'lxml')
        for element in soup.body.children if soup.body else []:
            if element.name in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
                level = int(element.name[1])
                doc.add_heading(element.get_text(), level=level)
            elif element.name == 'p':
                # Process runs for bold/italic
                runs = _extract_runs(element)
                para = doc.add_paragraph()
                for text, bold, italic in runs:
                    para.add_run(text, bold=bold, italic=italic)
            elif element.name in ('div', 'section'):
                # Process children
                pass

    doc.save(output_path)
    return output_path
```

### Step 3: epub_to_markdown()

Convert XHTML to Markdown:

```python
def epub_to_markdown(epub_path, output_path):
    epub_content = parse_epub(epub_path)
    md = f"# {epub_content.title}\n\n"
    if epub_content.author:
        md += f"**Author:** {epub_content.author}\n\n"
    md += "---\n\n"

    for chapter in epub_content.chapters:
        md += xhtml_to_markdown(chapter['content_html'])
        md += "\n\n---\n\n"

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    return output_path
```

### Step 4: xhtml_to_markdown()

Port from `xhtml-to-markdown.ts`:

```python
def xhtml_to_markdown(xhtml):
    soup = BeautifulSoup(xhtml, 'lxml')
    return _element_to_md(soup.body if soup.body else soup)

def _element_to_md(element):
    # Handle each tag type: h1-h6 → # heading, p → text, strong → **bold**, etc.
    # Same logic as TypeScript version
```

### Step 5: Test

- Parse a sample EPUB file
- Verify DOCX output opens correctly
- Verify Markdown output has proper formatting

## Success Criteria

- [ ] `parse_epub()` extracts title, author, chapters in spine order
- [ ] `epub_to_docx()` creates valid DOCX with formatting
- [ ] `epub_to_markdown()` creates readable Markdown
- [ ] `xhtml_to_markdown()` handles headings, bold, italic, lists, tables
- [ ] `is_valid_epub()` validates EPUB files
- [ ] File under 200 lines
