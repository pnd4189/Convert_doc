# Code Standards

**Last Updated:** 2026-04-25

## TypeScript Configuration

- **Strict mode** enabled (`strict: true`)
- **Target:** ES2017
- **Module resolution:** bundler
- **Path alias:** `@/*` maps to `./src/*`
- **JSX:** react-jsx (no explicit React imports needed)

## File Naming

### Source Files
- **kebab-case** for all file names: `chapter-parser.ts`, `cover-handler.ts`, `file-dropzone.tsx`
- Long descriptive names are preferred for self-documentation
- Component directories match tab name: `tab-convert-split/`, `tab-merge-epub/`

### Step Components
Each tab wizard uses numbered step files:
```
tab-convert-split/
├── index.tsx              # Wizard container
├── step-upload.tsx        # Step 1: Upload
├── step-convert.tsx       # Step 2: Convert
├── step-detect-chapters.tsx  # Step 3: Detect
├── step-split-config.tsx  # Step 4: Configure
└── step-download.tsx      # Step 5: Download
```

### Test Files
- Co-located with source: `chapter-parser.test.ts` next to `chapter-parser.ts`
- Inside the same directory for lib modules: `epub/chapter-builder.test.ts`

## Component Patterns

### Tab Container Pattern
Each tab follows the wizard pattern:
1. `useState` for `currentStep` and step-specific data
2. `STEPS` constant array with `{ id, title }` objects
3. `Stepper` component for navigation
4. `StepContent` wrapper for step body
5. `useCallback` for all step handlers
6. `handleReset` function to clear all state

```tsx
const STEPS = [
  { id: 'upload', title: 'Upload' },
  { id: 'convert', title: 'Convert' },
];

export function TabFeature() {
  const [currentStep, setCurrentStep] = useState(0);
  // ... state per step

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    // clear all state
  }, []);

  return (
    <Stepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />
    <StepContent>
      {currentStep === 0 && <StepUpload ... />}
      {currentStep === 1 && <StepConvert ... />}
    </StepContent>
  );
}
```

### UI Components
Located in `components/ui/`:
- `button.tsx` — Styled button
- `input.tsx` — Styled input
- `select.tsx` — Styled select dropdown
- `progress.tsx` — Progress bar
- `stepper.tsx` — Step wizard navigation
- `tabs.tsx` — Tab navigation with `Tabs` and `TabPanel`
- `file-dropzone.tsx` — Drag-and-drop file upload

### Client Components
All components using React state/hooks include `'use client'` directive at the top of the file.

## Library Module Pattern

Each library module in `src/lib/` follows:
1. **JSDoc comment** at top describing purpose
2. **Interfaces** exported for public API
3. **Implementation** with private helper functions
4. **Re-exports** at bottom for convenience

```typescript
/**
 * Module Name - Brief description
 */

export interface PublicType { /* ... */ }

// Private helpers (not exported)
function privateHelper() { /* ... */ }

// Public API
export function publicFunction() { /* ... */ }

// Re-exports
export { something } from './other-module';
```

## Error Handling

- `try/catch` for async operations (file reading, ZIP generation)
- User-facing error messages in Vietnamese: `'Khong the doc file'`, `'Dinh dang file khong duoc ho tro'`
- Batch operations continue on individual failures (log error, continue)
- Validation functions return `{ valid: boolean; error?: string }` objects

## Data Flow Conventions

1. Files enter via `FileDropzone` -> `File[]`
2. `FileReader` / `file.arrayBuffer()` for reading
3. `TextDecoder` with encoding fallback for TXT files
4. `mammoth` for DOCX -> text/HTML
5. All intermediate data as strings (text, HTML, XHTML)
6. Output via `file-saver` (`saveAs()`) or `JSZip.generateAsync()`

## Import Conventions

- Use `@/` path alias for imports from `src/`
- Group imports: external libs -> internal modules -> types
- Use `import type` for type-only imports

```typescript
import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import type { EpubChapter, EpubMetadata } from './types';
import { generateUUID } from './utils';
```

## CSS and Styling

- Tailwind CSS 4 utility classes only
- No CSS modules or styled-components
- Responsive layout: `max-w-4xl mx-auto`
- Color scheme: gray backgrounds, blue accents, white cards

## Testing Conventions

- **Framework:** vitest
- **Co-located:** test files next to source files
- **Naming:** `describe()` groups, `it()` for individual cases
- **No vitest config file** -- using defaults from package.json
- Tests cover: chapter detection, template generation, XHTML building
- No mocking of external libraries -- test real behavior

## Build and Deploy

- `output: 'export'` in `next.config.ts` -- static HTML
- `images: { unoptimized: true }` -- no Next.js image optimization
- Deployable to any static host (Vercel, Netlify, GitHub Pages)
