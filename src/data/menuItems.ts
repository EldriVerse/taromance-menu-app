import type { MenuItem } from '../domain/menu'

const glass = (name: string) => `/assets/legacy/glass/${name}.png`

const tarotItems: MenuItem[] = Array.from({ length: 10 }, (_, index) => {
  const number = index + 1

  return {
    id: `tarot-signature-${number}`,
    categoryId: 'cocktail',
    tabId: 'tarot-signature',
    kind: 'tarot-signature',
    sort_code: number * 10,
    priceWon: 16000 + index * 1000,
    soldOut: number === 7,
    assetUrl: '/assets/legacy/iv_popup_background.png',
    subImageUrls: ['/assets/legacy/noimage.png', '/assets/legacy/iv_popup_background.png'],
    glassImageUrl: glass(index % 2 === 0 ? 'martiniglass' : 'highballglass'),
    tarotCard: { number },
    name: {
      ko: `타로 시그니처 ${number}`,
      en: `Tarot Signature ${number}`,
      ja: `タロットシグネチャー ${number}`,
      zh: `塔罗招牌 ${number}`,
    },
    summary: {
      ko: number % 2 === 0 ? '과일 향과 허브가 겹치는 밝은 칵테일' : '묵직한 향신료와 달콤한 여운의 칵테일',
      en: number % 2 === 0 ? 'Bright fruit and herbal notes' : 'Spiced, deep and softly sweet',
      ja: number % 2 === 0 ? '果実とハーブが重なる明るい一杯' : 'スパイスと甘い余韻の一杯',
      zh: number % 2 === 0 ? '果香与草本交叠的清亮风味' : '香料感与甜美余韵的风味',
    },
    description: {
      ko: '타로 카드 선택 경험을 위한 샘플 데이터입니다. 실제 메뉴명, 카드 이미지, 설명은 어드민 데이터로 교체됩니다.',
      en: 'Sample data for the tarot card selection experience. Live admin data will replace this copy.',
      ja: 'タロットカード選択体験用のサンプルデータです。実データに置き換え予定です。',
      zh: '用于塔罗卡选择体验的样例数据，之后会替换为后台数据。',
    },
  }
})

