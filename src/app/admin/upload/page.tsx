import type { Metadata } from 'next';
import { UploadPageContent } from '@/components/admin/UploadPageContent';

export const metadata: Metadata = {
  title: 'Game Data Upload - Mini Play Game',
  description: 'Upload game data from Excel files'
};

export default function UploadPage() {
  return <UploadPageContent />;
} 