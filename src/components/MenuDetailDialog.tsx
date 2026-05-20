import { X } from 'lucide-react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { alcoholLabels, formatAbv, formatPriceShort, text } from '../domain/formatting'
import { handleImageFallback } from '../utils/imageFallback'

interface MenuDetailDialogProps {
  item: MenuItem | null
  language: LanguageCode
  onClose: () => void
}

export function MenuDetailDialog({ item, language, onClose }: MenuDetailDialogProps) {
  if (!item) {
    return null
  }

  const isTarotSignature = item.kind === 'tarot-signature'
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
      <section className="menu-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" aria-label="Close" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
        <div className="menu-dialog__visual">
          {detailImageUrls.length > 1 ? (
            <div className="menu-dialog__gallery" aria-label="Menu images">
              {detailImageUrls.map((imageUrl, index) => (
                <img key={`${item.id}-dialog-${index}`} src={imageUrl} alt="" decoding="async" draggable="false" />
              ))}
            </div>
          ) : (
            <img src={detailImageUrls[0]} alt="" decoding="async" draggable="false" />
          )}
          {item.glassImageUrl ? (
            <img
              className="menu-dialog__glass"
              src={item.glassImageUrl}
              alt=""
              decoding="async"
              draggable="false"
              onError={handleImageFallback}
            />
          ) : null}
        </div>
        <div className="menu-dialog__body">
          <h2 className={item.soldOut ? 'is-sold-out-text' : ''}>{text(item.name, language)}</h2>
          {isCocktailItem && (item.glassImageUrl || abvText) ? (
            <p className="menu-dialog__cocktail-info">
              {item.glassImageUrl ? (
                <img src={item.glassImageUrl} alt="" decoding="async" draggable="false" onError={handleImageFallback} />
              ) : null}
              {abvText ? (
                <span>
                  {alcoholLabels[language]} : {abvText}%
                </span>
              ) : null}
            </p>
          ) : null}
          {item.soldOut || priceText ? (
            <strong className={isCocktailItem ? 'menu-dialog__price menu-dialog__price--cocktail' : 'menu-dialog__price'}>
              {item.soldOut ? 'SOLD OUT' : priceText}
            </strong>
          ) : null}
          {description ? <span>{description}</span> : null}
          {tastingNote && tastingNote !== description ? <span>{tastingNote}</span> : null}
        </div>
      </section>
    </div>
  )
}