export const menuItems: MenuItem[] = [
  {
    id: 'guide-house',
    categoryId: 'guide',
    tabId: 'guide_rules',
    kind: 'guide',
    sort_code: 10,
    name: { ko: '이용 안내', en: 'House Guide', ja: '利用案内', zh: '使用指南' },
    summary: {
      ko: '타로맨스 메뉴 앱 이용 전 확인 사항',
      en: 'A few notes before using the menu app',
      ja: 'メニューアプリ利用前のご案内',
      zh: '使用菜单应用前的说明',
    },
    description: {
      ko: '메뉴 이미지는 실제 제공 형태와 조금 다를 수 있습니다. 알레르기나 도수 문의는 직원에게 요청해주세요.',
      en: 'Menu images may differ from the served drink. Please ask the staff about allergies or alcohol strength.',
      ja: '画像は実際の提供形態と異なる場合があります。アレルギーや度数はスタッフにお尋ねください。',
      zh: '菜单图片可能与实际出品略有不同。过敏或酒精度请咨询工作人员。',
    },
  },
  {
    id: 'guide-food',
    categoryId: 'guide',
    tabId: 'guide_delivery',
    kind: 'guide',
    sort_code: 20,
    name: { ko: '외부 음식 안내', en: 'Outside Food', ja: '外部飲食物', zh: '外带食物' },
    summary: {
      ko: '매장 정책에 맞춰 외부 음식 이용 가능 여부를 안내합니다.',
      en: 'Outside food availability follows house policy.',
      ja: '外部飲食物は店舗ポリシーに従います。',
      zh: '外带食物请遵循门店政策。',
    },
    description: {
      ko: '외부 음식과 배달 음식 정책은 상황에 따라 바뀔 수 있으므로 직원에게 확인해주세요.',
      en: 'Please confirm with staff because outside and delivery food rules may change.',
      ja: '外部飲食物とデリバリーのルールは変更される場合があります。',
      zh: '外带与外卖规则可能变更，请向工作人员确认。',
    },
  },
  ...tarotItems,
  {
    id: 'whisky-recommend-highball',
    categoryId: 'whisky',
    tabId: 'recommend',
    kind: 'whisky',
    sort_code: 5,
    priceWon: 15000,
    glassImageUrl: glass('highballglass'),
    name: { ko: '오늘의 추천 하이볼', en: 'Today Highball', ja: '本日のハイボール', zh: '今日推荐嗨棒' },
    summary: {
      ko: '재고와 시즌에 따라 바뀌는 추천 한 잔',
      en: 'A seasonal recommendation by stock',
      ja: '在庫と季節で変わるおすすめの一杯',
      zh: '随库存与季节变化的推荐酒款',
    },
    description: {
      ko: '추천 탭의 기본 노출을 확인하기 위한 샘플 메뉴입니다. 실제 추천 메뉴는 어드민 데이터로 관리됩니다.',
      en: 'Sample item for the recommend tab. Live recommendations will be managed by admin data.',
      ja: 'おすすめタブ確認用のサンプルです。実データは管理画面で扱います。',
      zh: '用于推荐标签的样例，实际推荐由后台管理。',
    },
  },
  {
    id: 'whisky-glenfiddich',
    categoryId: 'whisky',
    tabId: 'scotch',
    kind: 'whisky',
    sort_code: 10,
    priceWon: 18000,
    glassImageUrl: glass('ontherockglass'),
    name: { ko: '글렌피딕 12Y', en: 'Glenfiddich 12Y', ja: 'グレンフィディック 12Y', zh: '格兰菲迪 12年' },
    summary: {
      ko: '배, 오크, 부드러운 피니시',
      en: 'Pear, oak and a smooth finish',
      ja: '洋梨、オーク、なめらかな余韻',
      zh: '梨香、橡木与柔和尾韵',
    },
    description: {
      ko: '스카치 입문자에게도 부담이 적은 싱글몰트 위스키입니다.',
      en: 'A single malt Scotch that is friendly for whisky newcomers.',
      ja: 'スコッチ入門にも向いたシングルモルトです。',
      zh: '适合威士忌入门者的单一麦芽。',
    },
  },
  {
    id: 'whisky-buffalo',
    categoryId: 'whisky',
    tabId: 'american',
    kind: 'whisky',
    sort_code: 20,
    priceWon: 16000,
    soldOut: true,
    glassImageUrl: glass('ontherockglass'),
    name: { ko: '버팔로 트레이스', en: 'Buffalo Trace', ja: 'バッファロートレース', zh: '水牛足迹' },
    summary: {
      ko: '바닐라, 캐러멜, 스파이스',
      en: 'Vanilla, caramel and spice',
      ja: 'バニラ、キャラメル、スパイス',
      zh: '香草、焦糖与香料',
    },
    description: {
      ko: '품절 표현 확인을 위한 샘플 메뉴입니다.',
      en: 'Sample item for sold out state.',
      ja: '品切れ状態確認用のサンプルです。',
      zh: '用于售罄状态确认的样例。',
    },
  },
  {
    id: 'wine-house-red',
    categoryId: 'wine-spirits',
    tabId: 'wine',
    kind: 'wine',
    sort_code: 10,
    priceWon: 12000,
    glassImageUrl: glass('cylinderchampagneglass'),
    name: { ko: '하우스 레드 와인', en: 'House Red Wine', ja: 'ハウス赤ワイン', zh: '店选红葡萄酒' },
    summary: {
      ko: '가볍게 마시기 좋은 레드',
      en: 'An easy red wine by the glass',
      ja: '気軽に楽しめる赤ワイン',
      zh: '适合轻松饮用的红葡萄酒',
    },
    description: {
      ko: '와인 및 기타 주류 통합 카테고리의 샘플 메뉴입니다.',
      en: 'Sample item for the unified wine and spirits category.',
      ja: 'ワイン & その他カテゴリのサンプルです。',
      zh: '葡萄酒与其他酒类分类的样例。',
    },
  },
]
