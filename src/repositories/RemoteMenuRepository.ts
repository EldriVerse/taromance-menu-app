import type { Firestore } from 'firebase/firestore'
import type { CategoryId, LocalizedText, MenuDataBundle, MenuItem, MenuKind, MenuNotice } from '../domain/menu'
import { createRemoteBundle, mapFirestoreSettings } from './firebase/FirestoreMenuMapper'

type FirestoreRecord = Record<string, unknown>
const languageKeys = ['ko', 'en', 'ja', 'zh'] as const

export interface RemoteMenuResult {
  bundle: MenuDataBundle | null
  reason?: string
}

const sourceCollections = {
  cocktail: 'admin_draft_cocktails',
  guide: 'admin_draft_guide',
  spirits: 'admin_draft_spirits',
} as const

const sourceIdFields = {
  cocktail: 'cocktail_id',
  guide: 'guide_id',
  spirits: 'spirit_id',
} as const

function hasFirebaseEnvironment() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID,
  )
}

function isRecord(value: unknown): value is FirestoreRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() || undefined : undefined
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

function firstString(...values: unknown[]) {
  for (const value of values) {
    const parsed = asString(value)

    if (parsed) {
      return parsed
    }
  }

  return undefined
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

function firstBoolean(...values: unknown[]) {
  for (const value of values) {
    const parsed = asBoolean(value)

    if (parsed !== undefined) {
      return parsed
    }
  }

  return undefined
}

function isPublishedActive(record: FirestoreRecord) {
  const status = asString(record.status)
  const active = firstBoolean(record.is_active, record.isActive, record.active, record.enabled) ?? true
  const hiddenStatuses = new Set(['archived', 'deleted', 'disabled', 'hidden', 'inactive'])

  return active && (!status || !hiddenStatuses.has(status))
}

function localize(value: unknown, fallback = ''): LocalizedText {
  if (isRecord(value)) {
    const ko = asString(value.ko) ?? fallback

    return {
      ko,
      en: asString(value.en) ?? ko,
      ja: asString(value.ja) ?? ko,
      zh: asString(value.zh) ?? ko,
    }
  }

  if (typeof value === 'string') {
    return { ko: value, en: value, ja: value, zh: value }
  }

  return { ko: fallback, en: fallback, ja: fallback, zh: fallback }
}

function getLocalizedField(record: FirestoreRecord, field: string, fallback = '') {
  const i18nValue = record[`${field}_i18n`] ?? record[`${field}I18n`] ?? record[field]
  const i18nRecord = isRecord(i18nValue) ? i18nValue : null
  const directValue = typeof i18nValue === 'string' ? i18nValue : undefined
  const ko = asString(i18nRecord?.ko) ?? asString(record[`${field}_ko`]) ?? asString(record[`${field}Ko`]) ?? asString(directValue) ?? fallback

  return languageKeys.reduce<LocalizedText>((result, key) => {
    result[key] =
      asString(i18nRecord?.[key]) ??
      asString(record[`${field}_${key}`]) ??
      asString(record[`${field}${key.charAt(0).toUpperCase()}${key.slice(1)}`]) ??
      ko

    return result
  }, { ko, en: ko, ja: ko, zh: ko })
}

function getLocalizedDisplayField(record: FirestoreRecord, field: string, fallback = '') {
  const i18nValue = record[`${field}_i18n`] ?? record[`${field}I18n`]
  const i18nRecord = isRecord(i18nValue) ? i18nValue : null
  const ko = asString(i18nRecord?.ko) ?? asString(record[`${field}_ko`]) ?? asString(record[`${field}Ko`]) ?? fallback

  return languageKeys.reduce<LocalizedText>((result, key) => {
    result[key] =
      asString(i18nRecord?.[key]) ??
      asString(record[`${field}_${key}`]) ??
      asString(record[`${field}${key.charAt(0).toUpperCase()}${key.slice(1)}`]) ??
      ko

    return result
  }, { ko, en: ko, ja: ko, zh: ko })
}

function hasLocalizedText(value: LocalizedText | undefined) {
  return Boolean(value && languageKeys.some((key) => value[key].trim().length > 0))
}

function localizedFallback(value: LocalizedText | undefined, fallback: LocalizedText): LocalizedText {
  return value && hasLocalizedText(value) ? value : fallback
}

function joinLocalized(parts: LocalizedText[]) {
  return languageKeys.reduce<LocalizedText>((result, key) => {
    result[key] = parts
      .map((part) => part[key].trim())
      .filter(Boolean)
      .join('\n')

    return result
  }, { ko: '', en: '', ja: '', zh: '' })
}

function normalizeText(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(' ').toLowerCase()
  }

  return String(value ?? '').toLowerCase()
}

