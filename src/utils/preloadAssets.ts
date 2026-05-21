import type { LanguageCode, MenuDataBundle } from '../domain/menu'

const categoryButtonNames = ['guide', 'cocktail', 'whisky', 'wineandspirits']
const categoryButtonLanguages = ['k', 'e']
const categoryButtonStates = ['00', '01']

const staticAssetUrls = [
  '/assets/menu/backgroundimage.png',
  '/assets/legacy/iv_popup_background.png',
  '/assets/legacy/noimage.png',
  '/assets/legacy/arrow.png',
  '/assets/legacy/ui/arrow_button_left.png',
  '/assets/legacy/ui/arrow_button_right.png',
  '/assets/legacy/ui/subtab_fire_active.png',
  '/assets/legacy/ui/subtab_fire_inactive.png',
  '/assets/legacy/glass/brandyglass.png',
  '/assets/legacy/glass/cylinderchampagneglass.png',
  '/assets/legacy/glass/highballglass.png',
  '/assets/legacy/glass/martiniglass.png',
  '/assets/legacy/glass/ontherockglass.png',
  '/assets/legacy/glass/shooterglass.png',
  ...categoryButtonNames.flatMap((name) =>
    categoryButtonLanguages.flatMap((language) =>
      categoryButtonStates.map(
        (state) => `/assets/legacy/category-buttons/iv_btn_menu_main_${name}_${language}_${state}.png`,
      ),
    ),
  ),
]

const loadedAssets = new Set<string>()

function isLocalAsset(url: string) {
  return url.startsWith('/assets/') || url.startsWith('/media/') || url.startsWith('blob:')
}

function loadImage(url: string) {
  if (loadedAssets.has(url)) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const image = new Image()

    image.onload = () => {
      loadedAssets.add(url)
      resolve()
    }
    image.onerror = () => {
      resolve()
    }
    image.src = url
  })
}

export async function preloadMenuAssets(
  bundle: MenuDataBundle,
  language: LanguageCode,
  onProgress?: (loaded: number, total: number) => void,
) {
  const itemAssetUrls = bundle.items.flatMap((item) =>
    [item.imageUrl, item.assetUrl, item.glassImageUrl, item.tarotCard?.imageUrl, ...(item.subImageUrls ?? [])].filter(
      (url): url is string => typeof url === 'string' && isLocalAsset(url),
    ),
  )
  const languageButtonUrls = categoryButtonNames.flatMap((name) =>
    categoryButtonStates.map(
      (state) => `/assets/legacy/category-buttons/iv_btn_menu_main_${name}_${language === 'ko' ? 'k' : 'e'}_${state}.png`,
    ),
  )
  const urls = Array.from(new Set([...staticAssetUrls, ...itemAssetUrls, ...languageButtonUrls]))
  let loaded = 0

  onProgress?.(loaded, urls.length)

  await Promise.all(
    urls.map(async (url) => {
      await loadImage(url)
      loaded += 1
      onProgress?.(loaded, urls.length)
    }),
  )
}
