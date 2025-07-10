import type { TFunction } from 'i18next'

/**
 * 生成国际化的分类标题
 * 将分类名和"Games"后缀分开处理，支持完整的国际化
 * 
 * @param t - i18next的翻译函数
 * @param categoryKey - 分类键值（如'action', 'adventure'）
 * @param options - 配置选项
 * @returns 完整的国际化分类标题
 */
export function generateCategoryTitle(
  t: TFunction,
  categoryKey: string,
  options: {
    includeGames?: boolean // 是否包含"Games"后缀
    fallbackTitle?: string // 备用标题（用于数据库配置的标题）
  } = { includeGames: true }
) {
  const { includeGames = true, fallbackTitle } = options

  // 特殊分类处理（这些分类有特殊的命名规则）
  const specialCategories: Record<string, string> = {
    'new': t('navigation.new', 'New'),
    'trending': t('navigation.trending', 'Trending Now'),
    'updated': t('navigation.updated', 'Updated'),
    'multiplayer': t('navigation.multiplayer', 'Multiplayer'),
    'two-player': t('navigation.twoPlayer', '2 Player'),
    'featured': t('categories.featured', 'Featured')
  }

  // 如果是特殊分类，直接返回（这些分类已经包含了合适的后缀）
  if (specialCategories[categoryKey]) {
    const baseTitle = specialCategories[categoryKey]
    // 对于特殊分类，只有部分需要添加"Games"后缀
    if (includeGames && ['new', 'featured', 'multiplayer', 'two-player'].includes(categoryKey)) {
      return `${baseTitle} ${t('categories.gamesTitle', 'Games')}`
    }
    return baseTitle
  }

  // 普通分类处理
  const categoryName = t(`categories.${categoryKey}`, fallbackTitle || categoryKey)
  
  if (includeGames) {
    return `${categoryName} ${t('categories.gamesTitle', 'Games')}`
  }
  
  return categoryName
}

/**
 * 获取分类的基础名称（不含"Games"后缀）
 * 
 * @param t - i18next的翻译函数
 * @param categoryKey - 分类键值
 * @param fallbackTitle - 备用标题
 * @returns 分类的基础名称
 */
export function getCategoryBaseName(
  t: TFunction,
  categoryKey: string,
  fallbackTitle?: string
) {
  return generateCategoryTitle(t, categoryKey, { 
    includeGames: false, 
    fallbackTitle 
  })
}

/**
 * 获取完整的分类标题（含"Games"后缀）
 * 
 * @param t - i18next的翻译函数
 * @param categoryKey - 分类键值
 * @param fallbackTitle - 备用标题
 * @returns 完整的分类标题
 */
export function getCategoryFullTitle(
  t: TFunction,
  categoryKey: string,
  fallbackTitle?: string
) {
  return generateCategoryTitle(t, categoryKey, { 
    includeGames: true, 
    fallbackTitle 
  })
} 