function mapMainCode(raw: unknown): CategoryId | null {
  const mainCode = asString(raw)

  if (mainCode === 'guide') {
    return 'guide'
  }

  if (mainCode === 'cocktail') {
    return 'cocktail'
  }

  if (mainCode === 'whisky') {
    return 'whisky'
  }

  if (mainCode === 'etc_liquor') {
    return 'wine-spirits'
  }

  return null
}

function mapSubCode(subCode: string | undefined, categoryId: CategoryId) {
  if (!subCode) {
    return undefined
  }

  const subCodeMap: Record<string, string> = {
    guide_rules: 'guide_rules',
    guide_notice: 'guide_rules',
    guide_tarot: 'guide_tarot',
    guide_delivery: 'guide_delivery',
    cocktail_signature: 'tarot-signature',
    cocktail_regular: 'cocktail-regular',
    cocktail_custom: 'cocktail_custom',
    cocktail_story: 'cocktail_story',
    whisky_scotch: 'scotch',
    whisky_american: 'american',
    whisky_other: 'others',
    etc_wine: 'wine',
    etc_spirit: 'other-spirits',
  }

  if (subCode.startsWith('cocktail_abv_')) {
    return undefined
  }

  return subCodeMap[subCode] ?? (categoryId === 'cocktail' ? 'cocktail-regular' : subCode)
}

function kindFromBoard(categoryId: CategoryId, tabId: string | undefined, source: FirestoreRecord): MenuKind {
  if (categoryId === 'guide') {
    return 'guide'
  }

  if (categoryId === 'whisky') {
    return 'whisky'
  }

  if (categoryId === 'wine-spirits') {
    return tabId === 'wine' ? 'wine' : 'spirit'
  }

  if (tabId === 'cocktail_custom') {
    return 'custom-cocktail'
  }

  if (tabId === 'cocktail_story') {
    return 'story-cocktail'
  }

  const sourceSignatureText = normalizeText([
    source.category,
    source.tags,
    source.name,
    source.name_ko,
    source.name_en,
  ])

  return sourceSignatureText.includes('signature') ||
    sourceSignatureText.includes('tarot') ||
    sourceSignatureText.includes('타로')
    ? 'tarot-signature'
    : 'cocktail'
}

function structuralKindFromTab(categoryId: CategoryId, tabId: string | undefined): MenuKind {
  if (categoryId === 'guide') {
    return 'guide'
  }

  if (categoryId === 'whisky') {
    return 'whisky'
  }

  if (categoryId === 'wine-spirits') {
    return tabId === 'wine' ? 'wine' : 'other'
  }

  if (tabId === 'tarot-signature') {
    return 'tarot-signature'
  }

  if (tabId === 'cocktail_custom') {
    return 'custom-cocktail'
  }

  if (tabId === 'cocktail_story') {
    return 'story-cocktail'
  }

  return 'cocktail'
}

