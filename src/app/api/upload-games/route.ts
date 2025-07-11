import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { ExcelGameDataUploader } from '@/lib/excel-game-uploader';
import { createClient } from '@supabase/supabase-js';

// 配置最大文件大小 (10MB)
export const runtime = 'nodejs';
export const maxDuration = 300; // 5分钟超时

/**
 * 等待函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * POST /api/upload-games
 * 处理Excel游戏数据上传
 */
export async function POST(request: NextRequest) {
  let tempFilePath = '';
  
  try {
    console.log('🚀 API: 开始处理上传请求');
    
    const formData = await request.formData();
    console.log('📝 API: FormData解析成功');
    
    const file = formData.get('file') as File;
    console.log('📁 API: 获取文件对象:', !!file);
    
    if (!file) {
      console.log('❌ API: 没有文件上传');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload Excel files (.xlsx or .xls)' },
        { status: 400 }
      );
    }
    
    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }
    
    // 确保temp目录存在
    const tempDir = join(process.cwd(), 'temp');
    
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    // 保存临时文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    tempFilePath = join(tempDir, `upload-${timestamp}.xlsx`);
    
    try {
      await writeFile(tempFilePath, buffer, { flush: true });
      
      // 等待文件系统同步
      await sleep(100);
      
      // 验证文件是否存在且可读
      if (!existsSync(tempFilePath)) {
        throw new Error('文件保存后无法访问');
      }
      
      const stats = statSync(tempFilePath);
      
      if (stats.size !== buffer.length) {
        throw new Error(`文件大小不匹配: 期望 ${buffer.length}, 实际 ${stats.size}`);
      }
      
      // 再次等待确保文件完全写入
      await sleep(200);
      
      // 最终验证
      if (!existsSync(tempFilePath)) {
        throw new Error('最终验证：文件不存在');
      }
      
      // 获取上传配置
      const batchSize = parseInt(formData.get('batchSize') as string) || 10;
      const maxRetries = parseInt(formData.get('maxRetries') as string) || 3;
      
      // 创建上传器实例
      const uploader = new ExcelGameDataUploader({
        batchSize: Math.min(Math.max(batchSize, 1), 50), // 限制在1-50之间
        maxRetries: Math.min(Math.max(maxRetries, 1), 5), // 限制在1-5之间
        enableProgressLog: true,
        logLevel: 'info'
      });
      
      // 执行上传
      const result = await uploader.uploadFromFile(tempFilePath);
      
      // 清理临时文件
      await unlink(tempFilePath);
      
      return NextResponse.json({
        success: true,
        message: 'Upload completed successfully',
        result: result
      });
      
    } catch (uploadError) {
      console.error('❌ API: 上传处理失败:', uploadError);
      console.error('🔍 API: 错误堆栈:', uploadError instanceof Error ? uploadError.stack : 'No stack');
      
      // 确保清理临时文件
      try {
        if (tempFilePath && existsSync(tempFilePath)) {
          await unlink(tempFilePath);
        }
      } catch (cleanupError) {
        console.error('临时文件清理失败:', cleanupError);
      }
      
      throw uploadError;
    }
    
  } catch (error) {
    console.error('上传API错误:', error);
    console.error('错误详情:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload-games
 * 获取上传状态信息
 */
export async function GET() {
  try {
    // 这里可以返回当前数据库状态信息
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const [
      { count: gamesCount },
      { count: categoriesCount }, 
      { count: tagsCount }
    ] = await Promise.all([
      supabase.from('games').select('*', { count: 'exact', head: true }),
      supabase.from('game_tags').select('*', { count: 'exact', head: true }).eq('tag_type', 1),
      supabase.from('game_tags').select('*', { count: 'exact', head: true }).eq('tag_type', 2)
    ]);
    
    return NextResponse.json({
      status: 'ready',
      database: {
        totalGames: gamesCount || 0,
        totalCategories: categoriesCount || 0,
        totalTags: tagsCount || 0
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
} 