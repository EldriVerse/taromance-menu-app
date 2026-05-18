import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { CategoryNav } from './components/CategoryNav'
import { CustomCocktailBuilder } from './components/CustomCocktailBuilder'
import { LanguageToggle } from './components/LanguageToggle'
import { MenuDetailDialog } from './components/MenuDetailDialog'
import { MenuList } from './components/MenuList'
import { NoticeTicker } from './components/NoticeTicker'
import { PortalScreen } from './components/PortalScreen'
import { SubcategoryTabs } from './components/SubcategoryTabs'
import { StoryCocktailBuilder } from './components/StoryCocktailBuilder'
import { TarotCardSelector } from './components/TarotCardSelector'
import type { CategoryId, LanguageCode, MenuItem } from './domain/menu'
import { getAvailableCategories, getMenuItems, getNotices } from './repositories/LocalMenuRepository'
import { useMenuDataSource } from './hooks/useMenuDataSource'
import { preloadMenuAssets } from './utils/preloadAssets'

function App() {
  const [entered, setEntered] = useState(false)
  const [isPortalExiting, setIsPortalExiting] = useState(false)
  const [assetProgress, setAssetProgress] = useState<string | null>(null)
  const [language, setLanguage] = useState<LanguageCode>('ko')
  const wasInactiveRef = useRef(false)
  const dataSource = useMenuDataSource()
  const categories = useMemo(() => getAvailableCategories(dataSource.bundle), [dataSource.bundle])
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>('guide')
  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0]
  const [activeTabId, setActiveTabId] = useState<string | undefined>(activeCategory.tabs[0]?.id)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const activeTab = activeCategory.tabs.find((tab) => tab.id === activeTabId) ?? activeCategory.tabs[0]
  const items = useMemo(
    () => getMenuItems(dataSource.bundle, activeCategory.id, activeTab?.id),
    [activeCategory.id, activeTab?.id, dataSource.bundle],
  )
  const notices = useMemo(
    () => getNotices(dataSource.bundle, activeCategory.id, activeTab?.id),
    [activeCategory.id, activeTab?.id, dataSource.bundle],
  )
  const isCustomCocktailTab = activeTab?.id === 'custom-cocktail' || activeTab?.id === 'cocktail_custom'
  const isStoryCocktailTab = activeTab?.id === 'story-cocktail' || activeTab?.id === 'cocktail_story'
  const isTarotSignatureTab = activeTab?.id === 'tarot-signature'

  const resetToPortal = useCallback(() => {
    const guideCategory = categories.find((category) => category.id === 'guide') ?? categories[0]

    setEntered(false)
    setIsPortalExiting(false)
    setAssetProgress(null)
    setLanguage('ko')
    setActiveCategoryId(guideCategory.id)
    setActiveTabId(guideCategory.tabs[0]?.id)
    setSelectedItem(null)
  }, [categories])

  useEffect(() => {
    let removeListener: (() => void) | undefined

    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        wasInactiveRef.current = true
        return
      }

      if (wasInactiveRef.current) {
        wasInactiveRef.current = false
        resetToPortal()
      }
    }).then((listener) => {
      removeListener = () => {
        void listener.remove()
      }
    })

    return () => {
      removeListener?.()
    }
  }, [resetToPortal])

  function handleCategorySelect(categoryId: CategoryId) {
    const nextCategory = categories.find((category) => category.id === categoryId)
    const firstTabWithItems = nextCategory?.tabs.find(
      (tab) => getMenuItems(dataSource.bundle, categoryId, tab.id).length > 0,
    )

    setActiveCategoryId(categoryId)
    setActiveTabId(firstTabWithItems?.id ?? nextCategory?.tabs[0]?.id)
  }

  async function handlePortalEnter() {
    if (isPortalExiting || dataSource.status === 'checking') {
      return
    }

    const nextState = await dataSource.checkForUpdates()

    if (nextState.status === 'fallback' && nextState.bundle.source === 'empty') {
      return
    }

    await preloadMenuAssets(nextState.bundle, language, (loaded, total) => {
      setAssetProgress(`Loading assets... ${loaded} / ${total}`)
    })
    setIsPortalExiting(true)
    window.setTimeout(() => {
      setEntered(true)
      setIsPortalExiting(false)
      setAssetProgress(null)
    }, 620)
  }

  if (!entered) {
    return (
      <PortalScreen
        onEnter={handlePortalEnter}
        dataStatus={dataSource.status}
        dataMessage={assetProgress ?? dataSource.message}
        isExiting={isPortalExiting}
      />
    )
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
          <div className="header-actions">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
        </header>
        <SubcategoryTabs
          tabs={activeCategory.tabs}
          activeTabId={activeTab?.id}
          language={language}
          onSelect={setActiveTabId}
        />
        <NoticeTicker notices={notices} language={language} />
        {activeCategory.id === 'cocktail' && isTarotSignatureTab ? (
          <TarotCardSelector items={items} language={language} onSelect={setSelectedItem} />
        ) : activeCategory.id === 'cocktail' && isCustomCocktailTab ? (
          <CustomCocktailBuilder language={language} />
        ) : activeCategory.id === 'cocktail' && isStoryCocktailTab ? (
          <StoryCocktailBuilder language={language} />
        ) : (
          <MenuList
            key={`${activeCategory.id}-${activeTab?.id ?? 'all'}-${dataSource.bundle.loadedAt}`}
            items={items}
            language={language}
            onSelect={setSelectedItem}
          />
        )}
      </section>
      <MenuDetailDialog item={selectedItem} language={language} onClose={() => setSelectedItem(null)} />
    </main>
  )
}

export default App
