# Phase 06: Web Workers Integration

**Parent:** [plan.md](./plan.md)
**Depends on:** Phase 02, Phase 04, Phase 05
**Status:** Pending
**Priority:** Medium

---

## Overview

Move heavy file processing to Web Workers để tránh block UI thread. Essential cho file >25MB.

---

## Requirements

### Functional
- File reading in worker
- DOCX conversion in worker
- Chapter parsing in worker
- ZIP generation in worker
- Progress reporting to main thread

### Non-Functional
- Main thread stays responsive
- Progress updates real-time
- Error handling across threads

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/workers/file-worker.ts` | Main worker script |
| `src/lib/worker-client.ts` | Main thread API |
| `next.config.ts` | Worker webpack config |

---

## Implementation Steps

### Step 1: Worker Configuration (next.config.ts)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

### Step 2: file-worker.ts

```typescript
// Message types
type WorkerMessage =
  | { type: 'READ_FILE'; file: File }
  | { type: 'CONVERT_DOCX_TO_TEXT'; arrayBuffer: ArrayBuffer }
  | { type: 'CONVERT_TEXT_TO_DOCX'; text: string; filename: string }
  | { type: 'PARSE_CHAPTERS'; text: string; pattern: string }
  | { type: 'CREATE_ZIP'; files: { name: string; content: string }[] };

type WorkerResponse =
  | { type: 'PROGRESS'; percent: number; message?: string }
  | { type: 'RESULT'; data: unknown }
  | { type: 'ERROR'; error: string };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  try {
    switch (type) {
      case 'READ_FILE':
        await handleReadFile(e.data.file);
        break;
      case 'CONVERT_DOCX_TO_TEXT':
        await handleDocxToText(e.data.arrayBuffer);
        break;
      case 'PARSE_CHAPTERS':
        await handleParseChapters(e.data.text, e.data.pattern);
        break;
      case 'CREATE_ZIP':
        await handleCreateZip(e.data.files);
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

function reportProgress(percent: number, message?: string) {
  self.postMessage({ type: 'PROGRESS', percent, message });
}

async function handleReadFile(file: File) {
  const text = await file.text();
  reportProgress(100);
  self.postMessage({ type: 'RESULT', data: text });
}

async function handleParseChapters(text: string, patternStr: string) {
  const pattern = new RegExp(patternStr, 'gim');
  const lines = text.split('\n');
  const chapters: Chapter[] = [];
  // ... parsing logic with progress
  self.postMessage({ type: 'RESULT', data: chapters });
}

async function handleCreateZip(files: ZipFile[]) {
  const zip = new JSZip();
  for (let i = 0; i < files.length; i++) {
    zip.file(files[i].name, files[i].content);
    reportProgress(Math.round((i / files.length) * 100));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  self.postMessage({ type: 'RESULT', data: blob });
}
```

### Step 3: worker-client.ts

```typescript
type WorkerTask<T> = {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  onProgress?: (percent: number, message?: string) => void;
};

let worker: Worker | null = null;
let currentTask: WorkerTask<unknown> | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/file-worker.ts', import.meta.url));
    worker.onmessage = handleMessage;
    worker.onerror = handleError;
  }
  return worker;
}

function handleMessage(e: MessageEvent<WorkerResponse>) {
  if (!currentTask) return;

  switch (e.data.type) {
    case 'PROGRESS':
      currentTask.onProgress?.(e.data.percent, e.data.message);
      break;
    case 'RESULT':
      currentTask.resolve(e.data.data);
      currentTask = null;
      break;
    case 'ERROR':
      currentTask.reject(new Error(e.data.error));
      currentTask = null;
      break;
  }
}

export async function readFileInWorker(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    currentTask = { resolve, reject, onProgress };
    getWorker().postMessage({ type: 'READ_FILE', file });
  });
}

export async function parseChaptersInWorker(
  text: string,
  pattern: string,
  onProgress?: (percent: number) => void
): Promise<Chapter[]> {
  return new Promise((resolve, reject) => {
    currentTask = { resolve, reject, onProgress };
    getWorker().postMessage({ type: 'PARSE_CHAPTERS', text, pattern });
  });
}

export async function createZipInWorker(
  files: ZipFile[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    currentTask = { resolve, reject, onProgress };
    getWorker().postMessage({ type: 'CREATE_ZIP', files });
  });
}
```

### Step 4: Update Components

Replace direct lib calls with worker-client calls:

```typescript
// Before (blocks UI)
const chapters = parseChapters(content, pattern);

// After (non-blocking)
const chapters = await parseChaptersInWorker(content, pattern.source, setProgress);
```

---

## Todo List

- [ ] Create file-worker.ts
- [ ] Create worker-client.ts
- [ ] Update next.config.ts for worker support
- [ ] Migrate file reading to worker
- [ ] Migrate chapter parsing to worker
- [ ] Migrate ZIP creation to worker
- [ ] Test with 25MB+ files
- [ ] Add progress callbacks to UI

---

## Success Criteria

- UI stays responsive during processing
- Progress bar updates smoothly
- 25MB+ files process without freeze
- Error handling works across threads

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Worker not supported | Feature detection, fallback to main thread |
| Transferable objects | Use ArrayBuffer for large data |
| Memory leaks | Terminate worker on unmount |

---

## Next Steps

→ Phase 07: Testing & Deploy
