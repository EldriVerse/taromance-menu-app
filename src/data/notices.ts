import type { MenuNotice } from '../domain/menu'

export const notices: MenuNotice[] = [
  {
    id: 'notice-cocktail-1',
    categoryId: 'cocktail',
    tabId: 'tarot-signature',
    sort_code: 10,
    active: true,
    text: {
      ko: '타로 시그니처 칵테일은 카드 선택 후 상세 정보를 확인할 수 있습니다.',
      en: 'Choose a tarot signature card to view its details.',
      ja: 'タロットカードを選ぶと詳細を確認できます。',
      zh: '选择塔罗招牌卡牌后可查看详情。',
    },
  },
  {
    id: 'notice-whisky-1',
    categoryId: 'whisky',
    sort_code: 10,
    active: true,
    text: {
      ko: '위스키 가격은 1잔 기준이며 일부 메뉴는 재고 상황에 따라 변경됩니다.',
      en: 'Whisky prices are per glass and may change by stock.',
      ja: 'ウイスキー価格は一杯基準で在庫により変更されます。',
      zh: '威士忌价格以单杯为准，可能随库存调整。',
    },
  },
  {
    id: 'notice-global-1',
    sort_code: 100,
    active: true,
    text: {
      ko: '품절 메뉴는 붉은 이중선과 SOLD OUT 표기로 안내됩니다.',
      en: 'Sold out items are marked with a red double line and SOLD OUT.',
      ja: '品切れメニューは赤い二重線とSOLD OUTで表示されます。',
      zh: '售罄菜单会显示红色双线与 SOLD OUT 标记。',
    },
  },
]
