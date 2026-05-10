import type { MenuDataBundle } from '../domain/menu'
import {
  createRemoteBundle,
  mapFirestoreMenuItem,
  mapFirestoreNotice,
  mapFirestoreSettings,
} from './firebase/FirestoreMenuMapper'

export interface RemoteMenuResult {
  bundle: MenuDataBundle | null
  reason?: string
}

function getCollectionNames(envValue: string | undefined, fallback: string[]) {
  return (envValue ? envValue.split(',') : fallback).map((item) => item.trim()).filter(Boolean)
}

function hasFirebaseEnvironment() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID,
  )
}

export async function fetchRemoteMenuData(): Promise<RemoteMenuResult> {
  if (!hasFirebaseEnvironment()) {
    return {
      bundle: null,
      reason: 'Firebase environment is not configured.',
    }
  }

  const [{ collection, doc, getDoc, getDocs }, { getFirebaseFirestore }] = await Promise.all([
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
    const settingsDocPath = import.meta.env.VITE_FIRESTORE_SETTINGS_DOC || 'meta/menu_app'
    const [settingsCollection, settingsDocument] = settingsDocPath.split('/')
    const settingsSnapshot =
      settingsCollection && settingsDocument ? await getDoc(doc(firestore, settingsCollection, settingsDocument)) : null
    const settings = mapFirestoreSettings(settingsSnapshot?.exists() ? settingsSnapshot.data() : null)
    const itemCollections = getCollectionNames(import.meta.env.VITE_FIRESTORE_MENU_COLLECTIONS, [
      'live_menu_items',
      'live_cocktails',
      'admin_draft_guide',
      'admin_draft_spirits_public',
    ])
    const noticeCollections = getCollectionNames(import.meta.env.VITE_FIRESTORE_NOTICE_COLLECTIONS, ['live_menu_notices'])
    const items = (
      await Promise.all(
        itemCollections.map(async (collectionName) => {
          const snapshot = await getDocs(collection(firestore, collectionName))

          return snapshot.docs
            .map((documentSnapshot) => mapFirestoreMenuItem(collectionName, documentSnapshot.id, documentSnapshot.data()))
            .filter((item) => item !== null)
        }),
      )
    ).flat()
    const notices = (
      await Promise.all(
        noticeCollections.map(async (collectionName) => {
          const snapshot = await getDocs(collection(firestore, collectionName))

          return snapshot.docs
            .map((documentSnapshot) => mapFirestoreNotice(documentSnapshot.id, documentSnapshot.data()))
            .filter((notice) => notice !== null)
        }),
      )
    ).flat()

    if (!items.length) {
      return {
        bundle: null,
        reason: 'Remote menu collections did not return menu items.',
      }
    }

    return {
      bundle: createRemoteBundle({
        settings,
        items,
        notices,
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
