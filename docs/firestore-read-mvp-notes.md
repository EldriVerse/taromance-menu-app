# Firestore 읽기 MVP 구현 노트

작성일: 2026-05-11

## 목적

포털 진입 시 Firestore 메뉴 데이터를 읽을 수 있는 기반을 추가했다. Firebase 환경값이 없거나, Firestore 읽기 실패, 컬렉션 미구성 상태에서도 앱은 캐시/로컬 데이터로 계속 실행된다.

## 동작 흐름

```text
포털 화면
  -> PRESS TO ENTER
  -> Firebase 환경값 확인
  -> Firestore 읽기 시도
  -> 원격 메뉴 데이터가 있으면 MenuDataBundle 생성 및 캐시 저장
  -> 실패하거나 원격 데이터가 없으면 캐시 또는 로컬 데이터 사용
  -> 메뉴 화면 진입
```

## 환경 변수

`.env.local.example`에 다음 값을 추가했다.

```text
VITE_FIRESTORE_SETTINGS_DOC=meta/menu_app
VITE_FIRESTORE_MENU_COLLECTIONS=live_menu_items,live_cocktails,admin_draft_guide,admin_draft_spirits_public
VITE_FIRESTORE_NOTICE_COLLECTIONS=live_menu_notices
```

실제 어드민 스키마가 확정되면 컬렉션 이름은 `.env.local`에서 조정할 수 있다.

## Firestore 매핑

메뉴 문서는 다음 필드를 우선 인식한다.

- 카테고리: `categoryId`, `category_id`, `category`
- 탭: `tabId`, `tab_id`, `sectionId`
- 종류: `kind`, `menuKind`, `type`
- 이름: `name` 또는 `name_ko`, `name_en`, `name_ja`, `name_zh`
- 요약: `summary`
- 설명: `description`
- 가격: `priceWon`, `price_won`, `price`
- 이미지: `imageUrl`, `image_url`, `thumbnailUrl`
- 잔 이미지: `glassImageUrl`, `glass_image_url`
- 정렬: `sort_code`, `sortCode`
- 품절: `soldOut`, `sold_out`, `isSoldOut`
- 타로 카드 번호: `cardNumber`, `card_number`, `tarotNumber`
- 타로 카드 이미지: `cardImageUrl`, `card_image_url`

컬렉션명에 따라 카테고리 기본값도 추론한다.

- `guide` 포함: Guide
- `cocktail` 포함: Cocktail
- `wine` 또는 `spirit` 포함: Wine & Spirits
- `whisky` 또는 `whiskey` 포함: Whisky

## 검증

- `npm run lint`: PASS
- `npm run build`: PASS
- 브라우저 검증:
  - 포털 상태 정상 표시
  - Firebase 환경값이 없는 상태에서 로컬 fallback 정상
  - 가이드 기본 진입 정상
  - 칵테일 타로 카드 화면 정상
  - 콘솔 에러 0개

## 다음 작업

- 실제 Firebase `.env.local` 값으로 원격 읽기 검증
- 어드민 문서 구조에 맞춰 매퍼 필드 확정
- 원격 `contentVersion` 비교 정책 강화
- 캐시 갱신 성공/실패 상태 UI 정리
- 이미지 URL fallback 처리
