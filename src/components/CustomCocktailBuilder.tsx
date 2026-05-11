import { useState } from 'react'
import type { LanguageCode, LocalizedText } from '../domain/menu'
import { text } from '../domain/formatting'

type CustomFieldId = 'alcohol' | 'sweetness' | 'sourness' | 'texture'
type CustomSelection = Record<CustomFieldId, string>

interface CustomCocktailBuilderProps {
  language: LanguageCode
}

const labels: Record<string, LocalizedText> = {
  alcohol: { ko: '알콜도수', en: 'Alcohol', ja: 'アルコール度数', zh: '酒精度' },
  sweetness: { ko: '단맛', en: 'Sweetness', ja: '甘さ', zh: '甜度' },
  sourness: { ko: '신맛', en: 'Sourness', ja: '酸味', zh: '酸度' },
  texture: { ko: '탄산 / 크림', en: 'Sparkling / Cream', ja: '炭酸 / クリーム', zh: '气泡 / 奶油' },
  light: { ko: '약하게', en: 'Light', ja: '弱め', zh: '低' },
  medium: { ko: '적당히', en: 'Medium', ja: '普通', zh: '适中' },
  strong: { ko: '강하게', en: 'Strong', ja: '強め', zh: '高' },
  none: { ko: '없음', en: 'None', ja: 'なし', zh: '无' },
  sparkling: { ko: '탄산', en: 'Sparkling', ja: '炭酸', zh: '气泡' },
  cream: { ko: '크림', en: 'Cream', ja: 'クリーム', zh: '奶油' },
  flavor: { ko: '선호하는 맛 / 향 (3개 이하)', en: 'Preferred flavor / aroma (up to 3)', ja: '好みの味 / 香り (3個まで)', zh: '偏好的味道 / 香气 (最多3个)' },
}

const fields: Array<{ id: CustomFieldId; options: string[] }> = [
  { id: 'alcohol', options: ['light', 'medium', 'strong'] },
  { id: 'sweetness', options: ['light', 'medium', 'strong'] },
  { id: 'sourness', options: ['light', 'medium', 'strong'] },
  { id: 'texture', options: ['none', 'sparkling', 'cream'] },
]

const flavorOptions: Array<{ id: string; label: LocalizedText }> = [
  { id: 'lemon-lime', label: { ko: '레몬/라임', en: 'Lemon/Lime', ja: 'レモン/ライム', zh: '柠檬/青柠' } },
  { id: 'orange', label: { ko: '오렌지', en: 'Orange', ja: 'オレンジ', zh: '橙子' } },
  { id: 'peach', label: { ko: '복숭아', en: 'Peach', ja: '桃', zh: '桃子' } },
  { id: 'herb', label: { ko: '허브', en: 'Herb', ja: 'ハーブ', zh: '香草' } },
  { id: 'berry', label: { ko: '베리류', en: 'Berry', ja: 'ベリー', zh: '莓果' } },
  { id: 'melon', label: { ko: '멜론', en: 'Melon', ja: 'メロン', zh: '蜜瓜' } },
  { id: 'coconut', label: { ko: '코코넛', en: 'Coconut', ja: 'ココナッツ', zh: '椰子' } },
  { id: 'pineapple', label: { ko: '파인애플', en: 'Pineapple', ja: 'パイナップル', zh: '菠萝' } },
  { id: 'wood-smoke', label: { ko: '목재/훈연', en: 'Wood/Smoke', ja: '木材/スモーク', zh: '木质/烟熏' } },
  { id: 'honey', label: { ko: '꿀', en: 'Honey', ja: '蜂蜜', zh: '蜂蜜' } },
  { id: 'ginger', label: { ko: '생강', en: 'Ginger', ja: '生姜', zh: '生姜' } },
  { id: 'coffee', label: { ko: '커피', en: 'Coffee', ja: 'コーヒー', zh: '咖啡' } },
  { id: 'cinnamon', label: { ko: '시나몬', en: 'Cinnamon', ja: 'シナモン', zh: '肉桂' } },
  { id: 'chocolate', label: { ko: '초콜릿', en: 'Chocolate', ja: 'チョコレート', zh: '巧克力' } },
]

const defaultSelection: CustomSelection = {
  alcohol: 'medium',
  sweetness: 'medium',
  sourness: 'medium',
  texture: 'none',
}

export function CustomCocktailBuilder({ language }: CustomCocktailBuilderProps) {
  const [selection, setSelection] = useState<CustomSelection>(defaultSelection)
  const [flavors, setFlavors] = useState<string[]>([])

  function toggleFlavor(id: string) {
    setFlavors((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }

      return current.length >= 3 ? current : [...current, id]
    })
  }

  return (
    <div className="custom-builder">
      <div className="custom-builder__form">
        {fields.map((field) => (
          <fieldset className="choice-field" key={field.id}>
            <legend>{text(labels[field.id], language)}</legend>
            <div className="choice-row">
              {field.options.map((option) => (
                <label className="choice-pill" key={option}>
                  <input
                    type="radio"
                    name={field.id}
                    checked={selection[field.id] === option}
                    onChange={() => setSelection((current) => ({ ...current, [field.id]: option }))}
                  />
                  <span>{text(labels[option], language)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <fieldset className="choice-field choice-field--wide">
          <legend>{text(labels.flavor, language)}</legend>
          <div className="flavor-grid">
            {flavorOptions.map((option) => (
              <label className="choice-pill flavor-pill" key={option.id}>
                <input
                  type="checkbox"
                  checked={flavors.includes(option.id)}
                  disabled={!flavors.includes(option.id) && flavors.length >= 3}
                  onChange={() => toggleFlavor(option.id)}
                />
                <span>{text(option.label, language)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
