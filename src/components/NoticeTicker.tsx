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

  const notice = notices[index % Math.max(notices.length, 1)]
  const fallbackText = {
    ko: '오늘의 안내를 준비 중입니다.',
    en: 'Today\'s notice is being prepared.',
    ja: '本日の案内を準備中です。',
    zh: '今日公告正在准备中。',
  } satisfies Record<LanguageCode, string>

  return (
    <div className="notice-ticker" aria-live="polite">
      <b>NOTICE</b>
      <span>{notice ? text(notice.text, language) : fallbackText[language]}</span>
    </div>
  )
}
