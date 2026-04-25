/**
 * Tab DOCX/TXT to EPUB - Main container for document to EPUB conversion wizard
 */

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepMetadata } from './step-metadata';
import { StepChapters } from './step-chapters';
import { StepPreview } from './step-preview';
import { StepExport } from './step-export';
import type { EpubMetadata, DetectedChapter } from '@/lib/epub';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'metadata', title: 'Thông tin' },
  { id: 'chapters', title: 'Chương' },
  { id: 'preview', title: 'Xem trước' },
  { id: 'export', title: 'Xuất file' },
];

export function TabDocToEpub() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<EpubMetadata>({
    title: '',
    author: '',
    language: 'vi',
  });
  const [chapters, setChapters] = useState<DetectedChapter[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [fontFile, setFontFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Auto-fill title from first file
    if (selectedFiles.length > 0) {
      const name = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
      setMetadata((prev) => ({ ...prev, title: name }));
    }
  }, []);

  const handleMetadataComplete = useCallback(
    (meta: EpubMetadata, cover: File | null, font: File | null) => {
      setMetadata(meta);
      setCoverImage(cover);
      setFontFile(font);
      setCurrentStep(2);
    },
    []
  );

  const handleChaptersDetected = useCallback((detected: DetectedChapter[]) => {
    setChapters(detected);
  }, []);

  const handleChaptersConfirmed = useCallback(
    (confirmed: DetectedChapter[]) => {
      setChapters(confirmed);
      setCurrentStep(3);
    },
    []
  );

  const handlePreviewConfirm = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setMetadata({ title: '', author: '', language: 'vi' });
    setChapters([]);
    setCoverImage(null);
    setFontFile(null);
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
          <StepMetadata
            metadata={metadata}
            coverImage={coverImage}
            fontFile={fontFile}
            onComplete={handleMetadataComplete}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepChapters
            files={files}
            onChaptersDetected={handleChaptersDetected}
            onConfirm={handleChaptersConfirmed}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepPreview
            metadata={metadata}
            chapters={chapters}
            onNext={handlePreviewConfirm}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepExport
            metadata={metadata}
            chapters={chapters}
            coverImage={coverImage}
            fontFile={fontFile}
            onReset={handleReset}
          />
        )}
      </StepContent>
    </div>
  );
}
