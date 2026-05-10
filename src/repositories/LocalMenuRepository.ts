import { categories } from '../data/categories'
import { menuItems } from '../data/menuItems'
import { notices } from '../data/notices'
import { appSettings } from '../data/settings'
import type { CategoryId, MenuItem } from '../domain/menu'
import { sortBySortCode } from '../domain/formatting'

export function getAvailableCategories() {
  return categories.map((category) => {
    if (category.id !== 'cocktail') {
      return category
    }

    return {
      ...category,
      tabs: category.tabs.filter((tab) => tab.id !== 'custom-cocktail' || appSettings.features.customCocktail.enabled),
    }
  })
}

export function getMenuItems(categoryId: CategoryId, tabId?: string): MenuItem[] {
  const category = getAvailableCategories().find((item) => item.id === categoryId)
  const tab = category?.tabs.find((item) => item.id === tabId)

  return sortBySortCode(
    menuItems.filter((item) => {
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

export function getNotices(categoryId: CategoryId, tabId?: string) {
  return notices
    .filter((notice) => notice.active)
    .filter((notice) => !notice.categoryId || notice.categoryId === categoryId)
    .filter((notice) => !notice.tabId || notice.tabId === tabId)
    .sort((a, b) => a.sort_code - b.sort_code)
}
