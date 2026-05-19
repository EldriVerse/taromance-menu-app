import { createLocalDataBundle } from '../data/localDataBundle'
import type { MenuDataBundle } from '../domain/menu'

const cacheKey = 'taromance-menu-data-bundle'
const cacheVersion = 9

interface StoredMenuDataBundle extends MenuDataBundle {
  cacheVersion?: number
  cachedFromRemote?: boolean
}

export function readCachedMenuData(): MenuDataBundle | null {
  try {
    const raw = window.localStorage.getItem(cacheKey)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredMenuDataBundle

    if (
      parsed.cacheVersion !== cacheVersion ||
      parsed.cachedFromRemote !== true ||
      !parsed.settings?.contentVersion ||
      !Array.isArray(parsed.items)
    ) {
      return null
    }

    return {
      ...parsed,
      categories: createLocalDataBundle().categories,
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
        cacheVersion,
        cachedFromRemote: true,
        source: 'cache',
      }),
    )
  } catch {
    // localStorage can be unavailable in restricted browser modes. The app still runs from in-memory data.
  }
}
