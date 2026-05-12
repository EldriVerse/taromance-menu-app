interface PortalScreenProps {
  onEnter: () => void | Promise<void>
  dataStatus: 'idle' | 'checking' | 'ready' | 'fallback'
  dataMessage: string
  isExiting?: boolean
}

export function PortalScreen({ onEnter, dataStatus, dataMessage, isExiting = false }: PortalScreenProps) {
  const isBusy = dataStatus === 'checking' || isExiting || dataMessage.startsWith('Loading assets')
  const shouldShowStatus = isBusy || dataStatus === 'fallback'

  return (
    <main className={isExiting ? 'portal-screen is-exiting' : 'portal-screen'}>
      <button className="portal-gate" type="button" onClick={onEnter} disabled={dataStatus === 'checking' || isExiting}>
        <span className="portal-gate__title">타로맨스</span>
        <span className="portal-gate__caption">
          {isBusy ? 'LOADING' : 'PRESS TO TOUCH'}
        </span>
        {shouldShowStatus ? <span className="portal-gate__status">{dataMessage}</span> : null}
      </button>
    </main>
  )
}
