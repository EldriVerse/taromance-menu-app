import { ImageOff } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { formatPriceShort, text } from '../domain/formatting'

interface MenuListProps {
  items: MenuItem[]
  language: LanguageCode
  onSelect: (item: MenuItem) => void
}

export function MenuList({ items, language, onSelect }: MenuListProps) {
  return (
    <div className="menu-list">
      {items.map((item, index) => (
        <button
          key={item.id}
          className={[
            'menu-item',
            item.soldOut ? 'is-sold-out' : '',
            item.glassImageUrl ? '' : 'menu-item--no-media',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ '--menu-item-index': index } as CSSProperties}
          type="button"
          onClick={() => onSelect(item)}
        >
          <span className="menu-item__media">
            {item.glassImageUrl ? (
              <img src={item.glassImageUrl} alt="" decoding="async" draggable="false" />
            ) : (
              <ImageOff aria-hidden="true" />
            )}
          </span>
          <span className="menu-item__body">
            <strong>{text(item.name, language)}</strong>
            <small>{text(item.summary, language)}</small>
          </span>
          <span className="menu-item__meta">
            {item.soldOut ? <em>SOLD OUT</em> : null}
            {item.priceWon ? <b>{formatPriceShort(item.priceWon)}</b> : null}
          </span>
        </button>
      ))}
    </div>
  )
}
