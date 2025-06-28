import type { Metadata } from 'next'
import { ImageUploadDemo } from './ImageUploadDemo'

export const metadata: Metadata = {
  title: 'Image Upload Demo - Supabase Storage',
  description: 'Demonstration of image upload functionality using Supabase Storage',
}

export default function ImageUploadPage() {
  return <ImageUploadDemo />
} 