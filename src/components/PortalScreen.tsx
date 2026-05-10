import { Sparkles } from 'lucide-react'
import type { LanguageCode } from '../domain/menu'
import { LanguageToggle } from './LanguageToggle'

interface PortalScreenProps {
  language: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
  onEnter: () => void | Promise<void>
  dataStatus: 'idle' | 'checking' | 'ready' | 'fallback'
  dataMessage: string
}

export function PortalScreen({ language, onLanguageChange, onEnter, dataStatus, dataMessage }: PortalScreenProps) {
  return (
    <main className="portal-screen">
      <div className="portal-topbar">
        <LanguageToggle language={language} onChange={onLanguageChange} />
      </div>
      <button className="portal-gate" type="button" onClick={onEnter} disabled={dataStatus === 'checking'}>
        <img src="/assets/legacy/iv_loading.png" alt="" />
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
