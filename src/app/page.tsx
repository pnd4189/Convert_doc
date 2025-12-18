/**
 * Main Page - File Converter & Chapter Splitter App
 */

'use client';

import { useState } from 'react';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { TabConvertSplit } from '@/components/tab-convert-split';
import { TabMergeEpub } from '@/components/tab-merge-epub';
import { TabEpubToDoc } from '@/components/tab-epub-to-doc';
import { TabDocToEpub } from '@/components/tab-doc-to-epub';

const TABS = [
  { id: 'convert-split', label: 'Chuyển đổi & Tách file' },
  { id: 'merge-epub', label: 'Gộp file & EPUB' },
  { id: 'epub-to-doc', label: 'EPUB sang DOCX/TXT' },
  { id: 'doc-to-epub', label: 'DOCX/TXT sang EPUB' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('convert-split');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Converter & Chapter Splitter
          </h1>
          <p className="text-gray-600">
            Công cụ chuyển đổi, tách và gộp file truyện - Hỗ trợ TXT, DOCX, EPUB
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

          <TabPanel id="convert-split" activeTab={activeTab}>
            <TabConvertSplit />
          </TabPanel>

          <TabPanel id="merge-epub" activeTab={activeTab}>
            <TabMergeEpub />
          </TabPanel>

          <TabPanel id="epub-to-doc" activeTab={activeTab}>
            <TabEpubToDoc />
          </TabPanel>

          <TabPanel id="doc-to-epub" activeTab={activeTab}>
            <TabDocToEpub />
          </TabPanel>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Tất cả xử lý được thực hiện trên trình duyệt - File không được tải lên server</p>
        </footer>
      </div>
    </div>
  );
}
