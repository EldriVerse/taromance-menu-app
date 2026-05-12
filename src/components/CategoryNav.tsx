import { useEffect } from 'react'
import type { CategoryId, LanguageCode, MenuCategory } from '../domain/menu'
import { text } from '../domain/formatting'

interface CategoryNavProps {
  categories: MenuCategory[]
  activeId: CategoryId
  language: LanguageCode
  onSelect: (categoryId: CategoryId) => void
}

const buttonImageNames = {
  guide: 'guide',
  cocktail: 'cocktail',
  whisky: 'whisky',
  'wine-spirits': 'wineandspirits',
} satisfies Record<CategoryId, string>

const preloadedCategoryImages = new Set<string>()

function categoryButtonImageUrl(categoryId: CategoryId, language: LanguageCode, active: boolean) {
  const languageSuffix = language === 'ko' ? 'k' : 'e'
  const stateSuffix = active ? '01' : '00'
  const imageName = buttonImageNames[categoryId]

  return `/assets/legacy/category-buttons/iv_btn_menu_main_${imageName}_${languageSuffix}_${stateSuffix}.png`
}

export function CategoryNav({ categories, activeId, language, onSelect }: CategoryNavProps) {
  useEffect(() => {
    for (const category of categories) {
      for (const isActive of [false, true]) {
        const imageUrl = categoryButtonImageUrl(category.id, language, isActive)

        if (preloadedCategoryImages.has(imageUrl)) {
          continue
        }

        const image = new Image()
        image.src = imageUrl
        preloadedCategoryImages.add(imageUrl)
      }
    }
  }, [categories, language])

  return (
    <nav className="category-nav" aria-label="Menu categories">
      {categories.map((category) => {
        const imageUrl = categoryButtonImageUrl(category.id, language, category.id === activeId)
        const handleSelect = () => {
          if (category.id !== activeId) {
            onSelect(category.id)
          }
        }

        return (
          <button
            key={category.id}
            className={category.id === activeId ? 'is-active' : ''}
            type="button"
            onPointerDown={handleSelect}
            onClick={handleSelect}
            aria-label={text(category.label, language)}
          >
            <img src={imageUrl} alt="" aria-hidden="true" decoding="async" draggable="false" />
            <span>{text(category.label, language)}</span>
          </button>
        )
      })}
    </nav>
  )
}
