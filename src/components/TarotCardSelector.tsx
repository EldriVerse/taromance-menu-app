import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { alcoholLabels, formatAbv, formatPriceShort, text } from '../domain/formatting'
import { handleImageFallback } from '../utils/imageFallback'

interface TarotCardSelectorProps {
  items: MenuItem[]
  language: LanguageCode
  onSelect: (item: MenuItem) => void
}

export function TarotCardSelector({ items, language, onSelect }: TarotCardSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
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
  const priceText = activeItem.priceWon !== undefined ? formatPriceShort(activeItem.priceWon) : ''
  const abvText = formatAbv(activeItem.alcoholAbv)
  const subImageUrls = activeItem.subImageUrls?.length ? activeItem.subImageUrls : []

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
                transform: `translateX(calc(${offset * 37}% + var(--tarot-card-shift-x, 0px))) translateY(${
                  offset === 0 ? 'var(--tarot-card-active-y, 0px)' : 'var(--tarot-card-side-y, 0px)'
                }) scale(${offset === 0 ? 'var(--tarot-card-active-scale, 1.18)' : 'var(--tarot-card-side-scale, 0.74)'})`,
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
      <section
        className="tarot-card-summary"
        role="button"
        tabIndex={0}
        aria-live="polite"
        onClick={() => onSelect(activeItem)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(activeItem)
          }
        }}
      >
        {subImageUrls.length ? (
          <div className="tarot-card-summary__images" aria-label="Cocktail images">
            {subImageUrls.map((imageUrl, index) => (
              <button
                key={`${activeItem.id}-sub-${index}`}
                className="tarot-card-summary__image-button"
                type="button"
                aria-label={`Open cocktail image ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation()
                  setGalleryIndex(index)
                }}
              >
                <img src={imageUrl} alt="" decoding="async" draggable="false" onError={handleImageFallback} />
              </button>
            ))}
          </div>
        ) : null}
        <span className="tarot-card-summary__heading">
          <span className="tarot-card-summary__name">
            <strong className={activeItem.soldOut ? 'is-sold-out-text' : ''}>{text(activeItem.name, language)}</strong>
            {abvText ? (
              <span className="tarot-card-summary__abv">
                ( {alcoholLabels[language]} : {abvText}% )
              </span>
            ) : null}
          </span>
          {activeItem.soldOut || priceText ? <b>{activeItem.soldOut ? 'SOLD OUT' : priceText}</b> : null}
        </span>
        {description ? <span className="tarot-card-summary__description">{description}</span> : null}
        {tastingNote && tastingNote !== description ? (
          <span className="tarot-card-summary__description">{tastingNote}</span>
        ) : null}
      </section>
      {galleryIndex !== null && subImageUrls.length ? (
        <div
          className="image-dialog-backdrop"
          role="presentation"
          onClick={() => {
            setGalleryIndex(null)
          }}
        >
          <section
            className="image-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Cocktail images"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="dialog-close" type="button" aria-label="Close" onClick={() => setGalleryIndex(null)}>
              <X aria-hidden="true" />
            </button>
            <div className="image-dialog__gallery" style={{ '--image-dialog-index': galleryIndex } as CSSProperties}>
              {subImageUrls.map((imageUrl, index) => (
                <img
                  key={`${activeItem.id}-gallery-${index}`}
                  src={imageUrl}
                  alt=""
                  decoding="async"
                  draggable="false"
                  onError={handleImageFallback}
                />
              ))}
            </div>
            {subImageUrls.length > 1 ? (
              <div className="image-dialog__controls">
                <button type="button" onClick={() => setGalleryIndex((current) => ((current ?? 0) - 1 + subImageUrls.length) % subImageUrls.length)}>
                  <ChevronLeft aria-hidden="true" />
                </button>
                <span>
                  {galleryIndex + 1} / {subImageUrls.length}
                </span>
                <button type="button" onClick={() => setGalleryIndex((current) => ((current ?? 0) + 1) % subImageUrls.length)}>
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  )
}
