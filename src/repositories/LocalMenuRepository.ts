import type { CategoryId, MenuDataBundle, MenuItem } from '../domain/menu'
import { sortBySortCode } from '../domain/formatting'

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
  const tab = category?.tabs.find((item) => item.id === tabId)

  return sortBySortCode(
    bundle.items.filter((item) => {
      if (item.categoryId !== categoryId) {
        return false
      }

      if (!tab) {
        return category?.tabs.length ? item.tabId === tabId : true
      }

      if (!tab.kinds.includes(item.kind)) {
        return false
      }

      if (tab.id === 'all') {
        return true
      }

      return !item.tabId || item.tabId === tab.id
    }),
  )
}

export function getNotices(bundle: MenuDataBundle, categoryId: CategoryId, tabId?: string) {
  return bundle.notices
    .filter((notice) => notice.active)
    .filter((notice) => !notice.categoryId || notice.categoryId === categoryId)
    .filter((notice) => !notice.tabId || notice.tabId === tabId)
    .sort((a, b) => a.sort_code - b.sort_code)
}
