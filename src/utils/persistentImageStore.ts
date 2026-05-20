import { Capacitor, CapacitorHttp } from '@capacitor/core'
import type { MenuDataBundle, MenuItem } from '../domain/menu'

const databaseName = 'taromance-image-store'
const databaseVersion = 1
const storeName = 'images'
const objectUrls = new Map<string, string>()

interface StoredImage {
  url: string
  blob: Blob
  savedAt: string
}

function shouldPersistImage(url: string | undefined) {
  return Boolean(url && /^https?:\/\//i.test(url))
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: 'url' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readStoredImage(database: IDBDatabase, url: string) {
  return new Promise<StoredImage | undefined>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(url)

    request.onsuccess = () => resolve(request.result as StoredImage | undefined)
    request.onerror = () => reject(request.error)
  })
}

async function writeStoredImage(database: IDBDatabase, image: StoredImage) {
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const request = transaction.objectStore(storeName).put(image)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

function createObjectUrl(originalUrl: string, blob: Blob) {
  const cached = objectUrls.get(originalUrl)

  if (cached) {
    return cached
  }

  const objectUrl = URL.createObjectURL(blob)
  objectUrls.set(originalUrl, objectUrl)

  return objectUrl
}

function headerValue(headers: Record<string, string> | undefined, name: string) {
  const lowerName = name.toLowerCase()
  const entry = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === lowerName)

  return entry?.[1]
}

function base64ToBlob(base64: string, contentType = 'application/octet-stream') {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: contentType })
}

async function downloadImage(url: string) {
  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.get({
      url,
      responseType: 'blob',
    })

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Image download failed: ${response.status}`)
    }

    if (response.data instanceof Blob) {
      return response.data
    }

    if (typeof response.data === 'string') {
      return base64ToBlob(response.data, headerValue(response.headers, 'content-type'))
    }
  }

  const response = await fetch(url, { cache: 'reload' })

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`)
  }

  return response.blob()
}

async function persistImageUrl(database: IDBDatabase, url: string) {
  if (!shouldPersistImage(url)) {
    return url
  }

  const stored = await readStoredImage(database, url)

  if (stored?.blob) {
    return createObjectUrl(url, stored.blob)
  }

  const blob = await downloadImage(url)
  await writeStoredImage(database, { url, blob, savedAt: new Date().toISOString() })

  return createObjectUrl(url, blob)
}

function imageUrlsFromItem(item: MenuItem) {
  return [
    item.imageUrl,
    item.assetUrl,
    item.glassImageUrl,
    item.tarotCard?.imageUrl,
    ...(item.subImageUrls ?? []),
  ].filter((url): url is string => shouldPersistImage(url))
}

async function persistItemImages(item: MenuItem, urlMap: Map<string, string>) {
  const mapUrl = (url: string | undefined) => (url ? urlMap.get(url) ?? url : url)

  return {
    ...item,
    imageUrl: mapUrl(item.imageUrl),
    assetUrl: mapUrl(item.assetUrl),
    glassImageUrl: mapUrl(item.glassImageUrl),
    subImageUrls: item.subImageUrls?.map((url) => mapUrl(url) ?? url),
    tarotCard: item.tarotCard
      ? {
          ...item.tarotCard,
          imageUrl: mapUrl(item.tarotCard.imageUrl),
        }
      : undefined,
  }
}

export async function persistMenuImages(
  bundle: MenuDataBundle,
  onProgress?: (saved: number, total: number) => void,
): Promise<MenuDataBundle> {
  if (!('indexedDB' in window)) {
    return bundle
  }

  const imageUrls = Array.from(new Set(bundle.items.flatMap(imageUrlsFromItem)))

  if (!imageUrls.length) {
    return bundle
  }

  let database: IDBDatabase | undefined
  const urlMap = new Map<string, string>()
  let saved = 0

  try {
    database = await openDatabase()
    const openedDatabase = database

    onProgress?.(saved, imageUrls.length)

    await Promise.all(
      imageUrls.map(async (url) => {
        try {
          urlMap.set(url, await persistImageUrl(openedDatabase, url))
        } catch {
          urlMap.set(url, '/assets/legacy/noimage.png')
        } finally {
          saved += 1
          onProgress?.(saved, imageUrls.length)
        }
      }),
    )

    const items = await Promise.all(bundle.items.map((item) => persistItemImages(item, urlMap)))

    return {
      ...bundle,
      items,
    }
  } catch {
    return bundle
  } finally {
    database?.close()
  }
}
