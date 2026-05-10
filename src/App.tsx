import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { CategoryNav } from './components/CategoryNav'
import { LanguageToggle } from './components/LanguageToggle'
import { MenuDetailDialog } from './components/MenuDetailDialog'
import { MenuList } from './components/MenuList'
import { NoticeTicker } from './components/NoticeTicker'
import { PortalScreen } from './components/PortalScreen'
import { SubcategoryTabs } from './components/SubcategoryTabs'
import { TarotCardSelector } from './components/TarotCardSelector'
import { text } from './domain/formatting'
import type { CategoryId, LanguageCode, MenuItem } from './domain/menu'
import { getAvailableCategories, getMenuItems, getNotices } from './repositories/LocalMenuRepository'

function App() {
  const [entered, setEntered] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>('ko')
  const categories = useMemo(() => getAvailableCategories(), [])
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>('cocktail')
  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0]
  const [activeTabId, setActiveTabId] = useState<string | undefined>(activeCategory.tabs[0]?.id)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const activeTab = activeCategory.tabs.find((tab) => tab.id === activeTabId) ?? activeCategory.tabs[0]
  const items = useMemo(() => getMenuItems(activeCategory.id, activeTab?.id), [activeCategory.id, activeTab?.id])
  const notices = useMemo(() => getNotices(activeCategory.id, activeTab?.id), [activeCategory.id, activeTab?.id])

  function handleCategorySelect(categoryId: CategoryId) {
    const nextCategory = categories.find((category) => category.id === categoryId)
    setActiveCategoryId(categoryId)
    setActiveTabId(nextCategory?.tabs[0]?.id)
  }

  if (!entered) {
    return <PortalScreen language={language} onLanguageChange={setLanguage} onEnter={() => setEntered(true)} />
  }

  return (
    <main className="app-shell">
      <CategoryNav
        categories={categories}
        activeId={activeCategory.id}
        language={language}
        onSelect={handleCategorySelect}
      />
      <section className="grimoire-panel">
        <header className="grimoire-header">
          <div>
            <p>{text(activeCategory.subtitle, language)}</p>
            <h1>{text(activeCategory.label, language)}</h1>
          </div>
          <div className="header-actions">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button className="icon-button" type="button" aria-label="Back to portal" onClick={() => setEntered(false)}>
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </header>
        <SubcategoryTabs
          tabs={activeCategory.tabs}
          activeTabId={activeTab?.id}
          language={language}
          onSelect={setActiveTabId}
        />
        <NoticeTicker notices={notices} language={language} />
        {activeCategory.id === 'cocktail' && activeTab?.id === 'tarot-signature' ? (
          <TarotCardSelector items={items} language={language} onSelect={setSelectedItem} />
        ) : (
          <MenuList items={items} language={language} onSelect={setSelectedItem} />
        )}
      </section>
      <MenuDetailDialog item={selectedItem} language={language} onClose={() => setSelectedItem(null)} />
    </main>
  )
}

export default App
