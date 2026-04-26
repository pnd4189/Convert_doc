# Code Review: TXT-to-EPUB Enhanced Integration

**Reviewer:** code-reviewer
**Date:** 2026-04-24
**Scope:** 12 files (+ 6 Python CLI), ~450 LOC added
**Focus:** Security, error handling, code quality, type safety

---

## Overall Assessment

Solid enhancement. Chapter detection patterns are comprehensive, encoding detection is well-structured, and font embedding follows EPUB spec. No regressions detected in existing doc-to-epub or epub-to-doc paths. Issues below are ordered by severity.

---

## Critical Issues

### C1. CSS Injection via Malicious Font Filename (TypeScript EPUB path)

**File:** `src/lib/epub/styles.ts:80`
**File:** `src/lib/epub/index.ts:69-71`

```ts
src: url('fonts/${fontFileName}');
// ...
fontFileName = fontFile.name;   // straight from File API, unchecked
zip.file(`OEBPS/fonts/${fontFileName}`, fontData);
```

A user who names a file `../../OEBPS/toc.xhtml` or `"); body { display: none } /*` can:
- **Path traversal** inside the ZIP: `fontFile.name` is attacker-controlled. `OEBPS/fonts/../../OEBPS/toc.xhtml` overwrites navigation.
- **CSS breakout**: a filename containing `');` closes the `url()` and injects arbitrary CSS.

JSZip does NOT sanitize `file()` paths. A crafted filename with `../` segments writes outside `OEBPS/fonts/`.

**Fix:**
```ts
// sanitize filename: strip path separators, keep extension
const safeName = fontFile.name.replace(/[\\/]/g, '_').replace(/^\.+/, '');
const ext = safeName.slice(safeName.lastIndexOf('.'));
if (!/^\.(otf|ttf|woff|woff2)$/i.test(ext)) {
  throw new Error('Unsupported font format');
}
const fontFileName = `embedded-font${ext}`;
zip.file(`OEBPS/fonts/${fontFileName}`, fontData);
```

Same issue in Python `epub_writer.py:86`: `rel_path = f"fonts/{font_name}{ext}"` where `font_name` is derived from the font path. The Python side is less risky (CLI, server-side, single user) but still should sanitize.

### C2. Command Injection in Pandoc Backend

**File:** `pandoc_writer.py:84`

```python
cmd.extend([f"--epub-embed-font={font_path}"])
```

`font_path` flows from CLI args (`--embed-font`) directly into a subprocess command list. Because `subprocess.run(cmd, ...)` uses a list (not `shell=True`), this is **not exploitable via shell metacharacters**. However, the `output_path` from `--output` is also passed unsanitized. A symlink attack could cause pandoc to overwrite arbitrary files.

**Risk:** Low (CLI-only, requires local access). Not blocking. Document that `font_path` must be validated before reaching this code (already partially done via `os.path.isfile()` check in `convert.py:189`).

---

## High Priority

### H1. Custom Regex in StepChapters is Non-Functional

**File:** `src/components/tab-doc-to-epub/step-chapters.tsx:194-200`

```tsx
onClick={() => {
  if (!customRegex.trim()) return;
  try {
    detectChapters();  // <-- calls the ORIGINAL detection, ignores customRegex
    setRegexError(null);
  } catch {
    setRegexError('Regex không hợp lệ');
  }
}}
```

`detectChapters()` calls `processDocument()` which calls `detectChaptersByPosition()` with hardcoded patterns. The `customRegex` state is never passed to the detection pipeline. The button click re-runs default detection every time.

The `detectWithCustomRegex()` function exists in `chapter-parser.ts` but nothing calls it from the UI. The regex input is dead code.

**Fix:** Wire `customRegex` through `processDocument()` or call `detectWithCustomRegex()` directly after file text extraction. Also, the `try/catch` here catches nothing useful because `detectChapters()` is async -- the exception propagates as a rejected promise, not a synchronous throw.

### H2. Encoding Detection Bypass When Explicit Encoding Provided

**File:** `src/lib/doc-to-epub/txt-processor.ts:98-99`

