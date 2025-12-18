/**
 * Tab EPUB to DOC - Main container for EPUB to DOCX/TXT conversion wizard
 */

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepConfigure } from './step-configure';
import { StepConvert } from './step-convert';
import { StepDownload } from './step-download';
import type { ConvertResult } from '@/lib/epub-reader';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'configure', title: 'Cấu hình' },
  { id: 'convert', title: 'Chuyển đổi' },
  { id: 'download', title: 'Tải về' },
];

export type OutputFormat = 'docx' | 'txt';

export function TabEpubToDoc() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('docx');
  const [results, setResults] = useState<ConvertResult[]>([]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
  }, []);

  const handleFormatSelected = useCallback((format: OutputFormat) => {
    setOutputFormat(format);
    setCurrentStep(2);
  }, []);

  const handleConvertComplete = useCallback((converted: ConvertResult[]) => {
    setResults(converted);
    setCurrentStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setOutputFormat('docx');
    setResults([]);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step <= currentStep) {
        setCurrentStep(step);
      }
    },
    [currentStep]
  );

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
          <StepConfigure
            format={outputFormat}
            onFormatChange={setOutputFormat}
            onNext={() => handleFormatSelected(outputFormat)}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepConvert
            files={files}
            format={outputFormat}
            onComplete={handleConvertComplete}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && <StepDownload results={results} onReset={handleReset} />}
      </StepContent>
    </div>
  );
}
