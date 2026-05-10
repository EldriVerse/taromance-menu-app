import { X } from 'lucide-react'
import type { LanguageCode, MenuItem } from '../domain/menu'
import { formatPriceShort, text } from '../domain/formatting'

interface MenuDetailDialogProps {
  item: MenuItem | null
  language: LanguageCode
  onClose: () => void
}

export function MenuDetailDialog({ item, language, onClose }: MenuDetailDialogProps) {
  if (!item) {
    return null
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section className="menu-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" aria-label="Close" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
        <div className="menu-dialog__visual">
          <img src={item.imageUrl || item.assetUrl || '/assets/legacy/noimage.png'} alt="" />
          {item.glassImageUrl ? <img className="menu-dialog__glass" src={item.glassImageUrl} alt="" /> : null}
        </div>
        <div className="menu-dialog__body">
          <p>{item.kind.replaceAll('-', ' ').toUpperCase()}</p>
          <h2 className={item.soldOut ? 'is-sold-out-text' : ''}>{text(item.name, language)}</h2>
          <strong>{item.soldOut ? 'SOLD OUT' : item.priceWon ? formatPriceShort(item.priceWon) : ''}</strong>
          <span>{text(item.description, language)}</span>
        </div>
      </section>
    </div>
  )
}
