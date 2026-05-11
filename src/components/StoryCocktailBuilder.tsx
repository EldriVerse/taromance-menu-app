import { useMemo, useState, type ChangeEvent } from 'react'
import type { LanguageCode, LocalizedText } from '../domain/menu'
import { text } from '../domain/formatting'

interface StoryCocktailBuilderProps {
  language: LanguageCode
}

const copy: Record<string, LocalizedText> = {
  heading: { ko: 'STORY CUSTOM', en: 'STORY CUSTOM', ja: 'STORY CUSTOM', zh: 'STORY CUSTOM' },
  intro: {
    ko: '색, 분위기, 이미지로 해석하는 스토리 커스텀.',
    en: 'A story custom interpreted through color, mood, and image.',
    ja: '色、雰囲気、イメージから解釈するストーリーカスタム。',
    zh: '用颜色、氛围和图像诠释的故事定制。',
  },
  schedule: {
    ko: '수·목·금·토 17:00-19:00 한정',
    en: 'Wed/Thu/Fri/Sat 17:00-19:00 only',
    ja: '水・木・金・土 17:00-19:00 限定',
    zh: '周三/周四/周五/周六 17:00-19:00 限定',
  },
  price: { ko: '가격 : 25,000원', en: 'Price: KRW 25,000', ja: '価格 : 25,000ウォン', zh: '价格：25,000韩元' },
  buildTime: { ko: '제조 시간 : 1잔 당 약 15분', en: 'Build time: about 15 minutes per glass', ja: '制作時間 : 1杯 約15分', zh: '制作时间：每杯约15分钟' },
  color: { ko: '색상 (필수, 최대 2개)', en: 'Color (required, up to 2)', ja: '色 (必須、最大2個)', zh: '颜色 (必选，最多2个)' },
  mood: { ko: '특징 (필수, 최대 3개)', en: 'Traits (required, up to 3)', ja: '特徴 (必須、最大3個)', zh: '特征 (必选，最多3个)' },
  abv: { ko: '알콜도수 (필수)', en: 'ABV (required)', ja: 'アルコール度数 (必須)', zh: '酒精度 (必选)' },
  keyword: { ko: '요청사항 (선택)', en: 'Request Notes (optional)', ja: 'リクエスト (任意)', zh: '请求事项 (可选)' },
  image: { ko: '참고 이미지 (선택)', en: 'Reference Image (optional)', ja: '参考画像 (任意)', zh: '参考图片 (可选)' },
  summary: { ko: '주문 요약', en: 'Order Summary', ja: '注文内容', zh: '订单摘要' },
  showToStaff: { ko: '바텐더에게 이 화면을 보여주세요.', en: 'Please show this screen to the bartender.', ja: 'この画面をバーテンダーに見せてください。', zh: '请把这个画面给调酒师看。' },
  noKeyword: { ko: '(없음)', en: '(None)', ja: '(なし)', zh: '(无)' },
  noImage: { ko: '(없음)', en: '(None)', ja: '(なし)', zh: '(无)' },
}

const colors = [
  { id: 'red', label: { ko: 'Red', en: 'Red', ja: 'Red', zh: 'Red' }, color: '#b73a34' },
  { id: 'orange', label: { ko: 'Orange', en: 'Orange', ja: 'Orange', zh: 'Orange' }, color: '#d8873d' },
  { id: 'yellow', label: { ko: 'Gold', en: 'Gold', ja: 'Gold', zh: 'Gold' }, color: '#d4a74d' },
  { id: 'green', label: { ko: 'Green', en: 'Green', ja: 'Green', zh: 'Green' }, color: '#4f8a58' },
  { id: 'blue', label: { ko: 'Blue', en: 'Blue', ja: 'Blue', zh: 'Blue' }, color: '#3b6c96' },
  { id: 'purple', label: { ko: 'Purple', en: 'Purple', ja: 'Purple', zh: 'Purple' }, color: '#6b4e91' },
  { id: 'black', label: { ko: 'Black', en: 'Black', ja: 'Black', zh: 'Black' }, color: '#191412' },
  { id: 'white', label: { ko: 'White', en: 'White', ja: 'White', zh: 'White' }, color: '#efe7dc' },
]

const moods: Array<{ id: string; label: LocalizedText }> = [
  { id: 'soft', label: { ko: '부드러운', en: 'Soft', ja: 'やわらかい', zh: '柔和' } },
  { id: 'smoky', label: { ko: '스모키', en: 'Smoky', ja: 'スモーキー', zh: '烟熏' } },
  { id: 'fresh', label: { ko: '상쾌한', en: 'Fresh', ja: '爽やか', zh: '清爽' } },
  { id: 'dark', label: { ko: '어두운', en: 'Dark', ja: '暗い', zh: '深沉' } },
  { id: 'sweet', label: { ko: '달콤한', en: 'Sweet', ja: '甘い', zh: '甜美' } },
  { id: 'mysterious', label: { ko: '신비로운', en: 'Mysterious', ja: '神秘的', zh: '神秘' } },
  { id: 'floral', label: { ko: '꽃향', en: 'Floral', ja: '花の香り', zh: '花香' } },
  { id: 'spiced', label: { ko: '스파이스', en: 'Spiced', ja: 'スパイス', zh: '香料感' } },
]

