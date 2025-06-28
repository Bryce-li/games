"use client"

import { useState } from 'react'
import { ImageUpload } from '@/components/image-upload'
import { getOptimizedImageUrl } from '@/lib/image-manager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageIcon, Upload, FolderOpen, Settings } from 'lucide-react'

export function ImageUploadDemo() {
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string[] }>({
    thumbnails: [],
    'hero-images': [],
    screenshots: [],
    icons: []
  })

  const handleUploadSuccess = (folder: string, path: string) => {
    setUploadedImages(prev => ({
      ...prev,
      [folder]: [...prev[folder], path]
    }))
  }

  const getImageUrl = (path: string) => {
    return `https://nktexggbxevgaipfekkh.supabase.co/storage/v1/object/public/game-assets/${path}`
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Upload className="w-8 h-8" />
          Supabase Image Storage Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload and manage game images using Supabase Storage
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Images
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Image Gallery
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Storage Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['thumbnails', 'hero-images', 'screenshots', 'icons'].map((folder) => (
              <Card key={folder}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    {folder.replace('-', ' ')}
                  </CardTitle>
                  <CardDescription>
                    Upload {folder} for games to the {folder} directory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    gameId={`demo-${Date.now()}`}
                    folder={folder as any}
                    onUploadSuccess={(path) => handleUploadSuccess(folder, path)}
                    onUploadError={(error) => console.error('Upload error:', error)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          {Object.entries(uploadedImages).map(([folder, paths]) => (
            paths.length > 0 && (
              <Card key={folder}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {folder.replace('-', ' ')} ({paths.length} images)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paths.map((path, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-video relative overflow-hidden rounded-lg border">
                          <img
                            src={getImageUrl(path)}
                            alt={`${folder} ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {path}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
          
          {Object.values(uploadedImages).every(arr => arr.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  No images uploaded yet. Use the Upload tab to add some images.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Bucket Name</h4>
                  <p className="text-sm text-muted-foreground">game-assets</p>
                </div>
                <div>
                  <h4 className="font-medium">Allowed File Types</h4>
                  <p className="text-sm text-muted-foreground">JPEG, PNG, WebP, GIF</p>
                </div>
                <div>
                  <h4 className="font-medium">Max File Size</h4>
                  <p className="text-sm text-muted-foreground">5MB per file</p>
                </div>
                <div>
                  <h4 className="font-medium">Public Access</h4>
                  <p className="text-sm text-muted-foreground">Yes, all images are publicly accessible</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Directory Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-mono text-sm space-y-1">
                  <div>📁 game-assets/</div>
                  <div className="ml-4">📁 thumbnails/</div>
                  <div className="ml-4">📁 hero-images/</div>
                  <div className="ml-4">📁 screenshots/</div>
                  <div className="ml-4">📁 icons/</div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>API Usage Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Image URL Format:</h4>
                    <code className="text-sm bg-muted p-2 rounded block">
                      https://nktexggbxevgaipfekkh.supabase.co/storage/v1/object/public/game-assets/[path]
                    </code>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Upload Function:</h4>
                    <code className="text-sm bg-muted p-2 rounded block">
                      {`await uploadGameThumbnail(file, gameId, { folder: 'thumbnails' })`}
                    </code>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Get Optimized URL:</h4>
                    <code className="text-sm bg-muted p-2 rounded block">
                      {`getOptimizedImageUrl(path, { width: 400, height: 240 })`}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 