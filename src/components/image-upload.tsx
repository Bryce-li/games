"use client"

import { useState, useCallback } from 'react'
import { uploadGameThumbnail } from '@/lib/image-manager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  gameId?: string
  folder?: 'thumbnails' | 'hero-images' | 'screenshots' | 'icons'
  onUploadSuccess?: (path: string) => void
  onUploadError?: (error: string) => void
  maxSizeMB?: number
  accept?: string
}

export function ImageUpload({
  gameId = 'temp',
  folder = 'thumbnails',
  onUploadSuccess,
  onUploadError,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/png,image/webp,image/gif'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    
    // 验证文件大小
    if (file.size > maxSizeMB * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB`
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // 验证文件类型
    if (!accept.split(',').some(type => file.type.includes(type.replace('image/', '')))) {
      const errorMsg = 'Invalid file type. Please upload an image file.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 上传文件
    setIsUploading(true)
    try {
      const result = await uploadGameThumbnail(file, gameId, { folder })
      
      if (result.success && result.path) {
        onUploadSuccess?.(result.path)
      } else {
        const errorMsg = result.error || 'Upload failed'
        setError(errorMsg)
        onUploadError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      onUploadError?.(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }, [gameId, folder, maxSizeMB, accept, onUploadSuccess, onUploadError])

  // 处理文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // 处理拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // 清除预览
  const clearPreview = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">
          Upload Image for {folder}
        </Label>
        <div
          className={`
            mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-48 mx-auto rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearPreview}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {isUploading ? (
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              ) : (
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-600">
                  {isUploading 
                    ? 'Uploading...' 
                    : 'Drag and drop an image here, or click to select'
                  }
                </p>
                <p className="text-xs text-gray-400">
                  Max size: {maxSizeMB}MB | Formats: JPEG, PNG, WebP, GIF
                </p>
              </div>
            </div>
          )}
          
          <Input
            id="image-upload"
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// 使用示例组件
export function ImageUploadExample() {
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Game Image Upload</h2>
      
      <ImageUpload
        gameId="demo-game"
        folder="thumbnails"
        onUploadSuccess={(path) => {
          console.log('✅ Upload successful:', path)
          setUploadedPath(path)
        }}
        onUploadError={(error) => {
          console.error('❌ Upload failed:', error)
        }}
      />

      {uploadedPath && (
        <Alert>
          <ImageIcon className="w-4 h-4" />
          <AlertDescription>
            Image uploaded successfully! Path: {uploadedPath}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 