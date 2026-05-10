import type { CategoryTab, LanguageCode } from '../domain/menu'
import { text } from '../domain/formatting'

interface SubcategoryTabsProps {
  tabs: CategoryTab[]
  activeTabId?: string
  language: LanguageCode
  onSelect: (tabId: string) => void
}

export function SubcategoryTabs({ tabs, activeTabId, language, onSelect }: SubcategoryTabsProps) {
  if (!tabs.length) {
    return null
  }

  return (
    <div className="subcategory-tabs" role="tablist" aria-label="Menu sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === activeTabId ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTabId}
          onClick={() => onSelect(tab.id)}
        >
          {text(tab.label, language)}
        </button>
      ))}
    </div>
  )
}
