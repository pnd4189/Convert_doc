/**
 * Tab TXT to EPUB - Enhanced TXT to EPUB with encoding detection, CJK font, pattern selection
 */

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepSetup, type TxtToEpubSetup } from './step-setup';
import { StepChapters } from './step-chapters';
import { StepExport } from './step-export';
import type { DetectedChapter } from '@/lib/epub';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'setup', title: 'Cài đặt' },
  { id: 'chapters', title: 'Chương' },
  { id: 'export', title: 'Xuất file' },
];

const DEFAULT_SETUP: TxtToEpubSetup = {
  metadata: { title: '', author: '', language: 'vi' },
  encoding: 'auto',
  coverImage: null,
  fontFile: null,
  useDefaultCjkFont: false,
};

export function TabTxtToEpub() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [setup, setSetup] = useState<TxtToEpubSetup>(DEFAULT_SETUP);
  const [chapters, setChapters] = useState<DetectedChapter[]>([]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      const name = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
      setSetup((prev) => ({ ...prev, metadata: { ...prev.metadata, title: name } }));
    }
  }, []);

  const handleSetupComplete = useCallback((s: TxtToEpubSetup) => {
    setSetup(s);
    setCurrentStep(2);
  }, []);

  const handleChaptersConfirmed = useCallback((confirmed: DetectedChapter[]) => {
    setChapters(confirmed);
    setCurrentStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setSetup(DEFAULT_SETUP);
    setChapters([]);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step <= currentStep) setCurrentStep(step);
  }, [currentStep]);

  return (
    <div>
      <Stepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

      <StepContent>
        {currentStep === 0 && (
          <StepUpload files={files} onFilesChange={handleFilesSelected} onNext={() => setCurrentStep(1)} />
        )}
        {currentStep === 1 && (
          <StepSetup files={files} initial={setup} onComplete={handleSetupComplete} onBack={() => setCurrentStep(0)} />
        )}
        {currentStep === 2 && (
          <StepChapters
            files={files}
            encoding={setup.encoding}
            onConfirm={handleChaptersConfirmed}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepExport
            metadata={setup.metadata}
            chapters={chapters}
            coverImage={setup.coverImage}
            fontFile={setup.fontFile}
            useDefaultCjkFont={setup.useDefaultCjkFont}
            onReset={handleReset}
          />
        )}
      </StepContent>
    </div>
  );
}
