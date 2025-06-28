// 游戏图片管理系统 - 统一处理缩略图存储和优化
import { supabase } from './supabase'

// 图片配置接口
interface ImageConfig {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
}

// 默认图片配置
const DEFAULT_CONFIG: ImageConfig = {
  width: 400,
  height: 240,
  quality: 80,
  format: 'webp'
}

// 图片尺寸预设
export const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 240 },    // 游戏卡片缩略图
  hero: { width: 1200, height: 600 },        // 英雄区大图
  card: { width: 300, height: 180 },         // 小卡片
  detail: { width: 800, height: 480 },       // 详情页图片
} as const

/**
 * 生成优化的图片URL
 * 支持Supabase Storage的自动图片转换
 */
export function getOptimizedImageUrl(
  imagePath: string, 
  config: ImageConfig = DEFAULT_CONFIG
): string {
  if (!imagePath) {
    return getPlaceholderImage(config.width, config.height)
  }

  // 如果是外部URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // 使用Supabase Storage的图片转换功能
  const { data } = supabase.storage
    .from('game-assets')
    .getPublicUrl(imagePath, {
      transform: {
        width: config.width,
        height: config.height,
        quality: config.quality
      }
    })

  return data.publicUrl
}

/**
 * 生成响应式图片URL集合
 * 用于不同设备和屏幕密度
 */
export function getResponsiveImageUrls(imagePath: string) {
  const baseWidth = 400
  
  return {
    '1x': getOptimizedImageUrl(imagePath, { width: baseWidth }),
    '2x': getOptimizedImageUrl(imagePath, { width: baseWidth * 2 }),
    mobile: getOptimizedImageUrl(imagePath, { width: 300 }),
    tablet: getOptimizedImageUrl(imagePath, { width: 600 }),
    desktop: getOptimizedImageUrl(imagePath, { width: 800 }),
  }
}

/**
 * 生成占位符图片URL
 * 用于加载失败或无图片时的备用显示
 */
export function getPlaceholderImage(width: number = 400, height: number = 240): string {
  // 使用picsum.photos生成占位符，或者返回本地默认图片
  return `https://picsum.photos/${width}/${height}?random=game&grayscale&blur=1`
}

/**
 * 为游戏生成完整的图片URL集合
 */
export function getGameImageUrls(game: { id: string; image?: string; thumbnail?: string }) {
  const imagePath = game.thumbnail || game.image || `thumbnails/${game.id}.webp`
  
  return {
    thumbnail: getOptimizedImageUrl(imagePath, IMAGE_SIZES.thumbnail),
    hero: getOptimizedImageUrl(imagePath, IMAGE_SIZES.hero),
    card: getOptimizedImageUrl(imagePath, IMAGE_SIZES.card),
    detail: getOptimizedImageUrl(imagePath, IMAGE_SIZES.detail),
    responsive: getResponsiveImageUrls(imagePath),
    placeholder: getPlaceholderImage()
  }
}

/**
 * 上传游戏缩略图到Supabase Storage
 */
export async function uploadGameThumbnail(
  file: File, 
  gameId: string,
  options: { folder?: string } = {}
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const folder = options.folder || 'thumbnails'
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${gameId}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('game-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // 允许覆盖现有文件
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, path: data.path }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败' 
    }
  }
}

/**
 * 批量预加载图片
 * 用于提升用户体验
 */
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  const promises = imageUrls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve() // 即使失败也继续
      img.src = url
    })
  })

  return Promise.all(promises)
}

/**
 * 图片懒加载hook（用于React组件）
 */
export function useImageLazyLoad() {
  return {
    loading: "lazy" as const,
    decoding: "async" as const,
    placeholder: "blur" as const,
  }
}

// 导出常用的图片处理函数
export {
  DEFAULT_CONFIG
} 