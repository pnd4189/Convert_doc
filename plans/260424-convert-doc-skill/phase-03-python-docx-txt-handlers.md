# Phase 3: Python DOCX/TXT Handlers

**Priority:** High
**Status:** pending
**Description:** Implement DOCX read/write and TXT/Markdown processing using python-docx and markdown libraries

## Key Insights

- `python-docx` already in .venv (1.2.0) — reads/writes DOCX natively
- `Markdown` already in .venv (3.10.2) — converts Markdown to HTML for EPUB embedding
- Web app uses `mammoth` for DOCX→text and `docx` lib for text→DOCX — different approach in Python
- TXT auto-detection (plain vs Markdown) ported from `txt-processor.ts`
- File size formatting utility needed for CLI output

## Files to Create

- `~/.claude/skills/convert-doc/scripts/docx_handler.py`
- `~/.claude/skills/convert-doc/scripts/txt_processor.py`

## Architecture

### docx_handler.py

```python
def read_docx(path: str) -> str:
    """Read DOCX file, return plain text content"""

def read_docx_to_html(path: str) -> str:
    """Read DOCX, return HTML (for EPUB embedding)"""

def write_docx(text: str, output_path: str) -> None:
    """Write plain text to DOCX file"""

def read_file_content(path: str) -> str:
    """Read any supported file (txt/docx), return plain text"""

def get_file_type(filename: str) -> str:
    """Detect file type from extension"""

def format_file_size(bytes_size: int) -> str:
    """Format bytes to human-readable size"""
```

### txt_processor.py

```python
def is_markdown(text: str) -> bool:
    """Detect if text is Markdown (2+ patterns)"""

def txt_to_html(text: str) -> str:
    """Convert TXT/Markdown to HTML for EPUB"""

def plain_text_to_html(text: str) -> str:
    """Convert plain text to HTML paragraphs"""
```

## Implementation Steps

### Step 1: docx_handler.py - read_docx()

Use `python-docx` to iterate paragraphs:

```python
from docx import Document

def read_docx(path: str) -> str:
    doc = Document(path)
    return '\n'.join(p.text for p in doc.paragraphs)
```

### Step 2: docx_handler.py - read_docx_to_html()

Convert DOCX to HTML preserving headings, bold, italic:

```python
def read_docx_to_html(path: str) -> str:
    doc = Document(path)
    html_parts = []
    for para in doc.paragraphs:
        # Map styles to HTML tags
        style = para.style.name if para.style else ''
        if 'Heading 1' in style: tag = 'h1'
        elif 'Heading 2' in style: tag = 'h2'
        # ... etc
        else: tag = 'p'
        # Process runs for bold/italic
        html_parts.append(f'<{tag}>{runs_to_html(para.runs)}</{tag}>')
    return '\n'.join(html_parts)
```

### Step 3: docx_handler.py - write_docx()

```python
def write_docx(text: str, output_path: str) -> None:
    doc = Document()
    for line in text.split('\n'):
        doc.add_paragraph(line)
    doc.save(output_path)
```

### Step 4: docx_handler.py - utilities

- `read_file_content()` — dispatch to txt read or docx read based on extension
- `get_file_type()` — extension-based detection
- `format_file_size()` — bytes to KB/MB/GB string

### Step 5: txt_processor.py - is_markdown()

Port from `txt-processor.ts`:

```python
PATTERNS = [
    r'^#{1,6}\s+',        # # Heading
    r'\*\*[^*]+\*\*',     # **bold**
    r'\*[^*]+\*',         # *italic*
    r'^[-*]\s+',          # - list
    r'^\d+\.\s+',         # 1. list
    r'\[.+\]\(.+\)',      # [link](url)
    r'^>\s+',             # > blockquote
    r'`[^`]+`',           # `code`
    r'^\|.+\|$',          # | table |
]
```

### Step 6: txt_processor.py - txt_to_html()

```python
import markdown

def txt_to_html(text: str) -> str:
    if is_markdown(text):
        return markdown.markdown(text, extensions=['extra', 'nl2br'])
    return plain_text_to_html(text)
```

### Step 7: Test Both Modules

- Read a sample .docx file, verify text extraction
- Write text to .docx, verify creation
- Test markdown detection with various text samples
- Test HTML output for plain text and markdown

## Success Criteria

- [ ] `read_docx()` extracts text from DOCX files
- [ ] `read_docx_to_html()` preserves formatting (headings, bold, italic)
- [ ] `write_docx()` creates valid DOCX from plain text
- [ ] `read_file_content()` handles both .txt and .docx
- [ ] `is_markdown()` detects markdown vs plain text
- [ ] `txt_to_html()` converts both markdown and plain text to HTML
- [ ] Both files under 200 lines each
