import type { SyntheticEvent } from 'react'

export function fallbackImageUrl(currentUrl: string) {
  if (currentUrl.endsWith('.png')) {
    return currentUrl.replace(/\.png$/i, '.jpg')
  }

  if (!currentUrl.endsWith('/assets/legacy/noimage.png')) {
    return '/assets/legacy/noimage.png'
  }

  return ''
}

export function handleImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  const nextUrl = fallbackImageUrl(image.getAttribute('src') ?? '')

  if (nextUrl) {
    image.src = nextUrl
  }
}
