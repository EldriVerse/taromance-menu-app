import { Sparkles } from 'lucide-react'
import type { LanguageCode } from '../domain/menu'
import { LanguageToggle } from './LanguageToggle'

interface PortalScreenProps {
  language: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
  onEnter: () => void
}

export function PortalScreen({ language, onLanguageChange, onEnter }: PortalScreenProps) {
  return (
    <main className="portal-screen">
      <div className="portal-topbar">
        <LanguageToggle language={language} onChange={onLanguageChange} />
      </div>
      <button className="portal-gate" type="button" onClick={onEnter}>
        <img src="/assets/legacy/iv_loading.png" alt="" />
        <span className="portal-gate__title">TAROMANCE</span>
        <span className="portal-gate__caption">
          <Sparkles aria-hidden="true" size={20} />
          PRESS TO ENTER
        </span>
      </button>
    </main>
  )
}
