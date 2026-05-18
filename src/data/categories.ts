import type { MenuCategory } from '../domain/menu'

export const categories: MenuCategory[] = [
  {
    id: 'guide',
    imageKey: 'guide',
    label: { ko: '가이드', en: 'Guide', ja: 'ガイド', zh: '指南' },
    subtitle: {
      ko: '이용 안내와 추천',
      en: 'House guide and recommendations',
      ja: '利用案内とおすすめ',
      zh: '使用指南与推荐',
    },
    tabs: [
      {
        id: 'house-guide',
        label: { ko: '이용안내', en: 'Guide', ja: '利用案内', zh: '使用指南' },
        kinds: ['guide'],
      },
      {
        id: 'delivery-recommend',
        label: { ko: '배달추천', en: 'Delivery Picks', ja: 'デリバリー推薦', zh: '外卖推荐' },
        kinds: ['guide'],
      },
    ],
  },
  {
    id: 'cocktail',
    imageKey: 'cocktail',
    label: { ko: '칵테일', en: 'Cocktail', ja: 'カクテル', zh: '鸡尾酒' },
    subtitle: {
      ko: '도수별 칵테일과 커스텀 모드',
      en: 'Cocktails by ABV and custom modes',
      ja: '度数別カクテルとカスタムモード',
      zh: '按酒精度分类的鸡尾酒和定制模式',
    },
    tabs: [
      {
        id: 'cocktail_abv_0',
        label: { ko: '0%', en: '0%', ja: '0%', zh: '0%' },
        kinds: ['cocktail', 'tarot-signature'],
      },
      {
        id: 'cocktail_abv_5_10',
        label: { ko: '5~10%', en: '5~10%', ja: '5~10%', zh: '5~10%' },
        kinds: ['cocktail', 'tarot-signature'],
      },
      {
        id: 'cocktail_abv_10_20',
        label: { ko: '10~20%', en: '10~20%', ja: '10~20%', zh: '10~20%' },
        kinds: ['cocktail', 'tarot-signature'],
      },
      {
        id: 'cocktail_abv_20_40',
        label: { ko: '20~40%', en: '20~40%', ja: '20~40%', zh: '20~40%' },
        kinds: ['cocktail', 'tarot-signature'],
      },
      {
        id: 'cocktail_custom',
        label: { ko: '커스텀 모드', en: 'Custom Mode', ja: 'カスタムモード', zh: '定制模式' },
        kinds: ['custom-cocktail'],
      },
      {
        id: 'cocktail_story',
        label: { ko: '스토리 모드', en: 'Story Mode', ja: 'ストーリーモード', zh: '故事模式' },
        kinds: ['story-cocktail'],
      },
    ],
  },
  {
    id: 'whisky',
    imageKey: 'whisky',
    label: { ko: '위스키', en: 'Whisky', ja: 'ウイスキー', zh: '威士忌' },
    subtitle: {
      ko: '스카치, 아메리칸, 기타 국가',
      en: 'Scotch, American, Other Countries',
      ja: 'スコッチ、アメリカン、その他の国',
      zh: '苏格兰、美国、其他国家',
    },
    tabs: [
      {
        id: 'scotch',
        label: { ko: '스카치', en: 'Scotch', ja: 'スコッチ', zh: '苏格兰' },
        kinds: ['whisky'],
      },
      {
        id: 'american',
        label: { ko: '아메리칸', en: 'American', ja: 'アメリカン', zh: '美国' },
        kinds: ['whisky'],
      },
      {
        id: 'others',
        label: { ko: '기타 국가', en: 'Other Countries', ja: 'その他の国', zh: '其他国家' },
        kinds: ['whisky'],
      },
    ],
  },
  {
    id: 'wine-spirits',
    imageKey: 'wine',
    label: {
      ko: '와인 & 기타 주류',
      en: 'Wine & Spirits',
      ja: 'ワイン & その他のお酒',
      zh: '葡萄酒 & 其他酒类',
    },
    subtitle: {
      ko: '와인과 기타 주류',
      en: 'Wine and other spirits',
      ja: 'ワインとその他のお酒',
      zh: '葡萄酒与其他酒类',
    },
    tabs: [
      {
        id: 'wine',
        label: { ko: '와인', en: 'Wine', ja: 'ワイン', zh: '葡萄酒' },
        kinds: ['wine'],
      },
      {
        id: 'other-spirits',
        label: { ko: '기타 주류', en: 'Other Spirits', ja: 'その他のお酒', zh: '其他酒类' },
        kinds: ['spirit', 'liqueur', 'other'],
      },
    ],
  },
]
