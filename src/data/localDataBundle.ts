import { categories } from './categories'
import { menuItems } from './menuItems'
import { notices } from './notices'
import { appSettings } from './settings'
import type { MenuDataBundle } from '../domain/menu'

export function createLocalDataBundle(): MenuDataBundle {
  return {
    settings: appSettings,
    categories,
    items: menuItems,
    notices,
    loadedAt: new Date().toISOString(),
    source: 'local',
  }
}
