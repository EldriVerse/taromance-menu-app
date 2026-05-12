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

export function CategoryNav({ categories, activeId, language, onSelect }: CategoryNavProps) {
  const languageSuffix = language === 'ko' ? 'k' : 'e'

  return (
    <nav className="category-nav" aria-label="Menu categories">
      {categories.map((category) => {
        const stateSuffix = category.id === activeId ? '01' : '00'
        const imageName = buttonImageNames[category.id]
        const imageUrl = `/assets/legacy/category-buttons/iv_btn_menu_main_${imageName}_${languageSuffix}_${stateSuffix}.png`

        return (
          <button
            key={category.id}
            className={category.id === activeId ? 'is-active' : ''}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-label={text(category.label, language)}
          >
            <img src={imageUrl} alt="" aria-hidden="true" />
            <span>{text(category.label, language)}</span>
          </button>
        )
      })}
    </nav>
  )
}
