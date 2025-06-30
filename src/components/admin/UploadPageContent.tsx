"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database,
  Settings,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface UploadConfig {
  batchSize: number;
  maxRetries: number;
}

interface DatabaseStats {
  totalGames: number;
  totalCategories: number;
  totalTags: number;
}

interface ValidationDetails {
  success: boolean;
  details: {
    games: {
      expected: number;
      processed: number;
      errors: number;
      status: string;
    };
    categories: {
      expected: number;
      processed: number;
      errors: number;
      status: string;
    };
    database: {
      totalGames: number;
      totalCategories: number;
      totalTags: number;
    };
  };
  recommendations: string[];
}

interface UploadResult {
  success: boolean;
  summary?: {
    status: string;
    duration: string;
    totalProcessed: number;
    totalErrors: number;
    successRate: string;
  };
  details?: {
    parsing: {
      totalRows: number;
      validRows: number;
      updateRows: number;
      estimatedGames: number;
      estimatedCategories: number;
      estimatedTags: number;
    };
    uploading: {
      games: { processed: number; errors: number; skipped: number };
      tags: { processed: number; errors: number };
    };
    validation: ValidationDetails;
  };
  recommendations?: string[];
  error?: string;
  errorDetails?: string;
}

export function UploadPageContent() {
  // 状态管理
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  
  // 配置状态
  const [config, setConfig] = useState<UploadConfig>({
    batchSize: 10,
    maxRetries: 3
  });

  // 拖拽上传配置
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // 获取数据库状态
  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/upload-games');
      if (response.ok) {
        const data = await response.json();
        setDatabaseStats(data.database);
      }
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  // 组件挂载时加载数据库状态
  React.useEffect(() => {
    loadDatabaseStats();
  }, []);

  // 处理文件上传
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchSize', config.batchSize.toString());
      formData.append('maxRetries', config.maxRetries.toString());

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch('/api/upload-games', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadResult({
          success: true,
          summary: result.result.summary,
          details: result.result.details,
          recommendations: result.result.recommendations
        });
        
        // 刷新数据库状态
        await loadDatabaseStats();
      } else {
        setUploadResult({
          success: false,
          error: result.error || 'Upload failed',
          errorDetails: result.details || ''
        });
      }

    } catch (error) {
      setUploadResult({
        success: false,
        error: 'Network error',
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // 重置上传状态
  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Excel Game Data Upload</h1>
        <p className="text-gray-600">
          Upload game data from Excel files with automated processing and validation
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Database Stats
          </TabsTrigger>
        </TabsList>

        {/* 上传标签页 */}
        <TabsContent value="upload" className="space-y-6">
          {/* 文件上传区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Select Excel File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                  ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  ${file ? 'border-green-400 bg-green-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-lg font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetUpload();
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-lg">
                      {isDragActive ? 'Drop the Excel file here' : 'Drag & drop or click to select'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports .xlsx and .xls files (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* 上传按钮和进度 */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Batch Size: <Badge variant="outline">{config.batchSize} games</Badge>
                    {' '} Max Retries: <Badge variant="outline">{config.maxRetries}</Badge>
                  </div>
                  
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="min-w-32"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Start Upload
                      </>
                    )}
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 上传结果显示 */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  Upload Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadResult.success ? (
                  <div className="space-y-4">
                    {/* 成功摘要 */}
                    {uploadResult.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {uploadResult.summary.totalProcessed}
                          </div>
                          <div className="text-sm text-gray-600">Games Processed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {uploadResult.summary.successRate}
                          </div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {uploadResult.summary.duration}
                          </div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {uploadResult.summary.totalErrors}
                          </div>
                          <div className="text-sm text-gray-600">Errors</div>
                        </div>
                      </div>
                    )}

                    {/* 详细信息 */}
                    {uploadResult.details && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Detailed Results</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="font-medium">File Parsing</h5>
                            <ul className="text-sm space-y-1">
                              <li>Total Rows: {uploadResult.details.parsing.totalRows}</li>
                              <li>Valid Rows: {uploadResult.details.parsing.validRows}</li>
                              <li>Update Rows: {uploadResult.details.parsing.updateRows}</li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h5 className="font-medium">Upload Results</h5>
                            <ul className="text-sm space-y-1">
                              <li>Games: {uploadResult.details.uploading.games.processed} processed, {uploadResult.details.uploading.games.errors} errors</li>
                              <li>Tags: {uploadResult.details.uploading.tags.processed} processed, {uploadResult.details.uploading.tags.errors} errors</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 建议 */}
                    {uploadResult.recommendations && uploadResult.recommendations.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Recommendations:</strong>
                          <ul className="mt-2 space-y-1">
                            {uploadResult.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">• {rec}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  // 错误显示
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Upload Failed:</strong> {uploadResult.error}
                      {uploadResult.errorDetails && (
                        <div className="mt-2 text-sm font-mono bg-red-50 p-2 rounded">
                          {uploadResult.errorDetails}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 设置标签页 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size (games per batch)</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="50"
                    value={config.batchSize}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      batchSize: parseInt(e.target.value) || 10
                    }))}
                  />
                  <p className="text-sm text-gray-600">
                    Number of games to process in each batch (1-50)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="1"
                    max="5"
                    value={config.maxRetries}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      maxRetries: parseInt(e.target.value) || 3
                    }))}
                  />
                  <p className="text-sm text-gray-600">
                    Maximum retry attempts for failed operations (1-5)
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Only rows with "是" in the "是否更新" column will be processed.
                  Smaller batch sizes are more reliable but slower.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据库状态标签页 */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Current Database Status
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDatabaseStats}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {databaseStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {databaseStats.totalGames.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Total Games</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {databaseStats.totalCategories.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Categories</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {databaseStats.totalTags.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Tags</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-600">Loading database statistics...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 