# Phase 01: Project Setup

**Parent:** [plan.md](./plan.md)
**Status:** Pending
**Priority:** Critical

---

## Overview

Initialize Next.js 16 project với React 19 và Tailwind CSS 4. Setup cấu hình cơ bản.

---

## Requirements

### Functional
- Init Next.js 16.0.10 với TypeScript
- Configure Tailwind CSS 4.1.18
- Install all dependencies
- Setup folder structure

### Non-Functional
- App Router structure
- Static export ready
- Vietnamese font support

---

## Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Dependencies |
| `next.config.ts` | Next.js config |
| `tailwind.config.ts` | Tailwind config |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Main page stub |
| `src/app/globals.css` | Global styles |

---

## Implementation Steps

### Step 1: Init Project
```bash
npx create-next-app@16.0.10 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Step 2: Install Dependencies
```bash
npm install mammoth@1.11.0 docx@9.5.1 jszip@3.10.1 epub-gen-memory@1.1.2 file-saver@2.0.5
npm install -D @types/file-saver
```

### Step 3: Configure next.config.ts
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
```

### Step 4: Setup Vietnamese Meta
Update `layout.tsx`:
```typescript
export const metadata = {
  title: 'File Converter & Chapter Splitter',
  description: 'Chuyển đổi và tách file truyện',
};
```

### Step 5: Create Folder Structure
```
src/
├── components/
│   ├── ui/
│   ├── tab-convert-split/
│   └── tab-merge-epub/
├── lib/
└── workers/
```

---

## Todo List

- [ ] Run create-next-app
- [ ] Install dependencies
- [ ] Configure next.config.ts for static export
- [ ] Update layout.tsx metadata
- [ ] Create folder structure
- [ ] Verify dev server runs

---

## Success Criteria

- `npm run dev` runs without errors
- All dependencies installed
- Folder structure ready
- Static export works (`npm run build`)

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Version mismatch | Use exact versions |
| Tailwind 4 breaking changes | Follow official docs |

---

## Next Steps

→ Phase 02: Core Libraries
