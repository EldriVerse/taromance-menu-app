import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { formatAbv, formatPriceShort, text } from '../domain/formatting'
import { handleImageFallback } from '../utils/imageFallback'

interface MenuDetailDialogProps {
  item: MenuItem | null
  language: LanguageCode
  onClose: () => void
}

export function MenuDetailDialog({ item, language, onClose }: MenuDetailDialogProps) {
  const [imageState, setImageState] = useState({ itemId: '', index: 0 })
  const dragStartX = useRef<number | null>(null)

  if (!item) {
    return null
  }

  const isTarotSignature = item.kind === 'tarot-signature'
  const isGuideItem = item.categoryId === 'guide' || item.kind === 'guide'
  const detailImageUrls = isTarotSignature
    ? item.subImageUrls?.length
      ? item.subImageUrls
      : ['/assets/legacy/noimage.png']
    : [item.imageUrl || item.assetUrl || '/assets/legacy/noimage.png']
  const description = text(item.description, language)
  const tastingNote = item.tastingNote ? text(item.tastingNote, language) : ''
  const priceText = item.priceWon !== undefined ? formatPriceShort(item.priceWon) : ''
  const abvText = formatAbv(item.alcoholAbv)
  const isCocktailItem = item.categoryId === 'cocktail' || item.kind === 'cocktail' || item.kind === 'tarot-signature'
  const itemId = item.id
  const imageIndex = imageState.itemId === itemId ? imageState.index % detailImageUrls.length : 0

  function moveImage(direction: -1 | 1) {
    setImageState({
      itemId,
      index: (imageIndex + direction + detailImageUrls.length) % detailImageUrls.length,
    })
  }

  function handleImageDragEnd(clientX: number) {
    if (dragStartX.current === null || detailImageUrls.length <= 1) {
      dragStartX.current = null
      return
    }

    const deltaX = clientX - dragStartX.current
    dragStartX.current = null

    if (Math.abs(deltaX) > 44) {
      moveImage(deltaX < 0 ? 1 : -1)
    }
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className={['menu-dialog', isGuideItem ? 'menu-dialog--guide' : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="Close" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
        {!isGuideItem ? (
          <div className="menu-dialog__visual">
            {detailImageUrls.length > 1 ? (
              <div
                className="menu-dialog__gallery"
                aria-label="Menu images"
                style={{ '--menu-dialog-image-index': imageIndex } as CSSProperties}
                onPointerDown={(event) => {
                  dragStartX.current = event.clientX
                }}
                onPointerUp={(event) => handleImageDragEnd(event.clientX)}
                onPointerCancel={() => {
                  dragStartX.current = null
                }}
              >
                {detailImageUrls.map((imageUrl, index) => (
                  <img
                    key={`${item.id}-dialog-${index}`}
                    src={imageUrl}
                    alt=""
                    decoding="async"
                    draggable="false"
                    onError={handleImageFallback}
                  />
                ))}
                <div className="menu-dialog__gallery-controls">
                  <button type="button" aria-label="Previous menu image" onClick={() => moveImage(-1)}>
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <span>{`${imageIndex + 1} / ${detailImageUrls.length}`}</span>
                  <button type="button" aria-label="Next menu image" onClick={() => moveImage(1)}>
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <img src={detailImageUrls[0]} alt="" decoding="async" draggable="false" onError={handleImageFallback} />
            )}
          </div>
        ) : null}
        <div className="menu-dialog__body">
          <h2 className={item.soldOut ? 'is-sold-out-text' : ''}>{text(item.name, language)}</h2>
          {isCocktailItem && abvText ? (
            <p className="menu-dialog__cocktail-info">
              <span>{abvText}%</span>
            </p>
          ) : null}
          {item.soldOut || priceText ? (
            <strong className={isCocktailItem ? 'menu-dialog__price menu-dialog__price--cocktail' : 'menu-dialog__price'}>
              {item.soldOut ? 'SOLD OUT' : priceText}
            </strong>
          ) : null}
          {description ? <span className="menu-dialog__description">{description}</span> : null}
          {tastingNote && tastingNote !== description ? <span className="menu-dialog__description">{tastingNote}</span> : null}
        </div>
      </section>
    </div>
  )
}