```ts
const text = options?.encoding && options.encoding !== 'auto'
  ? await file.text()   // <-- ignores options.encoding, always uses UTF-8
  : await detectAndReadFile(file);
```

When the caller passes `encoding: 'gbk'`, the code falls into the first branch but calls `file.text()` which is always UTF-8. The explicit encoding is silently discarded. This is a contract mismatch: `TxtProcessOptions.encoding` implies the encoding will be used.

**Fix:** Use the specified encoding:
```ts
if (options?.encoding && options.encoding !== 'auto') {
  const buffer = await file.arrayBuffer();
  return new TextDecoder(options.encoding, { fatal: false }).decode(new Uint8Array(buffer));
}
return detectAndReadFile(file);
```

### H3. Mutable State Mutation in Chapter Reorder

**File:** `src/components/tab-doc-to-epub/step-chapters.tsx:87-89, 99-101, 109-111`

```ts
newChapters.forEach((ch, i) => {
  ch.index = i + 1;  // mutates original object
});
```

`handleMoveUp`, `handleMoveDown`, and `handleRemove` all mutate objects in the `chapters` array. Since `chapters` and `originalChapters` can share object references (they don't spread chapter objects on `setChapters`), reordering the filtered list also mutates the "original" backup. After a range filter + reorder, "Reset" restores mutated originals.

**Fix:** Spread when filtering:
```ts
.map((ch, i) => ({ ...ch, index: i + 1 }));
```

### H4. No Font File Size Limit Enforcement

**File:** `src/components/tab-doc-to-epub/step-metadata.tsx:44-48`

The code warns at 5 MB but never blocks. A user could upload a 100 MB font file, which would be read entirely into memory (`file.arrayBuffer()` in `index.ts:71`) and embedded in the ZIP. For browser-based processing, this can cause tab crashes.

**Fix:** Enforce a hard limit (e.g., 10 MB) and reject the file:
```ts
const MAX_FONT_SIZE = 10 * 1024 * 1024;
if (file.size > MAX_FONT_SIZE) {
  setFont(null);
  // show error
  return;
}
```

---

## Medium Priority

### M1. DRY Violation: CJK CSS Duplication

**Files:** `src/lib/epub/styles.ts:77-152`, `epub_writer.py:52-67`, `pandoc_writer.py:16-25`

The same CJK CSS is defined three times (TypeScript, ebooklib writer, pandoc writer). The default CSS is also duplicated three times. Any style fix must be applied in all three places.

**Recommendation:** For Python CLI, extract into a shared `css_styles.py`. For TS, keep as-is since it's a different runtime.

### M2. Python `filter_chapters_by_range` Mutates Input

**File:** `chapter_detector.py:150-151`

```python
for i, ch in enumerate(filtered):
    ch.index = i + 1  # mutates original Chapter objects
```

The TypeScript version (`chapter-parser.ts:458`) correctly spreads `{ ...ch, index: i + 1 }`, but the Python version mutates in place. If the caller holds references to the original chapters, their indices are silently corrupted.

**Fix:** Create new Chapter instances:
```python
filtered = [Chapter(index=i + 1, title=ch.title, ...) for i, ch in enumerate(filtered)]
```

### M3. `_text_to_html` Does Not Escape Content

**File:** `epub_writer.py:115`

```python
inner = block.replace("\n", "<br/>")
html_parts.append(f"<p>{_escape_xml(inner)}</p>")
```

This is correct -- `_escape_xml` is called after the `<br/>` replacement, so `<br/>` itself gets escaped to `&lt;br/&gt;`. The result is that newlines are NOT rendered as breaks; they appear as literal `<br/>` text. The TypeScript version (`utils.ts:28`) has the same bug: `escapeXml(p).replace(/\n/g, '<br/>')` -- this works correctly because escape happens first, then newlines are replaced.

In the Python code, the order is wrong: `replace` then `_escape_xml`. Should be:
```python
inner = _escape_xml(block).replace("\n", "<br/>")
```

### M4. `detectAndReadFile` Skips `utf-8` in Loop but Catches It via try/catch

**File:** `src/lib/doc-to-epub/txt-processor.ts:28`

```ts
for (const enc of CJK_ENCODINGS.slice(1)) {
```

`CJK_ENCODINGS` starts with `'utf-8'` but `.slice(1)` skips it. This is intentional (UTF-8 is tried first above), but the array name `CJK_ENCODINGS` is misleading since it includes `utf-8`. Rename to `FALLBACK_ENCODINGS` or remove `utf-8` from the array.

### M5. `getCjkStyles` Drops `:hover` Styles

**File:** `src/lib/epub/styles.ts`

The default `getEpubStyles()` includes `.toc-list a:hover { color: #0066cc; }` but `getCjkStyles()` omits it. Inconsistent CSS between the two paths.

---

## Low Priority

### L1. `batchProcessTxt` Sequential Processing

**File:** `src/lib/doc-to-epub/txt-processor.ts:117-124`

Processes files sequentially with `for...of`. Could use `Promise.all` for parallel processing, but since this is likely used with 1-3 files, the impact is negligible.

### L2. Hardcoded Language `'vi'` in StepMetadata

**File:** `step-metadata.tsx:57`

```ts
language: 'vi',
```

Metadata always sets language to Vietnamese regardless of user preference. The metadata form has no language selector despite the EPUB types supporting it. This was pre-existing but worth noting.

### L3. Progress Bar is Fake

**File:** `step-export.tsx:42-64`

Progress jumps: 10 -> 30 -> 50 -> 100. Not connected to actual generation progress. Cosmetically misleading but harmless.

---

## Security Checklist

| Check | Status |
|-------|--------|
| Path traversal (ZIP) | **FAIL** - C1 font filename injection |
| Command injection | PASS - subprocess uses list form |
| XSS in browser | PASS - innerHTML only used for text extraction (not rendered) |
| Input validation (font types) | WARN - `accept` attribute on `<input>` is client-side only, no server-side check |
| Regex DoS (ReDoS) | WARN - user-provided regex in `step-chapters.tsx` and `convert.py` is unbounded in complexity |

---

## Positive Observations

- Encoding detection fallback chain is well-structured (UTF-8 -> CJK encodings -> replacement chars)
- `charset-normalizer` import with graceful fallback when missing
- Font MIME type mapping in `epub_writer.py` covers all common formats
- `validatePattern()` validates regex before compilation
- EPUB generation preserves chapter ordering via `sorted()` in Python and index-based naming in TS
- BOM removal and zero-width character stripping in `normalizeText()` handles edge cases well
- Cover image processing pipeline is clean (resize + JPEG conversion)

---

## Recommended Actions

1. **[Critical]** Sanitize `fontFile.name` before using in ZIP path and CSS URL (C1)
2. **[High]** Fix custom regex detection to actually pass regex to detection pipeline (H1)
3. **[High]** Honor explicit `encoding` parameter in `processTxt` (H2)
4. **[High]** Spread chapter objects in TypeScript reorder handlers to prevent mutation (H3)
5. **[High]** Enforce font file size limit (H4)
6. **[Medium]** Fix `_escape_xml` / `<br/>` ordering bug in Python (M3)
7. **[Medium]** Fix Python `filter_chapters_by_range` to not mutate input (M2)

---

## Metrics

| Metric | Value |
|--------|-------|
| Type Coverage | ~95% (minor: `encoding` param unused) |
| Test Coverage | 34/34 passing (pre-existing) |
| Critical Issues | 2 (1 blocking, 1 low-risk) |
| High Issues | 4 |
| Medium Issues | 5 |
| Low Issues | 3 |

---

## Unresolved Questions

1. Should the custom regex UI (`step-chapters.tsx`) call `detectWithCustomRegex()` directly, or should it go through the full `processDocument()` pipeline? The latter would require threading `customPattern` through `processDocument` -> `detectChaptersByPosition`.
2. Is there a business requirement for font files larger than 5-10 MB? Some CJK fonts with full character sets can be 15+ MB.
3. The `pandoc_writer.py` backend is never exposed in the web UI -- is it intended only for CLI power users?

**Status:** DONE
**Summary:** Found 2 critical (CSS/path injection via font filename), 4 high (dead regex UI, encoding bypass, state mutation, no size limit), 5 medium issues. No test regressions. Core chapter detection and encoding logic is solid.
