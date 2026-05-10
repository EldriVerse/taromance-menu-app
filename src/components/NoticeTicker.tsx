import { useEffect, useState } from 'react'
import type { LanguageCode, MenuNotice } from '../domain/menu'
import { text } from '../domain/formatting'

interface NoticeTickerProps {
  notices: MenuNotice[]
  language: LanguageCode
}

export function NoticeTicker({ notices, language }: NoticeTickerProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (notices.length < 2) {
      return
    }

    const handle = window.setInterval(() => {
      setIndex((current) => (current + 1) % notices.length)
    }, 4200)

    return () => window.clearInterval(handle)
  }, [notices.length])

  if (!notices.length) {
    return null
  }

  const notice = notices[index % notices.length]

  return (
    <div className="notice-ticker" aria-live="polite">
      <span>{text(notice.text, language)}</span>
    </div>
  )
}
