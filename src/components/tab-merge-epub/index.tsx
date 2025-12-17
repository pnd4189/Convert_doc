/**
 * Tab Merge EPUB - Main container for Merge & EPUB wizard
 */

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepReorder } from './step-reorder';
import { StepPreview } from './step-preview';
import { StepExport } from './step-export';
import { FileInfo } from '@/lib/file-processor';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'reorder', title: 'Sắp xếp' },
  { id: 'preview', title: 'Xem trước' },
  { id: 'export', title: 'Xuất file' },
];

export function TabMergeEpub() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileInfo[]>([]);
  const [mergedContent, setMergedContent] = useState('');

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
  }, []);

  const handleFilesProcessed = useCallback((processed: FileInfo[]) => {
    setProcessedFiles(processed);
    setCurrentStep(1);
  }, []);

  const handleReorderComplete = useCallback((reordered: FileInfo[]) => {
    setProcessedFiles(reordered);
    const merged = reordered.map(f => f.content || '').join('\n\n');
    setMergedContent(merged);
    setCurrentStep(2);
  }, []);

  const handlePreviewConfirm = useCallback(() => {
    setCurrentStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setProcessedFiles([]);
    setMergedContent('');
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  // Get default name from first file
  const defaultName = processedFiles.length > 0
    ? processedFiles[0].name.replace(/\.[^/.]+$/, '') + '_merged'
    : 'merged';

  return (
    <div>
      <Stepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

      <StepContent>
        {currentStep === 0 && (
          <StepUpload
            files={files}
            onFilesChange={handleFilesSelected}
            onNext={handleFilesProcessed}
          />
        )}

        {currentStep === 1 && (
          <StepReorder
            files={processedFiles}
            onReorder={handleReorderComplete}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepPreview
            content={mergedContent}
            onNext={handlePreviewConfirm}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepExport
            content={mergedContent}
            defaultName={defaultName}
            onReset={handleReset}
          />
        )}
      </StepContent>
    </div>
  );
}
