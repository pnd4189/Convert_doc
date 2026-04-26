# Phase 6: Testing & Verification

**Priority:** High
**Status:** Pending
**Depends on:** Phase 1-5

## Overview

Comprehensive testing of all new features across CLI skill and web app. Verify no regressions in existing functionality.

## Requirements

### CLI Tests

| Test Case | Command | Expected |
|---|---|---|
| Basic TXT→EPUB | `txt-to-epub input.txt` | Valid EPUB with auto-detected chapters |
| GBK encoding | `txt-to-epub gbk_file.txt --encoding auto` | Correct Chinese characters in output |
| Custom encoding | `txt-to-epub file.txt --encoding gbk` | Same as auto for GBK files |
| Chapter range | `txt-to-epub novel.txt --start-chapter 5 --end-chapter 20` | Only chapters 5-20 in output |
| Open-ended range | `txt-to-epub novel.txt --start-chapter 10` | Chapters 10 to end |
| Custom regex | `txt-to-epub en_novel.txt --pattern "^Chapter \d+"` | English chapters detected |
| Preset pattern | `txt-to-epub cn_novel.txt --pattern-id di-zhang` | Chinese 第X章 chapters |
| Font embed | `txt-to-epub novel.txt --embed-font NotoSans.otf` | Font in EPUB, @font-face in CSS |
| Default CJK font | `txt-to-epub novel.txt --embed-default-cjk-font` | NotoSans SC in EPUB |
| Pandoc backend | `txt-to-epub novel.txt --use-pandoc` | Pandoc-generated EPUB |
| Pandoc + font | `txt-to-epub novel.txt --use-pandoc --embed-default-cjk-font` | Pandoc EPUB with font |
| Full options | `txt-to-epub novel.txt --encoding auto --start-chapter 1 --end-chapter 10 --embed-default-cjk-font --lang zh` | Complete pipeline |
| Batch mode | `txt-to-epub *.txt --batch -o ./output/` | Multiple EPUBs generated |
| Invalid regex | `txt-to-epub novel.txt --pattern "[invalid"` | Error message, no crash |
| Pandoc missing | `txt-to-epub novel.txt --use-pandoc` (no pandoc) | Helpful error message |
| Existing subcommands | `convert`, `split`, `merge`, `epub-to-doc`, `doc-to-epub`, `detect` | All still work |

### Web App Tests

| Test Case | Action | Expected |
|---|---|---|
| Tab 4 basic flow | Upload TXT → metadata → chapters → export | EPUB downloaded |
| Encoding detection | Upload GBK TXT file | Content displayed correctly |
| Chapter range | Set range 5-20 | Only those chapters shown |
| Custom regex | Enter `^Chapter \d+` | English chapters detected |
| Font upload | Upload .otf file | Font embedded in EPUB |
| No font | Don't upload font | EPUB generated without font |
| Existing tabs | Tab 1, 2, 3 | All still functional |

### Build Verification
- `npm run build` succeeds (no TypeScript errors)
- `npm run lint` passes (no critical warnings)
- Existing vitest tests pass

## Implementation Steps

1. Create test TXT files in various encodings (UTF-8, GBK, Big5)
2. Run CLI test cases manually
3. Build web app and test in browser
4. Run existing test suite: `npx vitest run`
5. Fix any regressions found
6. Verify EPUB output validity (can open in Calibre/Apple Books)

## Success Criteria
- [ ] All CLI test cases pass
- [ ] All web app test cases pass
- [ ] `npm run build` succeeds
- [ ] Existing vitest tests pass
- [ ] Generated EPUBs open correctly in ebook readers
- [ ] No regressions in existing functionality
