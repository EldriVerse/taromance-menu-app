import type { MenuDataBundle } from '../domain/menu'

export interface RemoteMenuResult {
  bundle: MenuDataBundle | null
  reason?: string
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

  return {
    bundle: null,
    reason: 'Firebase collection mapping is pending.',
  }
}
