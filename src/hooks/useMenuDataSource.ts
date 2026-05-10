import { useCallback, useState } from 'react'
import type { DataSourceState } from '../domain/menu'
import { checkMenuDataSource, createInitialDataSourceState } from '../repositories/MenuDataService'

export function useMenuDataSource() {
  const [state, setState] = useState<DataSourceState>(() => createInitialDataSourceState())

  const checkForUpdates = useCallback(async () => {
    setState((current) => ({
      ...current,
      status: 'checking',
      message: '메뉴 데이터를 확인하고 있습니다.',
    }))

    const nextState = await checkMenuDataSource(state.bundle)
    setState(nextState)

    return nextState
  }, [state.bundle])

  return {
    ...state,
    checkForUpdates,
  }
}
