import { createLocalDataBundle } from '../../data/localDataBundle'
import type { AppSettings, CategoryId, LocalizedText, MenuDataBundle, MenuItem, MenuKind, MenuNotice } from '../../domain/menu'

type FirestoreRecord = Record<string, unknown>

const localBundle = createLocalDataBundle()
const languageKeys = ['ko', 'en', 'ja', 'zh'] as const
const categoryIds: CategoryId[] = ['guide', 'cocktail', 'whisky', 'wine-spirits']
const menuKinds: MenuKind[] = [
  'guide',
  'cocktail',
  'tarot-signature',
  'custom-cocktail',
  'story-cocktail',
  'whisky',
  'wine',
  'spirit',
  'liqueur',
  'other',
]

function isRecord(value: unknown): value is FirestoreRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''))

    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = asNumber(value)

    if (parsed !== undefined) {
      return parsed
    }
  }

  return undefined
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const parsed = asString(value)

    if (parsed) {
      return parsed
    }
  }

  return undefined
}

function imageUrlFromValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim() || undefined
  }

  if (isRecord(value)) {
    return firstString(value.url, value.imageUrl, value.image_url, value.src)
  }

  return undefined
}

function stringArray(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const parsed = value.map(imageUrlFromValue).filter((item): item is string => Boolean(item))

      if (parsed.length > 0) {
        return parsed
      }
    }

    if (typeof value === 'string') {
      const parsed = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      if (parsed.length > 0) {
        return parsed
      }
    }
  }

  return undefined
}

