import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { formatAbv, formatPriceShort, text } from '../domain/formatting'
import { handleImageFallback } from '../utils/imageFallback'

interface TarotCardSelectorProps {
  items: MenuItem[]
  language: LanguageCode
  onSelect: (item: MenuItem) => void
}

export function TarotCardSelector({ items, language, onSelect }: TarotCardSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [summaryImageIndex, setSummaryImageIndex] = useState(0)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const summaryDragStartX = useRef<number | null>(null)
  const galleryDragStartX = useRef<number | null>(null)
  const wasSummaryDragged = useRef(false)
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
    setSummaryImageIndex(0)
  }

  if (!activeItem) {
    return null
  }

  const description = text(activeItem.description, language)
  const tastingNote = activeItem.tastingNote ? text(activeItem.tastingNote, language) : ''
  const priceText = activeItem.priceWon !== undefined ? formatPriceShort(activeItem.priceWon) : ''
  const abvText = formatAbv(activeItem.alcoholAbv)
  const subImageUrls = activeItem.subImageUrls?.length ? activeItem.subImageUrls : ['/assets/legacy/noimage.png']

  function moveSummaryImage(direction: -1 | 1) {
    setSummaryImageIndex((current) => (current + direction + subImageUrls.length) % subImageUrls.length)
  }

  function moveGalleryImage(direction: -1 | 1) {
    setGalleryIndex((current) => ((current ?? 0) + direction + subImageUrls.length) % subImageUrls.length)
  }

  function handleSummaryDragEnd(clientX: number) {
    if (summaryDragStartX.current === null || subImageUrls.length <= 1) {
      summaryDragStartX.current = null
      return
    }

    const deltaX = clientX - summaryDragStartX.current
    summaryDragStartX.current = null

    if (Math.abs(deltaX) > 44) {
      wasSummaryDragged.current = true
      moveSummaryImage(deltaX < 0 ? 1 : -1)
      window.setTimeout(() => {
        wasSummaryDragged.current = false
      }, 0)
    }
  }

  function handleGalleryDragEnd(clientX: number) {
    if (galleryDragStartX.current === null || subImageUrls.length <= 1) {
      galleryDragStartX.current = null
      return
    }

    const deltaX = clientX - galleryDragStartX.current
    galleryDragStartX.current = null

    if (Math.abs(deltaX) > 44) {
      moveGalleryImage(deltaX < 0 ? 1 : -1)
    }
  }

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
          <div
            className="tarot-card-summary__carousel"
            aria-label="Cocktail images"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => {
              summaryDragStartX.current = event.clientX
            }}
            onPointerUp={(event) => handleSummaryDragEnd(event.clientX)}
            onPointerCancel={() => {
              summaryDragStartX.current = null
            }}
          >
            {subImageUrls.length > 1 ? (
              <button
                className="tarot-card-summary__carousel-arrow"
                type="button"
                aria-label="Previous cocktail image"
                onClick={() => moveSummaryImage(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
            ) : null}
            <button
              className="tarot-card-summary__image-button"
              type="button"
              aria-label="Open cocktail image"
              onClick={() => {
                if (!wasSummaryDragged.current) {
                  setGalleryIndex(summaryImageIndex)
                }
              }}
            >
              <img
                src={subImageUrls[summaryImageIndex] ?? subImageUrls[0]}
                alt=""
                decoding="async"
                draggable="false"
                onError={handleImageFallback}
              />
            </button>
            {subImageUrls.length > 1 ? (
              <button
                className="tarot-card-summary__carousel-arrow"
                type="button"
                aria-label="Next cocktail image"
                onClick={() => moveSummaryImage(1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            ) : null}
            {subImageUrls.length > 1 ? (
              <div className="image-dots" aria-label="Cocktail image pages">
                {subImageUrls.map((_, index) => (
                  <button
                    key={`${activeItem.id}-summary-dot-${index}`}
                    type="button"
                    aria-label={`Show cocktail image ${index + 1}`}
                    className={index === summaryImageIndex ? 'is-active' : ''}
                    onClick={() => setSummaryImageIndex(index)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <span className="tarot-card-summary__heading">
          <span className="tarot-card-summary__name">
            <strong className={activeItem.soldOut ? 'is-sold-out-text' : ''}>{text(activeItem.name, language)}</strong>
            {abvText ? (
              <span className="tarot-card-summary__abv">{abvText}%</span>
            ) : null}
          </span>
          {activeItem.soldOut || priceText ? <b>{activeItem.soldOut ? 'SOLD OUT' : priceText}</b> : null}
        </span>
        {description ? <span className="tarot-card-summary__description">{description}</span> : null}
        {tastingNote && tastingNote !== description ? (
          <span className="tarot-card-summary__description">{tastingNote}</span>
        ) : null}
      </section>
      {galleryIndex !== null && subImageUrls.length && typeof document !== 'undefined' ? createPortal(
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
            <div
              className="image-dialog__gallery"
              style={{ '--image-dialog-index': galleryIndex } as CSSProperties}
              onPointerDown={(event) => {
                galleryDragStartX.current = event.clientX
              }}
              onPointerUp={(event) => handleGalleryDragEnd(event.clientX)}
              onPointerCancel={() => {
                galleryDragStartX.current = null
              }}
            >
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
                <button type="button" onClick={() => moveGalleryImage(-1)}>
                  <ChevronLeft aria-hidden="true" />
                </button>
                <div className="image-dots" aria-label="Cocktail image pages">
                  {subImageUrls.map((_, index) => (
                    <button
                      key={`${activeItem.id}-dialog-dot-${index}`}
                      type="button"
                      aria-label={`Show cocktail image ${index + 1}`}
                      className={index === galleryIndex ? 'is-active' : ''}
                      onClick={() => setGalleryIndex(index)}
                    />
                  ))}
                </div>
                <button type="button" onClick={() => moveGalleryImage(1)}>
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </section>
        </div>,
        document.body,
      ) : null}
    </section>
  )
}
