import { useState } from 'react'
import { Languages } from 'lucide-react'
import type { LanguageCode } from '../domain/menu'
import { languageLabels } from '../domain/formatting'

interface LanguageToggleProps {
  language: LanguageCode
  onChange: (language: LanguageCode) => void
}

const languages: LanguageCode[] = ['ko', 'en', 'ja', 'zh']

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleChange(nextLanguage: LanguageCode) {
    onChange(nextLanguage)
    setIsOpen(false)
  }

  return (
    <div className="language-toggle" aria-label="Language">
      <button
        className="language-toggle__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Languages aria-hidden="true" size={18} />
        언어
      </button>
      {isOpen ? (
        <div className="language-toggle__menu" role="menu">
          {languages.map((item) => (
            <button
              key={item}
              className={item === language ? 'is-active' : ''}
              type="button"
              role="menuitemradio"
              aria-checked={item === language}
              onClick={() => handleChange(item)}
            >
              {languageLabels[item]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
