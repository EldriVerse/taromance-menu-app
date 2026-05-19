import type { LanguageCode, LocalizedText, MenuItem } from './menu'

export const languageLabels: Record<LanguageCode, string> = {
  ko: '한국어',
  en: 'EN',
  ja: '日本語',
  zh: '中文',
}

export function text(value: LocalizedText, language: LanguageCode) {
  return value[language] || value.ko
}

export function formatPriceShort(priceWon?: number) {
  if (priceWon === undefined) {
    return ''
  }

  return String(Math.trunc(priceWon / 1000))
}

export function sortBySortCode<T extends Pick<MenuItem, 'sort_code' | 'name'>>(items: T[]) {
  return [...items].sort((a, b) => {
    const aSort = Number.isFinite(a.sort_code) ? a.sort_code : Number.MAX_SAFE_INTEGER
    const bSort = Number.isFinite(b.sort_code) ? b.sort_code : Number.MAX_SAFE_INTEGER

    if (aSort !== bSort) {
      return aSort - bSort
    }

    return a.name.ko.localeCompare(b.name.ko, 'ko')
  })
}
