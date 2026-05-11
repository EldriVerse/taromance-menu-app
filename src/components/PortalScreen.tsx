import { Sparkles } from 'lucide-react'

interface PortalScreenProps {
  onEnter: () => void | Promise<void>
  dataStatus: 'idle' | 'checking' | 'ready' | 'fallback'
  dataMessage: string
}

export function PortalScreen({ onEnter, dataStatus, dataMessage }: PortalScreenProps) {
  return (
    <main className="portal-screen">
      <button className="portal-gate" type="button" onClick={onEnter} disabled={dataStatus === 'checking'}>
        <span className="portal-gate__title">TAROMANCE</span>
        <span className="portal-gate__caption">
          <Sparkles aria-hidden="true" size={20} />
          {dataStatus === 'checking' ? 'LOADING' : 'PRESS TO ENTER'}
        </span>
        <span className="portal-gate__status">{dataMessage}</span>
      </button>
    </main>
  )
}
