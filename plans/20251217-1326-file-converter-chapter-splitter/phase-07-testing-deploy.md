# Phase 07: Testing & Deploy

**Parent:** [plan.md](./plan.md)
**Depends on:** All previous phases
**Status:** Pending
**Priority:** Medium

---

## Overview

Test ứng dụng với các file thực tế, fix bugs, và deploy lên Vercel.

---

## Requirements

### Testing
- Test với file TXT/DOCX các kích thước
- Test batch processing 10 files
- Test file >25MB
- Test chapter detection với các pattern
- Test EPUB generation
- Test cross-browser (Chrome, Firefox, Edge)

### Deployment
- Static export works
- Vercel deployment
- Performance optimization

---

## Testing Checklist

### Tab 1: Convert & Split

| Test Case | Expected |
|-----------|----------|
| Upload 1 TXT file | File appears in list |
| Upload 10 files | All 10 shown |
| Upload >10 files | Error message |
| Upload 25MB file | Processes without freeze |
| Convert TXT→DOCX | Downloads valid DOCX |
| Convert DOCX→TXT | Extracts text correctly |
| Skip convert | Proceeds to next step |
| Preset pattern | Finds chapters correctly |
| Custom regex | Works with valid regex |
| Invalid regex | Shows error message |
| Split 2000 chapters / 12 per file | Creates ~167 files |
| Download ZIP | ZIP contains all files |

### Tab 2: Merge & EPUB

| Test Case | Expected |
|-----------|----------|
| Upload multiple files | All listed |
| Reorder files | Order changes |
| Merge preview | Shows combined content |
| Download TXT | Downloads merged file |
| Convert to EPUB | Downloads valid EPUB |

### Performance

| Test Case | Expected |
|-----------|----------|
| 25MB file processing | UI responsive |
| Progress bar | Updates smoothly |
| Memory usage | No leaks after reset |

---

## Implementation Steps

### Step 1: Create Test Files

```bash
# Create test directory
mkdir -p test-files

# Generate sample TXT with chapters
# (Manual: create file with "Chương 1", "Chương 2", etc.)
```

### Step 2: Manual Testing

1. Run dev server: `npm run dev`
2. Test each feature systematically
3. Document bugs found

### Step 3: Fix Identified Issues

- Track bugs in TODO
- Fix and re-test

### Step 4: Build & Static Export

```bash
npm run build
```

Verify:
- No build errors
- `out/` folder created
- Static HTML works

### Step 5: Deploy to Vercel

Option A: CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

Option B: GitHub Integration
1. Push to GitHub
2. Connect repo to Vercel
3. Auto-deploy on push

### Step 6: Post-Deploy Verification

- Test production URL
- Check all features work
- Test on mobile

---

## Vercel Configuration

Create `vercel.json` (optional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

---

## Performance Optimization

### Before Deploy

1. **Analyze bundle:**
   ```bash
   npm run build
   # Check output size
   ```

2. **Lazy load heavy libraries:**
   ```typescript
   const mammoth = await import('mammoth');
   ```

3. **Code splitting:**
   - Tab components already separate
   - Workers loaded on demand

---

## Todo List

- [ ] Create test files (various sizes)
- [ ] Test Tab 1 complete flow
- [ ] Test Tab 2 complete flow
- [ ] Test 25MB+ files
- [ ] Test cross-browser
- [ ] Fix identified bugs
- [ ] Run production build
- [ ] Deploy to Vercel
- [ ] Verify production deployment
- [ ] Test on mobile

---

## Success Criteria

- All test cases pass
- Build succeeds
- Vercel deployment live
- All features work in production
- Mobile responsive

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Build fails | Check dependencies, Next.js config |
| Vercel errors | Check output format, static export |
| Production bugs | Test thoroughly before deploy |

---

## Unresolved Questions

None.
