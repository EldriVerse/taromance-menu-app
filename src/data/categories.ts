import type { MenuCategory } from '../domain/menu'

export const categories: MenuCategory[] = [
  {
    id: 'guide',
    imageKey: 'guide',
    label: { ko: '가이드', en: 'Guide', ja: 'ガイド', zh: '指南' },
    subtitle: {
      ko: '이용 안내와 공지',
      en: 'House guide and notices',
      ja: '利用案内とお知らせ',
      zh: '使用指南与公告',
    },
    tabs: [],
  },
  {
    id: 'cocktail',
    imageKey: 'cocktail',
    label: { ko: '칵테일', en: 'Cocktail', ja: 'カクテル', zh: '鸡尾酒' },
    subtitle: {
      ko: '타로 시그니처와 커스텀',
      en: 'Tarot signatures and custom drinks',
      ja: 'タロットシグネチャーとカスタム',
      zh: '塔罗招牌与自定义酒款',
    },
    tabs: [
      {
        id: 'tarot-signature',
        label: {
          ko: '타로 시그니처 칵테일',
          en: 'Tarot Signature',
          ja: 'タロットシグネチャー',
          zh: '塔罗招牌鸡尾酒',
        },
        kinds: ['tarot-signature'],
      },
      {
        id: 'custom-cocktail',
        label: {
          ko: '커스텀 칵테일',
          en: 'Custom Cocktail',
          ja: 'カスタムカクテル',
          zh: '自定义鸡尾酒',
        },
        kinds: ['custom-cocktail'],
      },
    ],
  },
  {
    id: 'whisky',
    imageKey: 'whisky',
    label: { ko: '위스키', en: 'Whisky', ja: 'ウイスキー', zh: '威士忌' },
    subtitle: {
      ko: '추천, 스카치, 아메리칸, 기타',
      en: 'Recommend, Scotch, American, Others',
      ja: 'おすすめ、スコッチ、アメリカン、その他',
      zh: '推荐、苏格兰、美国、其他',
    },
    tabs: [
      {
        id: 'recommend',
        label: { ko: '추천', en: 'Recommend', ja: 'おすすめ', zh: '推荐' },
        kinds: ['whisky'],
      },
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
        label: { ko: '기타', en: 'Others', ja: 'その他', zh: '其他' },
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
      ja: 'ワイン & その他',
      zh: '葡萄酒 & 其他酒类',
    },
    subtitle: {
      ko: '와인, 스피릿, 리큐르',
      en: 'Wine, spirits and liqueurs',
      ja: 'ワイン、スピリッツ、リキュール',
      zh: '葡萄酒、烈酒与利口酒',
    },
    tabs: [
      {
        id: 'all',
        label: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部' },
        kinds: ['wine', 'spirit', 'liqueur', 'other'],
      },
      {
        id: 'wine',
        label: { ko: '와인', en: 'Wine', ja: 'ワイン', zh: '葡萄酒' },
        kinds: ['wine'],
      },
      {
        id: 'spirits',
        label: { ko: '스피릿', en: 'Spirits', ja: 'スピリッツ', zh: '烈酒' },
        kinds: ['spirit'],
      },
      {
        id: 'liqueur',
        label: { ko: '리큐르', en: 'Liqueur', ja: 'リキュール', zh: '利口酒' },
        kinds: ['liqueur'],
      },
    ],
  },
]