function firstBoolean(...values: unknown[]) {
  for (const value of values) {
    const parsed = asBoolean(value)

    if (parsed !== undefined) {
      return parsed
    }
  }

  return undefined
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
  const localized = record[field] ?? record[`${field}_i18n`] ?? record[`${field}I18n`]

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
  const raw =
    asString(record.categoryId) ??
    asString(record.category_id) ??
    asString(record.main_code) ??
    asString(record.mainCode) ??
    asString(record.category)
  const normalizedRaw = raw?.toLowerCase()

  if (raw && categoryIds.includes(raw as CategoryId)) {
    return raw as CategoryId
  }

  if (normalizedRaw?.includes('whisky') || normalizedRaw?.includes('whiskey')) {
    return 'whisky'
  }

  if (normalizedRaw?.includes('wine')) {
    return 'wine-spirits'
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
  const raw =
    asString(record.kind) ??
    asString(record.menuKind) ??
    asString(record.menu_kind) ??
    asString(record.type) ??
    asString(record.category)

  if (raw && menuKinds.includes(raw as MenuKind)) {
    return raw as MenuKind
  }

  if (categoryId === 'guide') {
    return 'guide'
  }

  if (categoryId === 'cocktail') {
    if (raw === 'cocktail') {
      return 'cocktail'
    }

    if (raw === 'custom' || raw === 'custom-cocktail') {
      return 'custom-cocktail'
    }

    if (raw === 'story' || raw === 'story-cocktail') {
      return 'story-cocktail'
    }

    return collectionName.includes('custom') ? 'custom-cocktail' : 'tarot-signature'
  }

  if (categoryId === 'whisky') {
    return 'whisky'
  }

  if (raw?.toLowerCase().includes('liqueur')) {
    return 'liqueur'
  }

  if (raw?.toLowerCase().includes('wine')) {
    return 'wine'
  }

  return collectionName.includes('wine') ? 'wine' : 'spirit'
}

function getTabId(record: FirestoreRecord, collectionName: string, kind: MenuKind) {
  const raw =
    asString(record.tabId) ??
    asString(record.tab_id) ??
    asString(record.sectionId) ??
    asString(record.section_id) ??
    asString(record.category)

  if (raw) {
    if (kind === 'tarot-signature' && ['classic', 'signature', 'tarot-signature'].includes(raw)) {
      return 'tarot-signature'
    }

    if (raw === 'custom' || raw === 'cocktail_custom') {
      return 'cocktail_custom'
    }

    if (raw === 'story' || raw === 'cocktail_story') {
      return 'cocktail_story'
    }

    if (raw === 'regular' || raw === 'cocktail_regular' || raw === 'cocktail') {
      return 'cocktail-regular'
    }

    const normalizedRaw = raw.toLowerCase()

    if (kind === 'whisky' && (normalizedRaw.includes('singlemalt') || normalizedRaw.includes('scotch'))) {
      return 'scotch'
    }

    if (kind === 'whisky' && normalizedRaw.includes('american')) {
      return 'american'
    }

    return raw
  }

  const category = asString(record.category)?.toLowerCase()
  const originCountry = asString(record.origin_country)?.toLowerCase() ?? asString(record.originCountry)?.toLowerCase()

  if (kind === 'whisky' && (category?.includes('singlemalt') || originCountry === 'scotch')) {
    return 'scotch'
  }

  if (kind === 'whisky' && (category?.includes('american') || originCountry === 'american')) {
    return 'american'
  }

  if (kind === 'tarot-signature') {
    return 'tarot-signature'
  }

  if (kind === 'cocktail') {
    return 'cocktail-regular'
  }

  if (kind === 'custom-cocktail') {
    return 'cocktail_custom'
  }

  if (kind === 'story-cocktail') {
    return 'cocktail_story'
  }

  if (collectionName.includes('scotch')) {
    return 'scotch'
  }

  if (collectionName.includes('american')) {
    return 'american'
  }

  if (kind === 'whisky') {
    return 'others'
  }

  if (kind === 'wine') {
    return 'wine'
  }

  return undefined
}

export function mapFirestoreMenuItem(collectionName: string, id: string, data: FirestoreRecord): MenuItem | null {
  const active = firstBoolean(data.active, data.is_active, data.isActive, data.enabled) ?? true

  if (!active) {
    return null
  }

  const itemType = asString(data.item_type)

  if (itemType && ['spacer', 'blank', 'empty', 'gap', 'section_header', 'sectionHeader', 'sub_title', 'subtitle', 'subheading', 'divider'].includes(itemType)) {
    return null
  }

  const categoryId = getCategoryId(data, collectionName)

  if (!categoryId) {
    return null
  }

  const kind = getKind(data, collectionName, categoryId)
  const fallbackName = firstString(data.title, data.name, data.notes, data.ref_id) ?? id
  const nameField = data.name || data.name_i18n || data.nameI18n ? 'name' : 'title'
  const descriptionField = data.description || data.description_i18n || data.descriptionI18n ? 'description' : 'body'

  return {
    id,
    categoryId,
    tabId: getTabId(data, collectionName, kind),
    kind,
    name: getLocalizedField(data, nameField, fallbackName),
    summary: getLocalizedField(data, 'summary', asString(data.subtitle) ?? asString(data.notes) ?? ''),
    description: getLocalizedField(data, descriptionField, asString(data.detail) ?? asString(data.body) ?? ''),
    priceWon: firstNumber(data.priceWon, data.price_won, data.price),
    priceGlassWon: firstNumber(data.priceGlassWon, data.price_glass_won, data.sale_price_glass_vat_excl),
    priceBottleWon: firstNumber(data.priceBottleWon, data.price_bottle_won, data.sale_price_bottle_vat_excl),
    alcoholAbv: firstNumber(data.ABV, data.final_abv_pct, data.finalAbvPct, data.abv, data.abv_pct),
    imageUrl: firstString(data.imageUrl, data.image_url, data.thumbnailUrl, data.thumbnail_url, data.photoUrl),
    assetUrl: firstString(data.assetUrl, data.asset_url),
    subImageUrls: stringArray(
      data.subImageUrls,
      data.sub_image_urls,
      data.galleryUrls,
      data.gallery_urls,
      data.detailImageUrls,
      data.detail_image_urls,
      data.subImages,
      data.sub_images,
    ),
    glassImageUrl: firstString(data.glassImageUrl, data.glass_image_url, data.glassUrl, data.glass_url) ??
      (firstString(data.glass_shape, data.glassShape) ? `/media/galsses/${firstString(data.glass_shape, data.glassShape)}.png` : undefined),
    sort_code: firstNumber(data.sort_code, data.sortCode, data.display_order, data.displayOrder, data.order) ?? Number.MAX_SAFE_INTEGER,
    soldOut: firstBoolean(data.soldOut, data.sold_out, data.isSoldOut, data.is_soldout, data.is_sold_out),
    tarotCard:
      kind === 'tarot-signature'
        ? {
            number: firstNumber(data.cardNumber, data.card_number, data.tarotNumber, data.tarot_number) ?? 0,
            imageUrl: firstString(data.cardImageUrl, data.card_image_url, data.tarotCardImageUrl, data.tarot_card_image_url),
          }
        : undefined,
  }
}

export function mapFirestoreNotice(id: string, data: FirestoreRecord): MenuNotice | null {
  const active = firstBoolean(data.active, data.is_active, data.isActive, data.enabled) ?? true

  if (!active) {
    return null
  }

  const categoryId = asString(data.categoryId) ?? asString(data.category_id)

  return {
    id,
    categoryId: categoryIds.includes(categoryId as CategoryId) ? (categoryId as CategoryId) : undefined,
    tabId: asString(data.tabId) ?? asString(data.tab_id),
    text: getLocalizedField(data, 'text', asString(data.message) ?? ''),
    sort_code: firstNumber(data.sort_code, data.sortCode, data.display_order, data.displayOrder, data.order) ?? Number.MAX_SAFE_INTEGER,
    active,
  }
}

export function mapFirestoreSettings(data: FirestoreRecord | null): AppSettings {
  if (!data) {
    return localBundle.settings
  }

  const features = isRecord(data.features) ? data.features : {}
  const customCocktail = isRecord(features.customCocktail) ? features.customCocktail : {}
  const storyCocktail = isRecord(features.storyCocktail) ? features.storyCocktail : {}
  const cocktailButtons = isRecord(data.cocktail_buttons) ? data.cocktail_buttons : {}

  return {
    contentVersion: asString(data.contentVersion) ?? asString(data.content_version) ?? localBundle.settings.contentVersion,
    features: {
      customCocktail: {
        enabled:
          asBoolean(cocktailButtons.custom_cocktail_enabled) ??
          asBoolean(customCocktail.enabled) ??
          asBoolean(data.customCocktailEnabled) ??
          localBundle.settings.features.customCocktail.enabled,
      },
      storyCocktail: {
        enabled:
          asBoolean(cocktailButtons.story_cocktail_enabled) ??
          asBoolean(storyCocktail.enabled) ??
          asBoolean(data.storyCocktailEnabled) ??
          localBundle.settings.features.storyCocktail.enabled,
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
    notices: params.notices,
    loadedAt: params.loadedAt,
    source: 'remote',
  }
}
