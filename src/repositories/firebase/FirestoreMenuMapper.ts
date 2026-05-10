import { createLocalDataBundle } from '../../data/localDataBundle'
import type { AppSettings, CategoryId, LocalizedText, MenuDataBundle, MenuItem, MenuKind, MenuNotice } from '../../domain/menu'

type FirestoreRecord = Record<string, unknown>

const localBundle = createLocalDataBundle()
const languageKeys = ['ko', 'en', 'ja', 'zh'] as const
const categoryIds: CategoryId[] = ['guide', 'cocktail', 'whisky', 'wine-spirits']
const menuKinds: MenuKind[] = ['guide', 'tarot-signature', 'custom-cocktail', 'whisky', 'wine', 'spirit', 'liqueur', 'other']

function isRecord(value: unknown): value is FirestoreRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function localize(value: unknown, fallback: string): LocalizedText {
  if (isRecord(value)) {
    return {
      ko: asString(value.ko) ?? fallback,
      en: asString(value.en) ?? asString(value.ko) ?? fallback,
      ja: asString(value.ja) ?? asString(value.ko) ?? fallback,
      zh: asString(value.zh) ?? asString(value.ko) ?? fallback,
    }
  }

  if (typeof value === 'string') {
    return {
      ko: value,
      en: value,
      ja: value,
      zh: value,
    }
  }

  const localizedFromFlatFields = languageKeys.reduce<Partial<LocalizedText>>((result, key) => {
    if (isRecord(value) && typeof value[key] === 'string') {
      result[key] = value[key]
    }

    return result
  }, {})

  return {
    ko: localizedFromFlatFields.ko ?? fallback,
    en: localizedFromFlatFields.en ?? localizedFromFlatFields.ko ?? fallback,
    ja: localizedFromFlatFields.ja ?? localizedFromFlatFields.ko ?? fallback,
    zh: localizedFromFlatFields.zh ?? localizedFromFlatFields.ko ?? fallback,
  }
}

function getLocalizedField(record: FirestoreRecord, field: string, fallback: string) {
  const localized = record[field]

  if (localized) {
    return localize(localized, fallback)
  }

  return {
    ko: asString(record[`${field}_ko`]) ?? asString(record[`${field}Ko`]) ?? fallback,
    en: asString(record[`${field}_en`]) ?? asString(record[`${field}En`]) ?? fallback,
    ja: asString(record[`${field}_ja`]) ?? asString(record[`${field}Ja`]) ?? fallback,
    zh: asString(record[`${field}_zh`]) ?? asString(record[`${field}Zh`]) ?? fallback,
  }
}

function getCategoryId(record: FirestoreRecord, collectionName: string): CategoryId | null {
  const raw = asString(record.categoryId) ?? asString(record.category_id) ?? asString(record.category)

  if (raw && categoryIds.includes(raw as CategoryId)) {
    return raw as CategoryId
  }

  if (collectionName.includes('guide')) {
    return 'guide'
  }

  if (collectionName.includes('cocktail')) {
    return 'cocktail'
  }

  if (collectionName.includes('spirit') || collectionName.includes('wine')) {
    return 'wine-spirits'
  }

  if (collectionName.includes('whisky') || collectionName.includes('whiskey')) {
    return 'whisky'
  }

  return null
}

function getKind(record: FirestoreRecord, collectionName: string, categoryId: CategoryId): MenuKind {
  const raw = asString(record.kind) ?? asString(record.menuKind) ?? asString(record.type)

  if (raw && menuKinds.includes(raw as MenuKind)) {
    return raw as MenuKind
  }

  if (categoryId === 'guide') {
    return 'guide'
  }

  if (categoryId === 'cocktail') {
    return collectionName.includes('custom') ? 'custom-cocktail' : 'tarot-signature'
  }

  if (categoryId === 'whisky') {
    return 'whisky'
  }

  return collectionName.includes('wine') ? 'wine' : 'spirit'
}

