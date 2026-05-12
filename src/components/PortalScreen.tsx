import { Sparkles } from 'lucide-react'

interface PortalScreenProps {
  onEnter: () => void | Promise<void>
  dataStatus: 'idle' | 'checking' | 'ready' | 'fallback'
  dataMessage: string
  isExiting?: boolean
}

export function PortalScreen({ onEnter, dataStatus, dataMessage, isExiting = false }: PortalScreenProps) {
  return (
    <main className={isExiting ? 'portal-screen is-exiting' : 'portal-screen'}>
      <button className="portal-gate" type="button" onClick={onEnter} disabled={dataStatus === 'checking' || isExiting}>
        <span className="portal-gate__title">타로맨스</span>
        <span className="portal-gate__caption">
          <Sparkles aria-hidden="true" size={20} />
          {dataStatus === 'checking' || isExiting ? 'LOADING' : 'PRESS TO ENTER'}
        </span>
        <span className="portal-gate__status">{dataMessage}</span>
      </button>
    </main>
  )
}
