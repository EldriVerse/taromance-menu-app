import { ImageOff } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { alcoholLabels, formatAbv, formatPriceShort, text } from '../domain/formatting'
import { handleImageFallback } from '../utils/imageFallback'

interface MenuListProps {
  items: MenuItem[]
  language: LanguageCode
  onSelect: (item: MenuItem) => void
  showWhiskyPriceHeader?: boolean
}

export function MenuList({ items, language, onSelect, showWhiskyPriceHeader = false }: MenuListProps) {
  return (
    <div className={['menu-list', showWhiskyPriceHeader ? 'menu-list--whisky' : ''].filter(Boolean).join(' ')}>
      {showWhiskyPriceHeader ? (
        <div className="menu-price-header" aria-hidden="true">
          <span />
          <span />
          <span className="menu-price-header__columns">
            <b>Glass (30ml)</b>
            <b>Bottle</b>
          </span>
        </div>
      ) : null}
      {items.map((item, index) => {
        const opensDetailDialog = item.categoryId !== 'guide' && item.kind !== 'guide' && item.displayType !== 'section_header'
        const description = text(item.description, language)
        const tastingNote = item.tastingNote ? text(item.tastingNote, language) : ''
        const secondaryText = item.categoryId === 'guide' ? description : tastingNote || description || text(item.summary, language)
        const priceText = item.priceWon !== undefined ? formatPriceShort(item.priceWon) : ''
        const glassPriceText = item.priceGlassWon !== undefined ? formatPriceShort(item.priceGlassWon) : ''
        const bottlePriceText = item.priceBottleWon !== undefined ? formatPriceShort(item.priceBottleWon) : ''
        const abvText = formatAbv(item.alcoholAbv)
        const isCocktailItem = item.categoryId === 'cocktail' || item.kind === 'cocktail' || item.kind === 'tarot-signature'
        const usesWhiskyPriceColumns = item.categoryId === 'whisky' || item.kind === 'whisky'
        const mediaImageUrl = item.glassImageUrl || (isCocktailItem ? '/assets/legacy/noimage.png' : '')
        const usesPourPrices =
          usesWhiskyPriceColumns ||
          item.kind === 'wine' ||
          item.categoryId === 'wine-spirits' ||
          item.kind === 'spirit' ||
          item.kind === 'liqueur' ||
          item.kind === 'other'
        const hasPourPrices = usesPourPrices && Boolean(glassPriceText || bottlePriceText)

        return item.displayType === 'spacer' ? (
          <div
            key={item.id}
            className="menu-spacer"
            aria-hidden="true"
            style={{ '--menu-item-index': index } as CSSProperties}
          />
        ) : item.displayType === 'section_header' ? (
          <div
            key={item.id}
            className="menu-section-header"
            style={{ '--menu-item-index': index } as CSSProperties}
          >
            <strong>{text(item.name, language)}</strong>
            <small>{text(item.summary, language)}</small>
          </div>
        ) : (
          <button
            key={item.id}
            className={[
              'menu-item',
              item.soldOut ? 'is-sold-out' : '',
              mediaImageUrl ? '' : 'menu-item--no-media',
              isCocktailItem ? 'menu-item--cocktail' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ '--menu-item-index': index } as CSSProperties}
            type="button"
            onClick={() => {
              if (opensDetailDialog) {
                onSelect(item)
              }
            }}
          >
            <span className="menu-item__media">
              {mediaImageUrl ? (
                <img src={mediaImageUrl} alt="" decoding="async" draggable="false" onError={handleImageFallback} />
              ) : (
                <ImageOff aria-hidden="true" />
              )}
            </span>
            <span className="menu-item__body">
              <span className="menu-item__title-line">
                <strong>{text(item.name, language)}</strong>
                {isCocktailItem && abvText ? (
                  <span className="menu-item__abv">
                    ( {alcoholLabels[language]} : {abvText}% )
                  </span>
                ) : null}
              </span>
              {secondaryText ? <small>{secondaryText}</small> : null}
            </span>
            <span
              className={[
                'menu-item__meta',
                hasPourPrices && usesWhiskyPriceColumns ? 'menu-item__meta--whisky-columns' : '',
                hasPourPrices && !usesWhiskyPriceColumns ? 'menu-item__meta--stacked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.soldOut ? <em>SOLD OUT</em> : null}
              {hasPourPrices && usesWhiskyPriceColumns ? (
                <>
                  <b>{glassPriceText}</b>
                  <b>{bottlePriceText}</b>
                </>
              ) : hasPourPrices ? (
                <>
                  {glassPriceText ? (
                    <b className="menu-item__price-line">
                      <span>G :</span>
                      <span>{glassPriceText}</span>
                    </b>
                  ) : null}
                  {bottlePriceText ? (
                    <b className="menu-item__price-line">
                      <span>B :</span>
                      <span>{bottlePriceText}</span>
                    </b>
                  ) : null}
                </>
              ) : priceText ? (
                <b>{priceText}</b>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
