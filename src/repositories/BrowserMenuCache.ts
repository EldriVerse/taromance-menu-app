import type { MenuDataBundle } from '../domain/menu'

const cacheKey = 'taromance-menu-data-bundle'

export function readCachedMenuData(): MenuDataBundle | null {
  try {
    const raw = window.localStorage.getItem(cacheKey)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as MenuDataBundle

    if (!parsed.settings?.contentVersion || !Array.isArray(parsed.categories) || !Array.isArray(parsed.items)) {
      return null
    }

    return {
      ...parsed,
      source: 'cache',
    }
  } catch {
    return null
  }
}

export function writeCachedMenuData(bundle: MenuDataBundle) {
  try {
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({
        ...bundle,
        source: 'cache',
      }),
    )
  } catch {
    // localStorage can be unavailable in restricted browser modes. The app still runs from in-memory data.
  }
}
