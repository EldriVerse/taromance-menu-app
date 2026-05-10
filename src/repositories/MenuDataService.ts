import { createLocalDataBundle } from '../data/localDataBundle'
import type { DataSourceState, MenuDataBundle } from '../domain/menu'
import { readCachedMenuData, writeCachedMenuData } from './BrowserMenuCache'
import { fetchRemoteMenuData } from './RemoteMenuRepository'

function chooseInitialBundle(): MenuDataBundle {
  return readCachedMenuData() ?? createLocalDataBundle()
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

  if (cachedBundle && cachedBundle.settings.contentVersion !== currentBundle.settings.contentVersion) {
    return {
      bundle: cachedBundle,
      status: 'fallback',
      message: '저장된 메뉴 데이터로 실행 중입니다.',
      lastCheckedAt: checkedAt,
    }
  }

  return {
    bundle: currentBundle.source === 'cache' ? currentBundle : createLocalDataBundle(),
    status: 'fallback',
    message: remoteResult.reason ?? '로컬 메뉴 데이터로 실행 중입니다.',
    lastCheckedAt: checkedAt,
  }
}
