import type { CategoryId, MenuDataBundle, MenuItem } from '../domain/menu'
import { sortBySortCode } from '../domain/formatting'

function normalizeTabId(tabId?: string) {
  const tabIdMap: Record<string, string> = {
    'house-guide': 'guide_rules',
    'delivery-recommend': 'guide_delivery',
    guide_notice: 'guide_rules',
  }

  return tabId ? tabIdMap[tabId] ?? tabId : tabId
}

export function getAvailableCategories(bundle: MenuDataBundle) {
  const customCocktailEnabled = bundle.settings.features.customCocktail?.enabled ?? true
  const storyCocktailEnabled = bundle.settings.features.storyCocktail?.enabled ?? true
  const customCocktailTabIds = new Set(['custom-cocktail', 'cocktail_custom'])
  const storyCocktailTabIds = new Set(['story-cocktail', 'cocktail_story'])

  return bundle.categories.map((category) => {
    if (category.id !== 'cocktail') {
      return category
    }

    return {
      ...category,
      tabs: category.tabs.filter(
        (tab) =>
          (!customCocktailTabIds.has(tab.id) || customCocktailEnabled) &&
          (!storyCocktailTabIds.has(tab.id) || storyCocktailEnabled),
      ),
    }
  })
}

export function getMenuItems(bundle: MenuDataBundle, categoryId: CategoryId, tabId?: string): MenuItem[] {
  const category = getAvailableCategories(bundle).find((item) => item.id === categoryId)
  const normalizedTabId = normalizeTabId(tabId)
  const tab = category?.tabs.find((item) => normalizeTabId(item.id) === normalizedTabId)

  return sortBySortCode(
    bundle.items.filter((item) => {
      const itemTabId = normalizeTabId(item.tabId)

      if (item.categoryId !== categoryId) {
        return false
      }

      if (!tab) {
        return category?.tabs.length ? itemTabId === normalizedTabId : true
      }

      if (!tab.kinds.includes(item.kind)) {
        return false
      }

      if (tab.id === 'all') {
        return true
      }

      return !itemTabId || itemTabId === normalizeTabId(tab.id)
    }),
  )
}

export function getNotices(bundle: MenuDataBundle, categoryId: CategoryId, tabId?: string) {
  const normalizedTabId = normalizeTabId(tabId)

  return bundle.notices
    .filter((notice) => notice.active)
    .filter((notice) => !notice.categoryId || notice.categoryId === categoryId)
    .filter((notice) => !notice.tabId || normalizeTabId(notice.tabId) === normalizedTabId)
    .sort((a, b) => a.sort_code - b.sort_code)
}
