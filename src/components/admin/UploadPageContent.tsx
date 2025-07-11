"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
// import { ExcelGameDataUploader } from '@/lib/excel-game-uploader';

interface UploadProgress {
  stage: string;
  current: number;
  total: number;
  message: string;
}

export function UploadPageContent() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean;
    error?: string;
    stats?: {
      successCount?: number;
      totalProcessed?: number;
      errorCount?: number;
      duplicateCount?: number;
    };
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请选择Excel文件 (.xlsx 或 .xls)');
      return;
    }

    setIsUploading(true);
    setProgress(null);
    setLogs([]);
    setUploadResult(null);

    try {
      // 暂时禁用上传功能，待后端API完善后再启用
      alert('上传功能暂时不可用，请联系管理员');
      
      /* 原上传代码暂时注释
      const uploader = new ExcelGameDataUploader();
      
      // 设置进度回调
      uploader.onProgress = (progress: UploadProgress) => {
        setProgress(progress);
      };

      // 设置日志回调
      uploader.onLog = (level: string, message: string) => {
        setLogs(prev => [...prev, `[${level.toUpperCase()}] ${message}`]);
      };

      const result = await uploader.uploadFromFile(file);
      setUploadResult(result);

      if (result.success) {
        alert(`上传成功！成功导入 ${result.stats?.successCount || 0} 个游戏`);
      } else {
        alert(`上传失败：${result.error}`);
      }
      */

    } catch (error) {
      console.error('上传出错:', error);
      alert(`上传出错：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
      setProgress(null);
      
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-1 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            游戏数据上传
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            上传Excel文件批量导入游戏数据到数据库
          </p>
        </div>

        {/* 文件选择区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            选择文件
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  选择Excel文件上传
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  支持 .xlsx 和 .xls 格式，最大文件大小 10MB
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-2"
              >
                {isUploading ? '上传中...' : '选择文件'}
              </Button>
            </div>
          </div>
        </div>

        {/* 上传进度 */}
        {progress && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              上传进度
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{progress.stage}</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progress.message}
              </p>
            </div>
          </div>
        )}

        {/* 日志输出 */}
        {logs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              上传日志
            </h2>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 上传结果 */}
        {uploadResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              上传结果
            </h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <p className={`font-medium ${uploadResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {uploadResult.success ? '✅ 上传成功' : '❌ 上传失败'}
                </p>
                
                {uploadResult.error && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    错误信息：{uploadResult.error}
                  </p>
                )}
              </div>

              {uploadResult.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {uploadResult.stats.totalProcessed}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      总计处理
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {uploadResult.stats.successCount}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      成功导入
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {uploadResult.stats.errorCount}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      失败数量
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {uploadResult.stats.duplicateCount || 0}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      重复跳过
                    </div>
                  </div>
                </div>
              )}

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    错误详情：
                  </h3>
                  <div className="space-y-2">
                    {uploadResult.errors.slice(0, 10).map((error: { row: number; error: string }, index: number) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        行 {error.row}: {error.error}
                      </div>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ... 还有 {uploadResult.errors.length - 10} 个错误
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 