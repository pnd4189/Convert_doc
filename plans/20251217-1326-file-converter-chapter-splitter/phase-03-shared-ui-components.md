# Phase 03: Shared UI Components

**Parent:** [plan.md](./plan.md)
**Depends on:** Phase 01
**Status:** Pending
**Priority:** High

---

## Overview

Build reusable UI components: tabs, buttons, progress bar, file uploader, stepper.

---

## Requirements

### Functional
- Tab navigation (2 tabs)
- Step-by-step wizard component
- Drag & drop file uploader
- Progress bar với percentage
- Basic form inputs

### Non-Functional
- Vietnamese labels
- Responsive design
- Accessible (aria labels)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/tabs.tsx` | Tab container |
| `src/components/ui/button.tsx` | Button variants |
| `src/components/ui/progress.tsx` | Progress bar |
| `src/components/ui/file-dropzone.tsx` | Drag & drop upload |
| `src/components/ui/stepper.tsx` | Step wizard |
| `src/components/ui/input.tsx` | Text input |
| `src/components/ui/select.tsx` | Dropdown select |

---

## Implementation Steps

### Step 1: tabs.tsx

```typescript
interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}

export function Tabs({ tabs, activeTab, onChange, children }: TabsProps);
export function TabPanel({ id, activeTab, children }: TabPanelProps);
```

### Step 2: button.tsx

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'primary', ...props }: ButtonProps);
```

### Step 3: progress.tsx

```typescript
interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
}

export function Progress({ value, label, showPercent = true }: ProgressProps);
```

### Step 4: file-dropzone.tsx

```typescript
interface FileDropzoneProps {
  accept?: string; // ".txt,.doc,.docx"
  multiple?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropzone({
  accept = '.txt,.doc,.docx',
  multiple = true,
  maxFiles = 10,
  ...props
}: FileDropzoneProps);
```

UI:
- Dashed border area
- Drag overlay state
- File list preview
- Remove file button

### Step 5: stepper.tsx

```typescript
interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep }: StepperProps);
export function StepContent({ children }: { children: React.ReactNode });
```

### Step 6: input.tsx & select.tsx

```typescript
// Standard input with label
export function Input({ label, error, ...props }: InputProps);

// Select dropdown
export function Select({ label, options, ...props }: SelectProps);
```

---

## Styling Approach

Tailwind utility classes với consistent design tokens:

```css
/* globals.css additions */
:root {
  --primary: 59 130 246; /* blue-500 */
  --secondary: 107 114 128; /* gray-500 */
  --success: 34 197 94; /* green-500 */
  --error: 239 68 68; /* red-500 */
}
```

---

## Todo List

- [ ] Create tabs.tsx
- [ ] Create button.tsx với variants
- [ ] Create progress.tsx
- [ ] Create file-dropzone.tsx với drag & drop
- [ ] Create stepper.tsx
- [ ] Create input.tsx
- [ ] Create select.tsx
- [ ] Add Vietnamese labels
- [ ] Test responsive

---

## Success Criteria

- All components render correctly
- Drag & drop works
- Progress animates smoothly
- Responsive on mobile

---

## Next Steps

→ Phase 04: Tab 1 - Convert & Split