function getTabId(record: FirestoreRecord, collectionName: string, kind: MenuKind) {
  const raw = asString(record.tabId) ?? asString(record.tab_id) ?? asString(record.sectionId)

  if (raw) {
    return raw
  }

  if (kind === 'tarot-signature') {
    return 'tarot-signature'
  }

  if (kind === 'custom-cocktail') {
    return 'custom-cocktail'
  }

  if (collectionName.includes('scotch')) {
    return 'scotch'
  }

  if (collectionName.includes('american')) {
    return 'american'
  }

  if (kind === 'whisky') {
    return 'recommend'
  }

  if (kind === 'wine') {
    return 'wine'
  }

  return undefined
}

export function mapFirestoreMenuItem(collectionName: string, id: string, data: FirestoreRecord): MenuItem | null {
  const categoryId = getCategoryId(data, collectionName)

  if (!categoryId) {
    return null
  }

  const kind = getKind(data, collectionName, categoryId)
  const fallbackName = asString(data.title) ?? asString(data.name) ?? id

  return {
    id,
    categoryId,
    tabId: getTabId(data, collectionName, kind),
    kind,
    name: getLocalizedField(data, 'name', fallbackName),
    summary: getLocalizedField(data, 'summary', asString(data.subtitle) ?? ''),
    description: getLocalizedField(data, 'description', asString(data.detail) ?? ''),
    priceWon: asNumber(data.priceWon) ?? asNumber(data.price_won) ?? asNumber(data.price),
    imageUrl: asString(data.imageUrl) ?? asString(data.image_url) ?? asString(data.thumbnailUrl),
    assetUrl: asString(data.assetUrl),
    glassImageUrl: asString(data.glassImageUrl) ?? asString(data.glass_image_url),
    sort_code: asNumber(data.sort_code) ?? asNumber(data.sortCode) ?? Number.MAX_SAFE_INTEGER,
    soldOut: asBoolean(data.soldOut) ?? asBoolean(data.sold_out) ?? asBoolean(data.isSoldOut),
    tarotCard:
      kind === 'tarot-signature'
        ? {
            number: asNumber(data.cardNumber) ?? asNumber(data.card_number) ?? asNumber(data.tarotNumber) ?? 0,
            imageUrl: asString(data.cardImageUrl) ?? asString(data.card_image_url),
          }
        : undefined,
  }
}

export function mapFirestoreNotice(id: string, data: FirestoreRecord): MenuNotice | null {
  const active = asBoolean(data.active) ?? true

  if (!active) {
    return null
  }

  const categoryId = asString(data.categoryId) ?? asString(data.category_id)

  return {
    id,
    categoryId: categoryIds.includes(categoryId as CategoryId) ? (categoryId as CategoryId) : undefined,
    tabId: asString(data.tabId) ?? asString(data.tab_id),
    text: getLocalizedField(data, 'text', asString(data.message) ?? ''),
    sort_code: asNumber(data.sort_code) ?? asNumber(data.sortCode) ?? Number.MAX_SAFE_INTEGER,
    active,
  }
}

export function mapFirestoreSettings(data: FirestoreRecord | null): AppSettings {
  if (!data) {
    return localBundle.settings
  }

  const features = isRecord(data.features) ? data.features : {}
  const customCocktail = isRecord(features.customCocktail) ? features.customCocktail : {}

  return {
    contentVersion: asString(data.contentVersion) ?? asString(data.content_version) ?? localBundle.settings.contentVersion,
    features: {
      customCocktail: {
        enabled:
          asBoolean(customCocktail.enabled) ??
          asBoolean(data.customCocktailEnabled) ??
          localBundle.settings.features.customCocktail.enabled,
      },
    },
  }
}

export function createRemoteBundle(params: {
  settings: AppSettings
  items: MenuItem[]
  notices: MenuNotice[]
  loadedAt: string
}): MenuDataBundle {
  return {
    settings: params.settings,
    categories: localBundle.categories,
    items: params.items,
    notices: params.notices.length ? params.notices : localBundle.notices,
    loadedAt: params.loadedAt,
    source: 'remote',
  }
}
