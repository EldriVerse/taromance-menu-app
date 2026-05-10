import type { LanguageCode } from '../domain/menu'
import { languageLabels } from '../domain/formatting'

interface LanguageToggleProps {
  language: LanguageCode
  onChange: (language: LanguageCode) => void
}

const languages: LanguageCode[] = ['ko', 'en', 'ja', 'zh']

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="language-toggle" aria-label="Language">
      {languages.map((item) => (
        <button
          key={item}
          className={item === language ? 'is-active' : ''}
          type="button"
          onClick={() => onChange(item)}
        >
          {languageLabels[item]}
        </button>
      ))}
    </div>
  )
}