function tabIdFromCocktailKind(tabId: string | undefined, kind: MenuKind) {
  if (kind === 'tarot-signature') {
    return 'tarot-signature'
  }

  if (kind === 'cocktail') {
    return tabId === 'tarot-signature' ? 'tarot-signature' : 'cocktail-regular'
  }

  return tabId
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

function getImageUrls(record: FirestoreRecord) {
  const slots = Array.isArray(record.image_slots) ? record.image_slots.filter(isRecord) : []
  const activeSlots = slots
    .filter((slot) => firstBoolean(slot.is_active, slot.isActive, slot.active) ?? true)
    .sort((a, b) => (asNumber(a.slot) ?? 0) - (asNumber(b.slot) ?? 0))
    .map((slot) => ({
      slot: asNumber(slot.slot) ?? 0,
      role: asString(slot.role),
      url: imageUrlFromValue(slot),
    }))
    .filter((slot): slot is { slot: number; role: string | undefined; url: string } => Boolean(slot.url))

  const mainFromSlot = activeSlots.find((slot) => slot.slot === 1 || slot.role === 'main')?.url
  const subFromSlots = activeSlots
    .filter((slot) => slot.url !== mainFromSlot)
    .map((slot) => slot.url)

  const fallbackSubUrls = Array.isArray(record.image_urls)
    ? record.image_urls.map(imageUrlFromValue).filter((url): url is string => Boolean(url))
    : []

  return {
    mainUrl: mainFromSlot ?? firstString(record.image_url_main, record.image_url, record.imageUrl),
    subImageUrls: subFromSlots.length ? subFromSlots : fallbackSubUrls,
  }
}

function getGlassImageUrl(source: FirestoreRecord) {
  const glassShape = firstString(source.glass_shape, source.glassShape)

  return firstString(source.glassImageUrl, source.glass_image_url, source.glassUrl, source.glass_url) ??
    (glassShape ? `/media/galsses/${glassShape}.png` : undefined)
}

function getSourceName(source: FirestoreRecord, id: string) {
  return firstString(source.name, source.name_ko, source.name_en, source.title, source.ref_id) ?? id
}

function getSourceDescription(source: FirestoreRecord) {
  return firstString(
    source.description,
    source.body,
    source.notes,
    source.flavour_character,
    source.tasting_note,
    source.tasting_note_nose,
    source.tasting_note_palate,
    source.tasting_note_finish,
  ) ?? ''
}

function getSourceTastingNote(source: FirestoreRecord) {
  const tastingNote = getLocalizedField(source, 'tasting_note', firstString(source.tasting_note) ?? '')

  if (hasLocalizedText(tastingNote)) {
    return tastingNote
  }

  return joinLocalized([
    getLocalizedField(source, 'tasting_note_nose', firstString(source.tasting_note_nose) ?? ''),
    getLocalizedField(source, 'tasting_note_palate', firstString(source.tasting_note_palate) ?? ''),
    getLocalizedField(source, 'tasting_note_finish', firstString(source.tasting_note_finish) ?? ''),
  ])
}

function getPrice(source: FirestoreRecord) {
  return firstNumber(
    source.price,
    source.priceWon,
    source.price_won,
    source.sale_price_glass_vat_excl,
    source.sale_price_half_vat_excl,
    source.sale_price_bottle_vat_excl,
  )
}

function getGlassPrice(source: FirestoreRecord) {
  return firstNumber(
    source.priceGlassWon,
    source.price_glass_won,
    source.glass_price,
    source.sale_price_glass_vat_excl,
    source.recommended_price_glass_vat_excl,
  )
}

function getBottlePrice(source: FirestoreRecord) {
  return firstNumber(
    source.priceBottleWon,
    source.price_bottle_won,
    source.bottle_price,
    source.sale_price_bottle_vat_excl,
    source.recommended_price_bottle_vat_excl,
  )
}

function getTags(source: FirestoreRecord) {
  if (!Array.isArray(source.tags) && !Array.isArray(source.finder_tags)) {
    return undefined
  }

  const rawTags = [...(Array.isArray(source.tags) ? source.tags : []), ...(Array.isArray(source.finder_tags) ? source.finder_tags : [])]

  return rawTags
    .map((tag) => asString(tag))
    .filter((tag): tag is string => Boolean(tag))
    .map((tag) => localize(tag, tag))
}

function mapMenuBoardNotice(id: string, data: FirestoreRecord): MenuNotice | null {
  if (!isPublishedActive(data)) {
    return null
  }

  const subCode = asString(data.sub_code)
  const categoryId = mapMainCode(data.main_code) ?? (subCode?.startsWith('cocktail_') ? 'cocktail' : undefined)

  return {
    id,
    categoryId: categoryId ?? undefined,
    tabId: categoryId ? mapSubCode(subCode, categoryId) : subCode,
    text: getLocalizedField(data, 'text', firstString(data.notice_title, data.message, data.notice_body) ?? ''),
    sort_code: firstNumber(data.sort_code, data.sortCode, data.display_order, data.displayOrder) ?? Number.MAX_SAFE_INTEGER,
    active: true,
  }
}

function mapMenuBoardItem(rowId: string, row: FirestoreRecord, source: FirestoreRecord | null): MenuItem | null {
  if (!isPublishedActive(row)) {
    return null
  }

  const categoryId = mapMainCode(row.main_code)

  if (!categoryId) {
    return null
  }

  const tabId = mapSubCode(asString(row.sub_code), categoryId)
  const itemType = asString(row.item_type) ?? 'product'
  const spacerItemTypes = new Set(['spacer', 'blank', 'empty', 'gap', 'line_break', 'lineBreak'])
  const sectionHeaderItemTypes = new Set([
    'section_header',
    'sectionHeader',
    'section',
    'header',
    'title',
    'sub_title',
    'subtitle',
    'subheading',
    'divider',
  ])

  if (spacerItemTypes.has(itemType)) {
    return {
      id: rowId,
      categoryId,
      tabId,
      kind: structuralKindFromTab(categoryId, tabId),
      displayType: 'spacer',
      name: localize(''),
      summary: localize(''),
      description: localize(''),
      sort_code: firstNumber(row.sort_code, row.sortCode, row.display_order, row.displayOrder) ?? Number.MAX_SAFE_INTEGER,
    }
  }

  if (sectionHeaderItemTypes.has(itemType)) {
    const title = firstString(row.title, row.notice_title) ?? rowId
    const description = firstString(row.description, row.summary, row.notice_body) ?? ''

    return {
      id: rowId,
      categoryId,
      tabId,
      kind: structuralKindFromTab(categoryId, tabId),
      displayType: 'section_header',
      name: getLocalizedField(row, 'title', title),
      summary: getLocalizedField(row, 'description', description),
      description: getLocalizedField(row, 'description', description),
      sort_code: firstNumber(row.sort_code, row.sortCode, row.display_order, row.displayOrder) ?? Number.MAX_SAFE_INTEGER,
    }
  }

  if (!source || !isPublishedActive(source)) {
    return null
  }

  const refId = firstString(row.ref_id, source.cocktail_id, source.guide_id, source.spirit_id) ?? rowId
  const fallbackName = getSourceName(source, refId)
  const images = getImageUrls(source)
  const kind = kindFromBoard(categoryId, tabId, source)
  const resolvedTabId = categoryId === 'cocktail' ? tabIdFromCocktailKind(tabId, kind) : tabId
  const sourceName = source.name_i18n || source.name || source.name_ko || source.name_en
    ? getLocalizedField(source, 'name', fallbackName)
    : getLocalizedField(source, 'title', fallbackName)
  const guideBody = getLocalizedField(source, 'body', getSourceDescription(source))
  const description = categoryId === 'guide'
    ? guideBody
    : categoryId === 'cocktail'
      ? getLocalizedDisplayField(source, 'description')
      : source.description_i18n || source.description_ko || source.description_en || source.description_ja || source.description_zh
        ? getLocalizedDisplayField(source, 'description')
        : getLocalizedField(source, source.notes_i18n || source.notes ? 'notes' : 'body', getSourceDescription(source))
  const tastingNote = getSourceTastingNote(source)
  const summary = categoryId === 'guide'
    ? guideBody
    : localizedFallback(tastingNote, description)

  return {
    id: rowId,
    categoryId,
    tabId: resolvedTabId,
    kind,
    name: sourceName,
    summary,
    description,
    tastingNote: hasLocalizedText(tastingNote) ? tastingNote : undefined,
    priceWon: getPrice(source),
    priceGlassWon: getGlassPrice(source),
    priceBottleWon: getBottlePrice(source),
    alcoholAbv: firstNumber(source.ABV, source.final_abv_pct, source.finalAbvPct, source.abv, source.abv_pct),
    imageUrl: images.mainUrl,
    subImageUrls: images.subImageUrls,
    glassImageUrl: getGlassImageUrl(source),
    sort_code: firstNumber(row.sort_code, row.sortCode, source.sort_code, source.display_order, source.displayOrder) ?? Number.MAX_SAFE_INTEGER,
    soldOut: firstBoolean(source.is_soldout, source.is_sold_out, source.soldOut, source.sold_out),
    tags: getTags(source),
    tarotCard:
      kind === 'tarot-signature'
        ? {
            number: firstNumber(source.cardNumber, source.card_number, source.tarotNumber, source.tarot_number),
            imageUrl: images.mainUrl,
          }
        : undefined,
  }
}

async function fetchBoardItems(params: {
  firestore: Firestore
  firestoreApi: Awaited<typeof import('firebase/firestore')>
}) {
  const { firestore, firestoreApi } = params
  const { collection, doc, getDoc, getDocs, limit, query, where } = firestoreApi
  const boardCollection =
    import.meta.env.VITE_FIRESTORE_MENU_BOARD_ITEMS_COLLECTION || 'admin_draft_menu_board_items'
  const snapshot = await getDocs(collection(firestore, boardCollection))
  const sourceCache = new Map<string, FirestoreRecord | null>()
  const rows = await Promise.all(
    snapshot.docs.map(async (documentSnapshot) => {
      const row = documentSnapshot.data() as FirestoreRecord
      const refModule = asString(row.ref_module)
      const refId = asString(row.ref_id)
      const sourceCollection =
        refModule === 'cocktail' || refModule === 'guide' || refModule === 'spirits'
          ? sourceCollections[refModule]
          : undefined
      const cacheKey = sourceCollection && refId ? `${sourceCollection}/${refId}` : undefined

      if (!sourceCollection || !refId || !cacheKey) {
        return mapMenuBoardItem(documentSnapshot.id, row, null)
      }

      if (!sourceCache.has(cacheKey)) {
        try {
          const sourceSnapshot = await getDoc(doc(firestore, sourceCollection, refId))
          let sourceData = sourceSnapshot.exists() ? (sourceSnapshot.data() as FirestoreRecord) : null

          if (!sourceData) {
            const sourceIdField = sourceIdFields[refModule as keyof typeof sourceIdFields]
            const querySnapshot = await getDocs(
              query(collection(firestore, sourceCollection), where(sourceIdField, '==', refId), limit(1)),
            )
            sourceData = querySnapshot.docs[0]?.data() as FirestoreRecord | undefined ?? null
          }

          sourceCache.set(cacheKey, sourceData)
        } catch {
          sourceCache.set(cacheKey, null)
        }
      }

      return mapMenuBoardItem(documentSnapshot.id, row, sourceCache.get(cacheKey) ?? null)
    }),
  )

  return rows.filter((item): item is MenuItem => item !== null)
}

async function fetchBoardNotices(params: {
  firestore: Firestore
  firestoreApi: Awaited<typeof import('firebase/firestore')>
}) {
  const { firestore, firestoreApi } = params
  const noticeCollection =
    import.meta.env.VITE_FIRESTORE_MENU_BOARD_NOTICES_COLLECTION || 'admin_draft_menu_board_notices'
  try {
    const snapshot = await firestoreApi.getDocs(firestoreApi.collection(firestore, noticeCollection))

    return snapshot.docs
      .map((documentSnapshot) => mapMenuBoardNotice(documentSnapshot.id, documentSnapshot.data() as FirestoreRecord))
      .filter((notice): notice is MenuNotice => notice !== null)
  } catch {
    return []
  }
}

async function fetchBoardSettings(params: {
  firestore: Firestore
  firestoreApi: Awaited<typeof import('firebase/firestore')>
}) {
  const { firestore, firestoreApi } = params
  const settingsDocPath =
    import.meta.env.VITE_FIRESTORE_SETTINGS_DOC || 'admin_draft_menu_board_settings/menu_board_settings'
  const [settingsCollection, settingsDocument] = settingsDocPath.split('/')

  if (!settingsCollection || !settingsDocument) {
    return mapFirestoreSettings(null)
  }

  try {
    const settingsSnapshot = await firestoreApi.getDoc(
      firestoreApi.doc(firestore, settingsCollection, settingsDocument),
    )

    return mapFirestoreSettings(settingsSnapshot.exists() ? (settingsSnapshot.data() as FirestoreRecord) : null)
  } catch {
    return mapFirestoreSettings(null)
  }
}

export async function fetchRemoteMenuData(): Promise<RemoteMenuResult> {
  if (!hasFirebaseEnvironment()) {
    return {
      bundle: null,
      reason: 'Firebase environment is not configured.',
    }
  }

  const [firestoreApi, { getFirebaseFirestore }] = await Promise.all([
    import('firebase/firestore'),
    import('./firebase/FirebaseClient'),
  ])
  const firestore = getFirebaseFirestore()

  if (!firestore) {
    return {
      bundle: null,
      reason: 'Firebase could not be initialized.',
    }
  }

  try {
    const loadedAt = new Date().toISOString()
    const settings = await fetchBoardSettings({ firestore, firestoreApi })
    const boardItems = await fetchBoardItems({ firestore, firestoreApi })
    const boardNotices = await fetchBoardNotices({ firestore, firestoreApi })

    return {
      bundle: createRemoteBundle({
        settings,
        items: boardItems,
        notices: boardNotices,
        loadedAt,
      }),
    }
  } catch (error) {
    return {
      bundle: null,
      reason: error instanceof Error ? error.message : 'Remote menu data could not be loaded.',
    }
  }
}
