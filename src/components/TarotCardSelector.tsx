import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { formatPriceShort, text } from '../domain/formatting'

interface TarotCardSelectorProps {
  items: MenuItem[]
  language: LanguageCode
  onSelect: (item: MenuItem) => void
}

export function TarotCardSelector({ items, language, onSelect }: TarotCardSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = items[activeIndex]
  const visibleItems = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        offset: index - activeIndex,
      })),
    [activeIndex, items],
  )

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + items.length) % items.length)
  }

  if (!activeItem) {
    return null
  }

  const description = text(activeItem.description, language)
  const tastingNote = activeItem.tastingNote ? text(activeItem.tastingNote, language) : ''

  return (
    <section className="tarot-selector" aria-label="Tarot signature cocktail cards">
      <button className="tarot-arrow" type="button" aria-label="Previous card" onClick={() => move(-1)}>
        <ChevronLeft aria-hidden="true" />
      </button>
      <div
        className="tarot-stage"
        onTouchStart={(event) => {
          const startX = event.touches[0].clientX
          const target = event.currentTarget
          const onEnd = (endEvent: TouchEvent) => {
            const endX = endEvent.changedTouches[0].clientX
            if (Math.abs(startX - endX) > 40) {
              move(startX > endX ? 1 : -1)
            }
            target.removeEventListener('touchend', onEnd)
          }
          target.addEventListener('touchend', onEnd)
        }}
      >
        {visibleItems.map(({ item, offset }) => {
          const isVisible = Math.abs(offset) <= 2
          const cardImageUrl = item.tarotCard?.imageUrl || item.imageUrl || item.assetUrl || '/assets/legacy/noimage.png'

          return (
            <button
              key={item.id}
              className={`tarot-card ${offset === 0 ? 'is-active' : ''} ${item.soldOut ? 'is-sold-out' : ''}`}
              style={{
                transform: `translateX(calc(${offset * 34}% + var(--tarot-card-shift-x, 0px))) scale(${
                  offset === 0 ? 1 : 0.82
                })`,
                opacity: isVisible ? 1 : 0,
                zIndex: 10 - Math.abs(offset),
              }}
              type="button"
              tabIndex={offset === 0 ? 0 : -1}
              onClick={() => (offset === 0 ? onSelect(item) : setActiveIndex(items.indexOf(item)))}
            >
              <img className="tarot-card__image" src={cardImageUrl} alt="" decoding="async" draggable="false" />
            </button>
          )
        })}
      </div>
      <button className="tarot-arrow" type="button" aria-label="Next card" onClick={() => move(1)}>
        <ChevronRight aria-hidden="true" />
      </button>
      <button className="tarot-card-summary" type="button" aria-live="polite" onClick={() => onSelect(activeItem)}>
        {activeItem.subImageUrls?.length ? (
          <div className="tarot-card-summary__images" aria-label="Cocktail images">
            {activeItem.subImageUrls.map((imageUrl, index) => (
              <img key={`${activeItem.id}-sub-${index}`} src={imageUrl} alt="" decoding="async" draggable="false" />
            ))}
          </div>
        ) : null}
        <p>{String(activeItem.tarotCard?.number ?? 0).padStart(2, '0')}</p>
        <strong className={activeItem.soldOut ? 'is-sold-out-text' : ''}>{text(activeItem.name, language)}</strong>
        <b>{activeItem.soldOut ? 'SOLD OUT' : activeItem.priceWon ? formatPriceShort(activeItem.priceWon) : ''}</b>
        {description ? <span>{description}</span> : null}
        {tastingNote && tastingNote !== description ? <span>{tastingNote}</span> : null}
      </button>
    </section>
  )
}