const abvOptions: Array<{ id: string; label: LocalizedText }> = [
  { id: 'light', label: { ko: '약하게', en: 'Light', ja: '弱め', zh: '低' } },
  { id: 'medium', label: { ko: '적당히', en: 'Medium', ja: '普通', zh: '适中' } },
  { id: 'strong', label: { ko: '강하게', en: 'Strong', ja: '強め', zh: '高' } },
]

function toggleLimited(current: string[], id: string, max: number) {
  if (current.includes(id)) {
    return current.filter((item) => item !== id)
  }

  return current.length >= max ? current : [...current, id]
}

export function StoryCocktailBuilder({ language }: StoryCocktailBuilderProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [abv, setAbv] = useState('medium')
  const [keyword, setKeyword] = useState('')
  const [imageName, setImageName] = useState('')
  const selectedColorLabels = useMemo(
    () => colors.filter((option) => selectedColors.includes(option.id)).map((option) => text(option.label, language)),
    [selectedColors, language],
  )
  const selectedMoodLabels = useMemo(
    () => moods.filter((option) => selectedMoods.includes(option.id)).map((option) => text(option.label, language)),
    [selectedMoods, language],
  )

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageName(event.target.files?.[0]?.name ?? '')
  }

  return (
    <div className="story-builder">
      <section className="story-hero">
        <p>{text(copy.heading, language)}</p>
        <strong>{text(copy.intro, language)}</strong>
        <span>{text(copy.schedule, language)}</span>
        <span>{text(copy.price, language)}</span>
        <span>{text(copy.buildTime, language)}</span>
      </section>
      <section className="story-form">
        <fieldset className="choice-field choice-field--wide">
          <legend>{text(copy.color, language)}</legend>
          <div className="story-color-grid">
            {colors.map((option) => (
              <label className="story-color" key={option.id}>
                <input
                  type="checkbox"
                  checked={selectedColors.includes(option.id)}
                  disabled={!selectedColors.includes(option.id) && selectedColors.length >= 2}
                  onChange={() => setSelectedColors((current) => toggleLimited(current, option.id, 2))}
                />
                <span style={{ background: option.color }} />
                <b>{text(option.label, language)}</b>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="choice-field choice-field--wide">
          <legend>{text(copy.mood, language)}</legend>
          <div className="flavor-grid">
            {moods.map((option) => (
              <label className="choice-pill flavor-pill" key={option.id}>
                <input
                  type="checkbox"
                  checked={selectedMoods.includes(option.id)}
                  disabled={!selectedMoods.includes(option.id) && selectedMoods.length >= 3}
                  onChange={() => setSelectedMoods((current) => toggleLimited(current, option.id, 3))}
                />
                <span>{text(option.label, language)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="choice-field">
          <legend>{text(copy.abv, language)}</legend>
          <div className="choice-row">
            {abvOptions.map((option) => (
              <label className="choice-pill" key={option.id}>
                <input type="radio" name="story-abv" checked={abv === option.id} onChange={() => setAbv(option.id)} />
                <span>{text(option.label, language)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="story-input">
          <span>{text(copy.keyword, language)}</span>
          <input value={keyword} maxLength={50} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <label className="story-input">
          <span>{text(copy.image, language)}</span>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
      </section>
      <aside className="story-summary">
        <strong>{text(copy.summary, language)}</strong>
        <dl>
          <div>
            <dt>{text(copy.color, language)}</dt>
            <dd>{selectedColorLabels.length ? selectedColorLabels.join(' / ') : '-'}</dd>
          </div>
          <div>
            <dt>{text(copy.mood, language)}</dt>
            <dd>{selectedMoodLabels.length ? selectedMoodLabels.join(' / ') : '-'}</dd>
          </div>
          <div>
            <dt>{text(copy.abv, language)}</dt>
            <dd>{text(abvOptions.find((option) => option.id === abv)?.label ?? abvOptions[1].label, language)}</dd>
          </div>
          <div>
            <dt>{text(copy.keyword, language)}</dt>
            <dd>{keyword || text(copy.noKeyword, language)}</dd>
          </div>
          <div>
            <dt>{text(copy.image, language)}</dt>
            <dd>{imageName || text(copy.noImage, language)}</dd>
          </div>
        </dl>
        <p>{text(copy.showToStaff, language)}</p>
      </aside>
    </div>
  )
}
