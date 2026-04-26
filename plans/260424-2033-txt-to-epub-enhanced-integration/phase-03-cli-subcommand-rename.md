# Phase 3: CLI - txt-to-epub Subcommand & Skill Rename

**Priority:** High
**Status:** Pending
**Depends on:** Phase 1, Phase 2

## Overview

Wire up the new `txt-to-epub` subcommand in `convert.py` combining encoding detection, chapter range, custom regex, font embedding, and Pandoc backend. Rename skill from `ck:convert-doc` to `convert-doc`.

## Key Insights

- `convert.py` uses argparse subcommands - add 7th subcommand `txt-to-epub`
- `doc-to-epub` already exists but lacks encoding/range/font/pandoc features
- Skill rename only requires changing SKILL.md frontmatter `name` field
- All building blocks from Phase 1 & 2 are independent modules

## Requirements

### Functional
- New `txt-to-epub` subcommand with all flags
- Integration of encoding_detector, chapter range, custom regex, font, pandoc
- Skill name change: `ck:convert-doc` → `convert-doc`
- Existing 6 subcommands unchanged

### CLI Interface

```
convert.py txt-to-epub input.txt [OPTIONS]

Flags:
  --title TEXT           Book title (default: filename stem)
  --author TEXT          Author name (default: Unknown)
  --translator TEXT      Translator name
  --cover IMAGE          Cover image path
  --lang {vi,en,zh}      Language code (default: vi)
  --pattern REGEX        Custom chapter detection regex (overrides --pattern-id)
  --pattern-id ID        Use preset pattern (default: auto)
  --start-chapter N      Start chapter, 0=all (default: 0)
  --end-chapter M        End chapter, 0=all (default: 0)
  --encoding {auto,...}  Input encoding (default: auto)
  --embed-font FILE      Embed custom font file into EPUB
  --embed-default-cjk-font  Embed bundled NotoSans SC font
  --use-pandoc           Use Pandoc backend (CLI only)
  -o, --output PATH      Output EPUB path
  --batch                Process multiple files
```

## Related Code Files

### Modify
- `~/.claude/skills/convert-doc/scripts/convert.py` - Add `txt-to-epub` subcommand
- `~/.claude/skills/convert-doc/SKILL.md` - Rename + document new subcommand

## Implementation Steps

### 1. Add `cmd_txt_to_epub()` to `convert.py`

```python
def cmd_txt_to_epub(args):
    for fp in _files(args.input, args.batch):
        # Read with encoding detection
        text = read_file_content(fp, encoding=args.encoding)

        # Chapter detection: custom pattern or preset
        if args.pattern:
            import re
            try:
                re.compile(args.pattern)  # validate regex
            except re.error as e:
                print(f"Invalid regex: {e}", file=sys.stderr); return
            chapters = detect_with_custom_pattern(text, args.pattern)
        elif args.pattern_id and args.pattern_id != "auto":
            preset = get_pattern_by_id(args.pattern_id)
            if not preset:
                print(f"Unknown pattern: {args.pattern_id}", file=sys.stderr); return
            chapters = parse_chapters(text, preset.pattern)
        else:
            chapters = detect_chapters(text)

        # Chapter range filtering
        chapters = filter_chapters_by_range(chapters, args.start_chapter, args.end_chapter)
        if not chapters:
            print(f"No chapters in range {args.start_chapter}-{args.end_chapter}", file=sys.stderr); return

        epub_chapters = [EpubChapter(index=ch.index, title=ch.title, content=ch.content) for ch in chapters]

        # Output path
        out = args.output or str(Path(fp).with_suffix(".epub"))

        # Cover processing
        cover = process_cover(args.cover) if args.cover else ""

        meta = EpubMetadata(
            title=args.title or Path(fp).stem,
            author=args.author or "Unknown",
            translator=args.translator or "",
            language=args.lang or "vi",
            cover_image=cover,
        )

        # Font handling
        font_path = None
        if args.embed_default_cjk_font:
            font_path = os.path.join(os.path.dirname(__file__), "assets", "NotoSansSC-Regular.otf")
        elif args.embed_font:
            font_path = args.embed_font

        # Generate EPUB
        if args.use_pandoc:
            from pandoc_writer import generate_epub_with_pandoc
            generate_epub_with_pandoc(
                text=text,
                output_path=out,
                title=meta.title,
                author=meta.author,
                language=meta.language,
                font_path=font_path,
                cover_path=args.cover,
                chapter_pattern=args.pattern,
                start_chapter=args.start_chapter,
                end_chapter=args.end_chapter,
            )
        else:
            use_cjk = args.embed_default_cjk_font or (args.lang == "zh")
            generate_epub(meta, epub_chapters, out, font_path=font_path, use_cjk_css=use_cjk)

        print(f"[OK] {fp} -> {out}")
        print(f"     Chapters: {len(epub_chapters)}, Font: {'yes' if font_path else 'no'}, Backend: {'pandoc' if args.use_pandoc else 'ebooklib'}")
```

