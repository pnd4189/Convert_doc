/**
 * Tab Convert Split - Main container for Convert & Split wizard
 */

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepConvert } from './step-convert';
import { StepDetectChapters } from './step-detect-chapters';
import { StepSplitConfig } from './step-split-config';
import { StepDownload } from './step-download';
import { FileInfo } from '@/lib/file-processor';
import { Chapter } from '@/lib/chapter-parser';
import { ZipFile } from '@/lib/zip-builder';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'convert', title: 'Chuyển đổi' },
  { id: 'detect', title: 'Nhận diện' },
  { id: 'split', title: 'Tách file' },
  { id: 'download', title: 'Tải về' },
];

export function TabConvertSplit() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileInfo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [splitFiles, setSplitFiles] = useState<ZipFile[]>([]);
  const [baseName, setBaseName] = useState('');

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      const name = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
      setBaseName(name);
    }
  }, []);

  const handleConvertComplete = useCallback((converted: FileInfo[]) => {
    setProcessedFiles(converted);
    setCurrentStep(2);
  }, []);

  const handleSkipConvert = useCallback((fileInfos: FileInfo[]) => {
    setProcessedFiles(fileInfos);
    setCurrentStep(2);
  }, []);

  const handleChaptersDetected = useCallback((detected: Chapter[]) => {
    setChapters(detected);
    setCurrentStep(3);
  }, []);

  const handleSplitConfigured = useCallback((zipFiles: ZipFile[]) => {
    setSplitFiles(zipFiles);
    setCurrentStep(4);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setProcessedFiles([]);
    setChapters([]);
    setSplitFiles([]);
    setBaseName('');
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  // Get combined content from all processed files
  const combinedContent = processedFiles.map(f => f.content || '').join('\n\n');

  return (
    <div>
      <Stepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

      <StepContent>
        {currentStep === 0 && (
          <StepUpload
            files={files}
            onFilesChange={handleFilesSelected}
            onNext={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 1 && (
          <StepConvert
            files={files}
            onConvert={handleConvertComplete}
            onSkip={handleSkipConvert}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepDetectChapters
            content={combinedContent}
            onChaptersDetected={handleChaptersDetected}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepSplitConfig
            chapters={chapters}
            baseName={baseName}
            content={combinedContent}
            onConfigured={handleSplitConfigured}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepDownload
            files={splitFiles}
            zipName={`${baseName}_split.zip`}
            onReset={handleReset}
          />
        )}
      </StepContent>
    </div>
  );
}
