import { BookOpen, GlassWater, ScrollText, Wine } from 'lucide-react'
import type { CategoryId, LanguageCode, MenuCategory } from '../domain/menu'
import { text } from '../domain/formatting'

interface CategoryNavProps {
  categories: MenuCategory[]
  activeId: CategoryId
  language: LanguageCode
  onSelect: (categoryId: CategoryId) => void
}

const icons = {
  guide: ScrollText,
  cocktail: GlassWater,
  whisky: BookOpen,
  'wine-spirits': Wine,
} satisfies Record<CategoryId, typeof ScrollText>

export function CategoryNav({ categories, activeId, language, onSelect }: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label="Menu categories">
      {categories.map((category) => {
        const Icon = icons[category.id]

        return (
          <button
            key={category.id}
            className={category.id === activeId ? 'is-active' : ''}
            type="button"
            onClick={() => onSelect(category.id)}
          >
            <Icon aria-hidden="true" size={26} />
            <span>{text(category.label, language)}</span>
          </button>
        )
      })}
    </nav>
  )
}