### 2. Add argparse subcommand

```python
t = sub.add_parser("txt-to-epub", help="Enhanced TXT to EPUB with encoding detection, chapter range, font embedding")
t.add_argument("input")
t.add_argument("--title")
t.add_argument("--author", default="Unknown")
t.add_argument("--translator", default="")
t.add_argument("--cover")
t.add_argument("--lang", choices=["vi", "en", "zh"], default="vi")
t.add_argument("--pattern", help="Custom regex for chapter detection")
t.add_argument("--pattern-id", default="auto", help="Preset pattern ID (1-22)")
t.add_argument("--start-chapter", type=int, default=0, help="Start chapter (0=all)")
t.add_argument("--end-chapter", type=int, default=0, help="End chapter (0=all)")
t.add_argument("--encoding", default="auto", help="Input encoding (default: auto)")
t.add_argument("--embed-font", help="Custom font file to embed")
t.add_argument("--embed-default-cjk-font", action="store_true", help="Embed NotoSans SC")
t.add_argument("--use-pandoc", action="store_true", help="Use Pandoc backend")
t.add_argument("-o", "--output")
t.add_argument("--batch", action="store_true")
t.set_defaults(func=cmd_txt_to_epub)
```

### 3. Update `SKILL.md`

Change frontmatter:
```yaml
name: convert-doc  # was: ck:convert-doc
```

Add to Quick Reference table:
```
| `txt-to-epub` | Enhanced TXT→EPUB | `txt-to-epub novel.txt --encoding auto --start-chapter 5 --embed-default-cjk-font` |
```

Add full usage section for `txt-to-epub` with all flags documented.

Add to dependencies:
```
cchardet (encoding detection), pandoc (optional, for --use-pandoc backend)
```

### 4. Update imports in `convert.py`

```python
from encoding_detector import detect_encoding, read_file_with_encoding
from chapter_detector import (
    parse_chapters, detect_chapters, auto_detect_pattern,
    get_pattern_by_id, Chapter, filter_chapters_by_range,
    detect_with_custom_pattern,
)
```

## Success Criteria
- [ ] `convert.py txt-to-epub --help` shows all flags
- [ ] `convert.py txt-to-epub input.txt` produces valid EPUB with auto-detection
- [ ] `--start-chapter 5 --end-chapter 20` extracts chapters 5-20
- [ ] `--pattern "^Chapter \d+"` uses custom regex
- [ ] `--embed-default-cjk-font` embeds NotoSans SC
- [ ] `--use-pandoc` generates via Pandoc
- [ ] Skill invokable as `/convert-doc` (not `/ck:convert-doc`)
- [ ] Existing subcommands (`convert`, `split`, `merge`, etc.) still work

## Risk Assessment
- Too many flags → `--help` text must be clear, group logically
- Custom regex errors → validate before use, report clearly
- Pandoc + font combination → test both with and without
