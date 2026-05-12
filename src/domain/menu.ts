export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh'

export type LocalizedText = Record<LanguageCode, string>

export type CategoryId = 'guide' | 'cocktail' | 'whisky' | 'wine-spirits'

export type MenuKind =
  | 'guide'
  | 'tarot-signature'
  | 'custom-cocktail'
  | 'story-cocktail'
  | 'whisky'
  | 'wine'
  | 'spirit'
  | 'liqueur'
  | 'other'

export interface AppSettings {
  features: {
    customCocktail: {
      enabled: boolean
    }
    storyCocktail: {
      enabled: boolean
    }
  }
  contentVersion: string
}

export interface CategoryTab {
  id: string
  label: LocalizedText
  kinds: MenuKind[]
}

export interface MenuCategory {
  id: CategoryId
  label: LocalizedText
  subtitle: LocalizedText
  imageKey: string
  tabs: CategoryTab[]
}

export interface MenuNotice {
  id: string
  categoryId?: CategoryId
  tabId?: string
  text: LocalizedText
  sort_code: number
  active: boolean
}

export interface MenuItem {
  id: string
  categoryId: CategoryId
  tabId?: string
  kind: MenuKind
  name: LocalizedText
  summary: LocalizedText
  description: LocalizedText
  priceWon?: number
  imageUrl?: string
  assetUrl?: string
  subImageUrls?: string[]
  glassImageUrl?: string
  sort_code: number
  soldOut?: boolean
  tags?: LocalizedText[]
  tarotCard?: {
    number: number
    imageUrl?: string
  }
}

export interface MenuDataBundle {
  settings: AppSettings
  categories: MenuCategory[]
  items: MenuItem[]
  notices: MenuNotice[]
  loadedAt: string
  source: 'local' | 'cache' | 'remote'
}

export interface DataSourceState {
  bundle: MenuDataBundle
  status: 'idle' | 'checking' | 'ready' | 'fallback'
  message: string
  lastCheckedAt?: string
}
