# Code Review: Phase 01 - EPUB Reader Library

**Date:** 2025-12-18
**Reviewer:** code-reviewer
**Scope:** `src/lib/epub-reader/` (4 files, ~400 LOC)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 3 |

**Overall:** Clean, well-structured code. No security vulnerabilities. Minor improvements recommended.

---

## Critical Issues

None identified.

---

## High Priority

### 1. Missing XML Parse Error Handling
**File:** `epub-parser.ts`, `xhtml-to-docx.ts`, `xhtml-to-markdown.ts`

DOMParser does not throw on malformed XML - returns error document instead.

```typescript
// Current (vulnerable to silent failures)
const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');

// Recommended
const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
const parseError = doc.querySelector('parsererror');
if (parseError) {
  throw new Error(`XML parse error: ${parseError.textContent}`);
}
```

**Impact:** Malformed EPUB chapters silently produce empty/broken output.

---

## Medium Priority

### 2. Unused Imports (ESLint Warnings)
**File:** `xhtml-to-docx.ts:7`, `index.ts:7`

```
'Document' is defined but never used
'EpubXhtmlChapter' is defined but never used
```

**Fix:** Remove unused imports or use type-only imports.

### 3. Potential Stack Overflow on Deep Nesting
**File:** `xhtml-to-docx.ts:158`, `xhtml-to-markdown.ts:21`

`traverseForRuns()` and `processNodeToMd()` use recursion without depth limits.

**Risk:** Maliciously crafted EPUB with deeply nested elements could cause stack overflow.

**Recommendation:** Add max depth check (e.g., 100 levels) or convert to iterative.

### 4. Table Separator Always After First Row
**File:** `xhtml-to-markdown.ts:175-178`

Markdown table separator added after first row regardless of whether it's `<th>` or `<td>`.

**Impact:** Tables without headers get invalid separator placement.

---

## Low Priority

### 5. Magic Numbers
**Files:** `xhtml-to-docx.ts:128,205`, `index.ts:103`

- `720` (0.5 inch indent)
- `360` (0.25 inch)
- `10` (batch limit)

**Recommendation:** Extract to named constants.

### 6. Console.error in Library Code
**File:** `index.ts:123`

```typescript
console.error(`Failed to convert ${file.name}:`, error);
```

**Recommendation:** Use callback or return error info in result array.

### 7. Regex Without Escaping Check
**File:** `epub-parser.ts:81`

```typescript
if (!href.match(/\.(xhtml|html|htm|xml)$/i)) continue;
```

Safe for current use, but `href` from external source. Consider strict validation.

---

## Positive Observations

1. **Clean Architecture** - Single responsibility per file, clear exports
2. **TypeScript Strict Mode** - Full type safety enabled
3. **EPUB 2/3 Support** - Handles namespace variations correctly
4. **Edge Cases** - Empty table handling, batch file limits
5. **No XSS Risk** - DOMParser sandboxed, no innerHTML usage
6. **Good Documentation** - JSDoc on all public functions

---

## Recommended Actions

1. **[HIGH]** Add XML parse error detection after DOMParser calls
2. **[MED]** Fix ESLint warnings (unused imports)
3. **[MED]** Add recursion depth limit for DOM traversal
4. **[LOW]** Extract magic numbers to constants
5. **[LOW]** Replace console.error with structured error handling

---

## TypeScript & Lint Status

- **Type Check:** PASS (0 errors)
- **ESLint:** 2 warnings in epub-reader scope
  - `index.ts:7` - unused import
  - `xhtml-to-docx.ts:7` - unused import

---

## Security Assessment

| Check | Status |
|-------|--------|
| XSS Prevention | PASS - DOMParser sandboxed |
| Path Traversal | PASS - JSZip handles paths |
| DoS (zip bomb) | N/A - Browser memory limits |
| Injection | PASS - No eval/innerHTML |

---

## Conclusion

Phase 01 implementation is **production-ready** with minor improvements. Priority: fix XML parse error handling before production use.
