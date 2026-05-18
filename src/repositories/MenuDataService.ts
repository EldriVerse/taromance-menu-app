import { createEmptyDataBundle } from '../data/localDataBundle'
import type { DataSourceState, MenuDataBundle } from '../domain/menu'
import { readCachedMenuData, writeCachedMenuData } from './BrowserMenuCache'
import { fetchRemoteMenuData } from './RemoteMenuRepository'

function chooseInitialBundle(): MenuDataBundle {
  return readCachedMenuData() ?? createEmptyDataBundle()
}

export function createInitialDataSourceState(): DataSourceState {
  return {
    bundle: chooseInitialBundle(),
    status: 'idle',
    message: '메뉴 데이터를 준비했습니다.',
  }
}

export async function checkMenuDataSource(currentBundle: MenuDataBundle): Promise<DataSourceState> {
  const checkedAt = new Date().toISOString()
  const remoteResult = await fetchRemoteMenuData()

  if (remoteResult.bundle) {
    writeCachedMenuData(remoteResult.bundle)

    return {
      bundle: {
        ...remoteResult.bundle,
        source: 'remote',
        loadedAt: checkedAt,
      },
      status: 'ready',
      message: '최신 메뉴 데이터를 불러왔습니다.',
      lastCheckedAt: checkedAt,
    }
  }

  const cachedBundle = readCachedMenuData()

  if (cachedBundle) {
    return {
      bundle: cachedBundle,
      status: 'fallback',
      message: 'Firebase 접속에 실패해 마지막으로 저장된 메뉴 데이터로 실행합니다.',
      lastCheckedAt: checkedAt,
    }
  }

  return {
    bundle: currentBundle.source === 'cache' ? currentBundle : createEmptyDataBundle(),
    status: 'fallback',
    message: remoteResult.reason
      ? `Firebase 접속에 실패했습니다. ${remoteResult.reason}`
      : 'Firebase 접속에 실패했고 저장된 메뉴 데이터가 없습니다.',
    lastCheckedAt: checkedAt,
  }
}
