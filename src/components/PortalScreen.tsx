import { useEffect, useState } from 'react'

interface PortalScreenProps {
  onEnter: () => void | Promise<void>
  dataStatus: 'idle' | 'checking' | 'ready' | 'fallback'
  dataMessage: string
  isExiting?: boolean
}

export function PortalScreen({ onEnter, dataStatus, dataMessage, isExiting = false }: PortalScreenProps) {
  const [isTitleFontReady, setIsTitleFontReady] = useState(() => !('fonts' in document))
  const isBusy = dataStatus === 'checking' || isExiting || dataMessage.startsWith('Loading assets')
  const shouldShowStatus = isBusy || dataStatus === 'fallback'

  useEffect(() => {
    let isMounted = true

    if (!('fonts' in document)) {
      return
    }

    document.fonts
      .load('1em BMEuljiro10Years')
      .then(() => document.fonts.ready)
      .finally(() => {
        if (isMounted) {
          setIsTitleFontReady(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className={`portal-screen ${isExiting ? 'is-exiting' : ''} ${isTitleFontReady ? 'is-font-ready' : ''}`}>
      <button className="portal-gate" type="button" onClick={onEnter} disabled={dataStatus === 'checking' || isExiting}>
        <span className="portal-gate__title">TAROMANCE</span>
        <span className="portal-gate__caption">
          {isBusy ? 'LOADING' : 'PRESS TO TOUCH'}
        </span>
        {shouldShowStatus ? <span className="portal-gate__status">{dataMessage}</span> : null}
      </button>
    </main>
  )
}
