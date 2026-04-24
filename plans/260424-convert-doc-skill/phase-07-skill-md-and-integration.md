# Phase 7: SKILL.md + Integration

**Priority:** High
**Status:** pending
**Description:** Write SKILL.md manifest, integrate skill into Claude Code, end-to-end testing

## Key Insights

- SKILL.md must be under 300 lines
- Description under 200 chars, include trigger phrases
- `argument-hint` field shows user available flags
- Scripts are "token-efficient" — executed without loading into context
- All Python deps already in .venv, no install step needed

## Files to Create

- `~/.claude/skills/convert-doc/SKILL.md`

## Architecture

### SKILL.md Frontmatter

```yaml
---
name: ck:convert-doc
description: Convert documents between TXT, DOCX, EPUB formats. Split/merge by chapters. Detect VN/CN/EN chapters. Use when user says "convert doc", "split chapters", "make epub", "epub to docx".
argument-hint: "[input-files] [--to docx|txt|epub|md] [--split N] [--merge] [--detect] [--title TITLE] [--author AUTHOR] [--cover IMAGE]"
metadata:
  author: claudekit
  version: "1.0.0"
  category: document-processing
  tags: [convert, docx, epub, chapter, split, merge]
---
```

### SKILL.md Body Structure

1. Quick reference table of subcommands
2. Per-subcommand usage with flags
3. Pattern IDs reference (for `--pattern`)
4. Output format notes
5. Batch mode explanation

## Implementation Steps

### Step 1: Create SKILL.md

Write complete SKILL.md with:

**Quick Reference Table:**

| Subcommand | Purpose | Example |
|---|---|---|
| `convert` | Format conversion | `convert doc.txt --to docx` |
| `split` | Split by chapters | `split novel.txt -n 10` |
| `merge` | Merge files | `merge f1.txt f2.txt -o out.txt` |
| `epub-to-doc` | EPUB → DOCX/TXT | `epub-to-doc book.epub --format docx` |
| `doc-to-epub` | DOCX/TXT → EPUB | `doc-to-epub novel.docx --title "Title"` |
| `detect` | Detect chapters | `detect novel.txt` |

**Per-subcommand docs:**

```markdown
## convert
Convert file between formats.

**Usage:**
`$HOME/.claude/skills/.venv/bin/python3 $HOME/.claude/skills/convert-doc/scripts/convert.py convert <input> --to <format> [-o OUTPUT] [--batch]`

**Supported conversions:**
- txt → docx
- docx → txt, md
- txt/docx → epub

**Flags:**
- `--to FORMAT` - Output format: docx, txt, epub, md (required)
- `-o, --output` - Output file or directory
- `--batch` - Process multiple files (input is glob pattern)
```

(Similar sections for each subcommand)

### Step 2: Pattern ID Reference

List all available pattern IDs for `detect --pattern`:

```
auto, chuong, chuong-upper, chapter, chuong-roman, chapter-roman, chuong-vn-word,
hoi, hoi-thu, quyen-chuong, phan, muc,
di-zhang, di-zhang-cn, juan, di-hui, di-jie,
part, book, volume, section, episode
```

### Step 3: Verify Skill Registration

```bash
# Verify SKILL.md is valid
ls -la ~/.claude/skills/convert-doc/SKILL.md

# In Claude Code, test invocation
# /ck:convert-doc detect test.txt
```

### Step 4: End-to-End Test All Subcommands

Create test files and verify:

```bash
# Setup test data
echo "Chương 1: Test\nNội dung chương 1\n\nChương 2: Test 2\nNội dung chương 2" > /tmp/test.txt

# Test detect
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py detect /tmp/test.txt

# Test convert txt→docx
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py convert /tmp/test.txt --to docx -o /tmp/test.docx

# Test convert txt→epub
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py convert /tmp/test.txt --to epub -o /tmp/test.epub

# Test split
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py split /tmp/test.txt -n 1 -o /tmp/split/

# Test merge
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py merge /tmp/test.txt /tmp/test.txt -o /tmp/merged.txt

# Test epub-to-doc
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py epub-to-doc /tmp/test.epub --format docx -o /tmp/from_epub.docx

# Test doc-to-epub
$HOME/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py doc-to-epub /tmp/test.docx --title "Test Book" --author "Test Author"

# Cleanup
rm -f /tmp/test.txt /tmp/test.docx /tmp/test.epub /tmp/merged.txt /tmp/from_epub.docx
rm -rf /tmp/split/
```

## Success Criteria

- [ ] SKILL.md under 300 lines with proper frontmatter
- [ ] Description includes trigger phrases ("convert doc", "split chapters", "make epub")
- [ ] argument-hint documents all major flags
- [ ] All 6 subcommands documented with usage examples
- [ ] Pattern ID reference complete
- [ ] Skill triggers correctly when invoked via `/ck:convert-doc`
- [ ] All end-to-end tests pass
- [ ] Batch mode tested with multiple files
