# 타로맨스 메뉴판 앱 리뉴얼 기획문서

작성일: 2026-05-10  
분석 대상: `C:\Users\steeve\Downloads\BarMenu`  
신규 저장소 예정: `EldriVerse/taromance-menu-app`

## 1. 프로젝트 분석 요약

기존 앱은 Android 네이티브 Java 기반의 매장용 디지털 메뉴판이다. 시작 화면에서 Firebase Storage의 이미지를 로컬로 동기화한 뒤, 메인 화면에서 주류/칵테일/가이드 메뉴를 보여주고, 메뉴 항목을 누르면 상세 팝업을 띄우는 구조다.

현재 앱의 핵심 가치는 다음과 같다.

- 타로맨스 매장 분위기에 맞춘 스크롤/양피지/버튼 이미지 기반 UI
- 위스키, 칵테일, 와인/스피릿, 가이드 메뉴 분류
- Firebase Firestore 기반 메뉴 데이터 조회
- Firebase Storage 기반 메뉴 이미지 동기화
- 한국어/영어 중심의 다국어 표시 구조
- 위스키/칵테일 취향 필터 및 커스텀 오더 보조 기능

다만 현재 구현은 대부분의 책임이 `MainActivity.java` 한 파일에 집중되어 있어 리뉴얼은 “부분 리팩터링”보다 “기능 계승형 신규 설계”가 적합하다.

## 2. 기존 기술 구조

### 플랫폼

- Android 네이티브 앱
- Java
- Gradle Android Plugin
- Firebase Firestore
- Firebase Storage
- Glide
- XML Layout

### 주요 파일

- `MainActivity.java`: 메인 메뉴, 하위 탭, Firestore 조회, 필터, 언어 변경, 화면 전환 대부분 담당
- `TitleActivity.java`: 시작 화면, GIF 배경, Storage 동기화 후 메인 진입
- `PopupActivityInfo.java`: 상세 팝업, Firestore 상세 조회, 이미지 로딩
- `StorageSyncManager.java`: Firebase Storage 폴더 순회 및 로컬 파일 동기화
- `ListViewAdapter*.java`: 메뉴 리스트 렌더링과 상세 팝업 진입
- `ListViewItem*.java`: 주류/칵테일/가이드 리스트 아이템 모델

### 코드 규모

- `MainActivity.java`: 6,035 lines
- `PopupActivityInfo.java`: 874 lines
- `ListViewAdapter.java`: 358 lines
- `ListViewAdapter_Cocktail.java`: 347 lines
- `ListViewAdapter_Guide.java`: 226 lines

## 3. 현재 앱 기능 지도

### 시작 화면

- 홈 GIF 표시
- Firebase Storage 동기화
- 동기화 상태 문구 표시
- 터치 시 메인 화면 진입

현재 동기화 대상 Storage 루트:

- `Spirits`
- `Cocktail`
- `ETC`
- `Guide`

### 메인 메뉴

상위 메뉴:

- Guide
- Whisky
- Cocktail
- Wine & Spirits

하위 메뉴:

- Guide: Guide, Notice, Delivery
- Whisky: Recommend, Scotch, American, Others
- Cocktail: Signature, Classic, Highball, Free Order
- Wine & Spirits: Wine, Spirits, Liqueur

### 리스트 표시

주류 리스트:

- 이름
- 보조 이름/설명
- Glass 가격
- Bottle 가격
- 품절/재고 상태에 따른 배경/색상 처리

칵테일 리스트:

- 잔 이미지
- 이름
- 간단 레시피
- Glass 가격

가이드 리스트:

- 메인 안내 문구
- 서브 안내 문구
- 일부 이벤트 이미지

### 상세 팝업

주류 상세:

- 이미지
- 영어/한국어 이름
- 서브 이름
- ABV
- Region
- Distillery
- 소개/설명
- 가격 관련 필드

칵테일 상세:

- 이미지
- 이름
- ABV
- Base
- Simple Recipe
- Story

### 검색/추천 필터

위스키 필터 태그:

- Honey, Floral, Vanilla, Cinnamon
- Fresh Fruits, Dried Fruits, Citrus Fruits, Sweet Fruits
- Butter, Cream, Caramel, Chocolate
- Nuts, Malt, Wood, Salt
- Spicy, Smoky, Peat, Herb
- Strength, Limited, Old

클래식 칵테일 필터:

- 도수 레벨
- 과일 계열: Citrus, Berry, Soft, Tropical
- 기타 계열: Sparkling, Milk/Cream, Chocolate/Coffee, Herb/Spice

커스텀 오더:

- Alcohol Booze
- Sparkling / Milk
- Sweetness
- Sour
- Flavor tags 최대 3개 선택

## 4. Firestore 데이터 구조 추정

현재 앱에서 사용하는 컬렉션:

- `DB_Guide`
- `DB_Spirits`
- `DB_Cocktail`
- `DB_Setting`

주요 공통 필드:

- `Number`
- `Code`
- `Property_Menu_Main`
- `Property_Menu_Sub`
- `Category`
- `Tag`
- `Name_E`
- `Name_K`
- `Name_J`
- `Name_C`
- `Name_Sub`
- `Price_Glass`
- `Price_Bottle`
- `Stock_Glass`
- `Stock_Bottle`

주류 상세 필드:

- `ABV`
- `Region`
- `Distillery`
- `Country`
- `Aging`
- `Cask`
- `Info_E`, `Info_K`, `Info_J`, `Info_C`
- `Taste_Nose_*`
- `Taste_Plate_*`
- `Taste_Finish_*`
- `Finder_Tag`
- `Flavour_Character`

칵테일 상세 필드:

- `Type`
- `Base`
- `Glass`
- `Ice`
- `Garnish`
- `Simple_Recipe`
- `Story_E`, `Story_K`, `Story_J`, `Story_C`
- `IBA_Recipe`
- `Public_Recipe`
- `Taromance_Recipe`
- `Lv_AlcoholBooze`
- `Lv_Sparkling`
- `Lv_Sweetness`
- `Lv_Sour`
- `Finder_Tag`

설정 필드:

- `SetOnCocktailMenu_Main`
- `SetOnSignature`

## 5. 기존 앱의 문제점

### 구조 문제

- 화면, 데이터 조회, 필터, 언어, 애니메이션, 상태 변경이 `MainActivity.java`에 모두 결합되어 있다.
- Firestore 필드명이 코드 곳곳에 문자열로 직접 박혀 있어 스키마 변경에 취약하다.
- 메뉴 카테고리와 언어 문자열이 하드코딩되어 운영자가 쉽게 수정하기 어렵다.
- 주류/칵테일/가이드가 유사한 구조를 갖지만 모델과 어댑터가 중복되어 있다.
- 화면 상태가 View visibility와 RadioButton checked 상태에 강하게 의존한다.

### UX 문제

- 태블릿 고정 크기 기준 `dp` 값이 많아 기기 대응이 어렵다.
- 한국어 문자열 일부가 인코딩 깨짐 상태로 보인다.
- 하위 메뉴와 필터가 많아 손님이 원하는 메뉴를 빠르게 찾기 어렵다.
- 언어 선택이 앱 설정처럼 분리되어 있고, 손님 입장에서는 즉시 전환성이 약하다.
- 상세 팝업이 500dp x 700dp 고정 크기라 작은/큰 화면에서 어색할 수 있다.

### 운영 문제

- Firebase 데이터 스키마 변경 시 앱 코드 수정 영향이 크다.
- 이미지 동기화 완료 판단이 여러 루트 폴더 호출과 비동기 카운터에 걸쳐 있어 안정성 검토가 필요하다.
- 재고/품절/이벤트 가격/노출 여부 같은 운영 상태가 메뉴 데이터와 UI 로직에 섞여 있다.

## 6. 리뉴얼 목표

새 앱은 기존 기능을 그대로 옮기는 것이 아니라, “매장 손님이 메뉴를 고르고 바텐더에게 자연스럽게 주문할 수 있게 돕는 디지털 메뉴 경험”으로 재설계한다.

핵심 목표:

- 손님이 3초 안에 큰 카테고리를 이해한다.
- 메뉴 상세를 열기 전에도 이름, 가격, 맛 방향, 도수, 추천 여부를 파악한다.
- 한국어/영어/일본어/중국어 전환이 즉시 가능하다.
- 운영자는 메뉴/가격/품절/추천/이미지를 데이터로 관리한다.
- 네트워크가 불안정해도 매장에서 메뉴판이 동작한다.
- 향후 관리자 페이지, QR 웹 메뉴, 태블릿 키오스크로 확장 가능하게 만든다.

## 6.1 브랜드/UX 컨셉

기존 앱의 강점은 “게임에 접속하듯 메뉴판에 들어가고, 매직 스크롤을 펼쳐 메뉴를 보는 경험”이다. 리뉴얼에서는 이 세계관을 유지하되, 메뉴 수와 기능 증가로 인한 복잡도는 정보 구조와 화면 역할 분리로 해결한다.

브랜드 컨셉:

- 타로맨스 메뉴판은 단순한 가격표가 아니라, 손님이 타로맨스의 세계에 접속해 자신의 취향에 맞는 술을 발견하는 인터랙티브 매직 스크롤이다.

UX 원칙:

- 입장 경험은 몰입감 있게 만든다.
- 메뉴 탐색은 빠르고 명확하게 만든다.
- 추천 기능은 마법적 분위기를 갖되 결과는 실용적이어야 한다.
- 장식은 분위기를 만들되 정보보다 앞서지 않는다.
- 손님은 모든 메뉴의 상세 정보에 2터치 안에 도달할 수 있어야 한다.

화면 역할:

- Portal: 시작/입장 화면. 게임 접속 감성을 가장 강하게 표현한다.
- Grimoire: 실제 메뉴판. 매직 스크롤/마법서 분위기를 유지하되 탐색성과 가독성을 우선한다.
- Oracle Finder: 추천/검색/취향 필터. 손님의 선택 부담을 줄이는 보조 기능이다.
- Custom Ritual: 커스텀 오더 보조 화면. 선택 결과를 바텐더에게 보여줄 수 있는 요약 카드로 마무리한다.

반응형 UI 컨셉:

- Landscape: 좌측 Category Rail + 우측 Grimoire Scroll.
- Portrait: 중앙 Grimoire Scroll + 하단 Category Dock.
- 카테고리 위치만 전환하고 현재 선택된 메뉴/탭/필터 상태는 유지한다.
- 가로 모드는 RPG 사이드 메뉴처럼, 세로 모드는 하단 퀵슬롯처럼 느껴지게 한다.
- 하위 탭은 항상 Grimoire Scroll 상단에 위치한다.
- 필터, 추천, 언어, 설정은 카테고리 버튼과 섞지 않는다.
- 하위 탭 아래 또는 스크롤 상단에는 해당 메뉴 영역의 한줄 안내문을 표시한다.

## 7. 신규 앱 권장 방향

### 권장 형태

1차 리뉴얼은 웹 앱 기반을 추천한다.

- React + Vite + TypeScript
- 태블릿 브라우저/Android WebView/PWA 대응
- Firebase, Supabase, API 서버 등으로 교체 가능한 데이터 계층
- 메뉴 데이터는 초기에는 로컬 JSON/TS 파일로 시작 가능
- 추후 관리자 페이지를 붙이기 쉬움

네이티브 Android를 다시 선택할 경우에는 Kotlin + Jetpack Compose가 적합하다. 하지만 현재 목표가 “스파게티 탈출 + 빠른 리뉴얼 + 운영 편의성”이라면 웹 앱이 더 가볍고 유연하다.

### 화면 컨셉

- 첫 화면은 랜딩이 아니라 바로 메뉴판
- 가로 화면에서는 좌측 Category Rail, 세로 화면에서는 하단 Category Dock 사용
- 중앙에는 메뉴 리스트
- 우측 또는 팝업에는 상세 정보
- 하단에는 언어 전환, 검색/필터, 홈/추천 진입

매장용 태블릿 기준:

- Lenovo Xiaoxin Pad 2024 12.7인치 제품을 1차 기준 디바이스로 사용
- 12.7인치, 16:10 화면비, 3K급 해상도 기준으로 UI 검증
- 가로 모드 우선이지만 세로 모드도 정식 지원
- 터치 타겟 44px 이상
- 가격과 이름 가독성 우선
- 과한 애니메이션보다 빠른 전환
- 어두운 바 환경에서도 읽히는 대비

### 기준 디바이스

1차 매장 운영 디바이스:

- 제품: Lenovo Xiaoxin Pad 2024 12.7인치 계열
- 화면 크기: 12.7인치
- 화면비: 16:10
- 해상도 기준: 2944 x 1840
- 운영 방향: 태블릿 앱/PWA/WebView 형태

디자인 기준:

- Landscape는 16:10 가로 화면을 기준으로 좌측 Category Rail과 우측 Grimoire Scroll을 배치한다.
- Portrait는 16:10 세로 화면을 기준으로 하단 Category Dock과 중앙 Grimoire Scroll을 배치한다.
- UI는 고해상도 화면에서 지나치게 작아지지 않도록 CSS 픽셀 기준의 터치/글자 크기를 우선한다.
- 카드, 버튼, 탭, 필터칩은 손가락 터치 기준 최소 44px 이상의 조작 영역을 유지한다.
- 실제 검증은 브라우저 viewport뿐 아니라 실기기에서 최종 확인한다.

권장 검증 viewport:

- Landscape: `1472 x 920` CSS px 근처
- Portrait: `920 x 1472` CSS px 근처
- 보조 검증: `1280 x 800`, `1024 x 768`

정확한 CSS viewport는 Android 브라우저/WebView의 device pixel ratio, 주소창/시스템바/전체화면 여부에 따라 달라질 수 있으므로, 개발 중 실기기에서 `window.innerWidth`, `window.innerHeight`, `devicePixelRatio`를 확인해 최종 보정한다.

### 데이터/이미지 연동 방향

현재 Firebase 계정, 프로젝트, Firestore 구조는 리뉴얼 과정에서 바뀔 예정이다. 또한 이미지는 기존 Firebase Storage에서 불러오는 방식이 아니라 별도 이미지 링크 또는 CDN URL에서 불러오는 방향이다.

따라서 새 앱은 Firebase를 직접 전제하지 않고, 데이터 접근 계층을 분리한다.

```text
UI Components
  ↓
Domain Logic
  ↓
MenuRepository
  ↓
LocalMenuRepository / FirebaseMenuRepository / ApiMenuRepository
```

이미지 역시 `storagePath` 중심이 아니라 `image.url` 중심으로 설계한다. Firebase Storage를 쓰지 않더라도, Cloudflare R2, S3, 이미지 CDN, Notion/Sheets 기반 이미지 링크 등으로 쉽게 바꿀 수 있어야 한다.

이미지 요구사항:

- 메뉴 데이터에는 직접 접근 가능한 `image.url`을 저장한다.
- 이미지가 없거나 로딩 실패 시 fallback 이미지를 보여준다.
- 리스트용 썸네일과 상세용 이미지를 분리할 수 있게 한다.
- 외부 이미지 링크가 느릴 수 있으므로 브라우저 캐시/PWA 캐시 전략을 고려한다.
- 이미지 URL은 앱 코드에 하드코딩하지 않는다.

타로 카드 이미지 요구사항:

- Tarot Signature Cocktail 카드 이미지는 7:12 비율을 기준으로 제작/표시한다.
- UI는 7:12 비율의 카드가 잘리지 않도록 `aspect-ratio: 7 / 12` 기준으로 설계한다.
- 카드 이미지가 로딩되지 않을 경우 같은 7:12 비율의 fallback 카드를 표시한다.
- 카드 내부 텍스트가 이미지에 포함되는 경우, 앱 UI의 이름/가격/요약 정보와 중복되어도 읽기 흐름이 깨지지 않게 한다.

### Tarot Signature Cocktail 화면

Tarot Signature Cocktail은 일반 리스트가 아니라 카드 선택창 방식으로 제공한다. 현재 시그니처 칵테일이 10종으로 구성되어 있으므로, 손님이 메뉴를 고르는 행위를 “타로 카드를 선택하는 경험”으로 만든다.

요구사항:

- 10종의 타로 시그니처 칵테일을 카드 이미지 기반 캐러셀로 탐색한다.
- 카드 이미지는 7:12 비율을 기준으로 표시한다.
- 중앙에는 선택된 카드 1장을 크게 보여준다.
- 좌우에 이전/다음 카드가 일부 보이도록 배치해 스와이프 가능성을 암시한다.
- 좌우 버튼과 터치 스와이프를 모두 지원한다.
- 카드를 누르면 상세 정보 모달이 열린다.
- 카드 아래에는 이름, 한 줄 설명, 가격, 베이스/맛 태그/도수 요약을 표시한다.
- 전체 10종 위치를 알 수 있도록 인디케이터 또는 미니 카드 스트립을 제공한다.

예시 구조:

```text
Tarot Signature Cocktail

[ < ]     [ Previous ] [ Selected Tarot Card ] [ Next ]     [ > ]

The Magician
Gin base · Citrus · 12%
19,000

[01] [02] [03] [04] [05] [06] [07] [08] [09] [10]
```

적용 범위:

- 이 카드 선택 UI는 Tarot Signature Cocktail 전용으로 사용한다.
- Whisky, Guide, Wine & Other Spirits는 일반 리스트/카드 목록 구조를 사용한다.
- Custom Cocktail은 향후 구조 변경 예정이므로 별도 화면으로 분리한다.

## 8. 신규 정보 구조

상위 카테고리:

- Guide
- Whisky
- Cocktail
- Wine & Other Spirits

추천 진입:

- Today Recommendation
- For First Visit
- Sweet & Easy
- Strong & Smoky
- Signature

하위 카테고리:

- Guide: 하위 탭을 만들지 않고 안내 카드 방식으로 구성
- Whisky: Recommend, Scotch, American, Others
- Cocktail: Tarot Signature Cocktail, Custom Cocktail
- Wine & Other Spirits: 하위 탭을 만들지 않고 All, Wine, Spirits, Liqueur, Other 필터칩으로 구성

카테고리 운영 기준:

- Guide는 메뉴 탐색보다 안내서 성격이 강하므로 상위 카테고리로만 유지하고 내부는 카드형 목록으로 구성한다.
- Whisky는 메뉴 수와 목적성이 강하므로 독립 상위 카테고리와 하위 탭을 유지한다.
- Cocktail은 복잡도를 줄이기 위해 Tarot Signature Cocktail, Custom Cocktail 2개 탭만 사용한다.
- Wine & Other Spirits는 1차 리뉴얼에서는 통합하고 내부 필터칩/섹션 헤더로 구분한다.
- Wine 메뉴가 15개 이상이거나 와인 주문 비중이 높아지면 Wine 독립 탭 승격을 검토한다.
- Whisky의 특정 국가/스타일 메뉴가 10~15개 이상으로 늘어나면 Japanese, Irish 등 별도 탭 승격을 검토한다.

공통 필터:

- 가격대
- 도수
- 품절 제외
- 추천만 보기
- 태그

위스키 전용 필터:

- 산지/지역
- 향미 태그
- 바디감
- 스모키/피트
- 한정/올드/고도수

위스키 하위 탭:

- Recommend: 입문 추천, 오늘의 추천, 매장 추천을 묶어 보여준다.
- Scotch: 스카치 위스키.
- American: 버번/라이 등 아메리칸 위스키.
- Others: Japanese, Irish, Taiwanese, Indian, Korean 등 기타 국가/스타일.

위스키 추천 칩:

- 처음 마시는 위스키
- 달콤한 위스키
- 스모키한 위스키
- 강한 위스키
- 오늘의 추천

칵테일 전용 필터:

- 베이스
- 당도
- 산미
- 탄산/밀크
- 과일/허브/커피/스파이스 계열

Guide 카드:

- 이용 안내
- 공지사항
- 외부 음식 / 배달 안내

Wine & Other Spirits 필터칩:

- All
- Wine
- Spirits
- Liqueur
- Other

## 9. 신규 데이터 모델 제안

### MenuItem

```ts
type MenuItem = {
  id: string;
  code?: string;
  order: number;
  sort_code: number;
  status: "active" | "hidden" | "sold_out";
  category: "guide" | "whisky" | "cocktail" | "wine_other_spirits";
  subcategory: string;
  names: {
    ko: string;
    en: string;
    ja?: string;
    zh?: string;
    subtitle?: string;
  };
  prices: {
    glass?: number;
    bottle?: number;
    customLabel?: string;
    displayMode?: "short_thousand" | "full";
  };
  image?: {
    url: string;
    thumbnailUrl?: string;
    alt: string;
    dominantColor?: string;
  };
  tags: string[];
  recommendation?: {
    featured: boolean;
    label?: string;
  };
};
```

가격 표시는 기본적으로 `short_thousand`를 사용한다. 예를 들어 `16000`은 리스트에서 `16`으로 표시하고, 상세/주문 확인처럼 금액 오해가 생기면 안 되는 화면에서는 `16,000원` 전체 표기를 사용할 수 있다.

### SpiritDetail

```ts
type SpiritDetail = {
  menuItemId: string;
  abv?: number;
  country?: string;
  region?: string;
  distillery?: string;
  aging?: string;
  cask?: string;
  tastingNotes?: {
    nose?: LocalizedText;
    palate?: LocalizedText;
    finish?: LocalizedText;
  };
  description: LocalizedText;
  flavorProfile?: {
    body?: number;
    richness?: number;
    smoke?: number;
  };
};
```

### CocktailDetail

```ts
type CocktailDetail = {
  menuItemId: string;
  type?: "tarot_signature" | "custom";
  base?: string;
  glass?: string;
  abv?: number;
  simpleRecipe?: string;
  story?: LocalizedText;
  tasteLevels?: {
    alcohol?: number;
    sweetness?: number;
    sour?: number;
    sparkling?: number;
  };
};
```

### AppSettings

```ts
type AppSettings = {
  features: {
    customCocktail: {
      enabled: boolean;
      label?: LocalizedText;
    };
  };
  categoryPolicies: {
    guideMode: "cards";
    whiskyTabs: Array<"recommend" | "scotch" | "american" | "others">;
    cocktailTabs: Array<"tarot_signature" | "custom">;
    wineOtherMode: "filter_chips";
  };
  defaultLanguage: "ko" | "en" | "ja" | "zh";
};
```

`customCocktail.enabled`가 `false`이면 메뉴판의 Custom Cocktail 탭/버튼은 렌더링하지 않는다. 이 값은 향후 어드민 페이지에서 ON/OFF 할 수 있어야 하며, MVP 단계에서는 로컬 설정 데이터로 먼저 구현한다.

## 9.1 어드민 연동 정책

어드민 페이지는 본 메뉴판 앱 저장소의 개발 범위에 포함하지 않는다. 어드민은 다른 PC/별도 프로젝트에서 개발 중이며, 본 앱은 추후 해당 어드민/백엔드가 제공하는 메뉴 데이터와 설정값을 소비하는 클라이언트로 동작한다.

원칙:

- 본 저장소는 타로맨스 메뉴판 클라이언트 앱만 담당한다.
- 어드민 페이지 구현 코드는 본 저장소에 포함하지 않는다.
- 메뉴판 앱과 어드민은 `MenuItem`, `SpiritDetail`, `CocktailDetail`, `AppSettings` 데이터 계약을 공유한다.
- `Custom Cocktail` 노출 ON/OFF, 메뉴 노출 상태, 품절 상태, 가격, 추천 여부, 이미지 URL은 어드민에서 관리될 수 있다.
- 초기 개발은 로컬 샘플 데이터와 로컬 설정값으로 진행한다.
- 추후 원격 데이터 소스가 확정되면 `MenuRepository` 구현체를 추가해 어드민/백엔드 데이터와 연결한다.
- Firebase 계정, API 키, 환경변수, 백엔드 인증 정보는 저장소에 커밋하지 않는다.

Git 관리:

- 주요 기획 변경, 데이터 모델 변경, UI 구조 변경 단위로 커밋한다.
- 어드민 연동 전까지는 로컬 샘플 데이터와 인터페이스를 기준으로 커밋한다.
- 외부 어드민과 맞춰야 하는 데이터 계약 변경은 커밋 메시지에 명확히 남긴다.
- 환경변수, API 키, Firebase 설정 파일, 서비스 계정 파일은 `.gitignore`에 포함한다.

확인된 Firebase 프로젝트:

- Firebase project name: `taromance-admin-mvp`
- Firebase project id: `taromance-admin-mvp`
- Firebase project number: `1086777507539`
- Web app nickname: `taromance-admin-web`
- Web app id: `1:1086777507539:web:14d72bf586270eb21b1e26`
- Firestore database: `(default)`
- Firestore region: `asia-northeast3`
- Plan: Spark

확인된 Firestore 컬렉션:

- `admin_draft_cocktails`
- `admin_draft_guide`
- `admin_draft_menu_board_items`
- `admin_draft_menu_board_tabs`
- `admin_draft_spirits`
- `admin_draft_spirits_private`
- `admin_draft_spirits_public`
- `audit_logs`
- `live_cocktails`
- `meta`

Firebase 웹 SDK 설정값은 앱 코드에 직접 작성하지 않고 `.env.local`로 주입한다. `apiKey`, `authDomain`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId` 등 실제 연결값은 커밋하지 않는다.

### LocalizedText

```ts
type LocalizedText = {
  ko: string;
  en: string;
  ja?: string;
  zh?: string;
};
```

## 10. MVP 범위

MVP는 “매장 태블릿에서 실제 메뉴판으로 시연 가능한 앱”을 목표로 한다. 단, 어드민 페이지 구현은 본 저장소의 MVP 범위에 포함하지 않는다. 초기 개발은 로컬 샘플 데이터로 진행하고, 원격 Firestore 연동은 구조가 안정된 뒤 붙인다.

### MVP-0: 프로젝트 기반

목표:

- 앱 개발을 시작할 수 있는 최소 기반을 만든다.

포함:

- React + Vite + TypeScript 프로젝트 생성
- GitHub 저장소 연결
- 기본 라우트/앱 셸 구성
- 전역 스타일 토큰 초안
- `.env.local` 사용 규칙과 `.gitignore` 정리
- 로컬 샘플 데이터 위치 생성

제외:

- Firebase 실연동
- 실제 메뉴 전체 입력
- 카드 캐러셀 고급 애니메이션

완료 기준:

- 로컬 개발 서버가 실행된다.
- 첫 화면이 빈 페이지가 아니라 앱 프레임을 표시한다.
- Git 커밋/푸시가 가능하다.

### MVP-1: 메뉴판 앱 셸

목표:

- 기존 UI 구조를 계승한 가로/세로 반응형 메뉴판 뼈대를 만든다.

포함:

- Portal 시작 화면
- Grimoire 메뉴판 화면
- Landscape: 좌측 Category Rail + 우측 Grimoire Scroll
- Portrait: 중앙 Grimoire Scroll + 하단 Category Dock
- 상위 카테고리: Guide, Whisky, Cocktail, Wine & Other Spirits
- 현재 선택 카테고리 상태 유지
- 기본 배경/스크롤 컨셉 스타일

제외:

- 실제 상세 데이터 표시
- Firebase 데이터 로딩
- 복잡한 필터

완료 기준:

- 가로/세로 화면 전환 시 카테고리 위치가 바뀐다.
- 선택한 카테고리가 유지된다.
- 태블릿 크기에서 주요 UI가 겹치지 않는다.
- Lenovo Xiaoxin Pad 2024 12.7인치 실기기 또는 동등 viewport에서 레이아웃이 깨지지 않는다.

### MVP-2: 로컬 데이터와 기본 메뉴 탐색

목표:

- 로컬 샘플 데이터만으로 주요 메뉴 탐색이 가능하게 한다.

포함:

- `MenuItem`, `SpiritDetail`, `CocktailDetail`, `AppSettings` 타입 정의
- `MenuNotice` 타입 정의
- `LocalMenuRepository`
- `sort_code` 기준 정렬
- 천 원 단위 축약 가격 표시
- Guide 카드: 이용 안내, 공지사항, 외부 음식/배달 안내
- Whisky 탭: Recommend, Scotch, American, Others
- Wine & Other Spirits 필터칩: All, Wine, Spirits, Liqueur, Other
- 일반 메뉴 리스트/카드
- 카테고리/세부탭별 안내문 티커
- 품절/숨김 상태 반영
- 추천 배지 표시

제외:

- Tarot Signature 카드 캐러셀
- 원격 데이터 연동
- 고급 검색/필터

완료 기준:

- 로컬 샘플 데이터 수정만으로 메뉴 목록이 바뀐다.
- 로컬 샘플 안내문 수정만으로 상단 안내문이 바뀐다.
- 숨김 메뉴는 화면에 보이지 않는다.
- 품절 메뉴는 시각적으로 구분된다.
- 품절 메뉴에는 붉은색 2줄 취소선과 SOLD OUT 표시가 적용된다.
- 가격 `16000`은 리스트에서 `16`으로 표시된다.

### MVP-3: Tarot Signature Cocktail 경험

목표:

- 앱의 대표 경험인 타로 카드 선택 UI를 구현한다.

포함:

- Cocktail 탭: Tarot Signature Cocktail, Custom Cocktail
- Tarot Signature Cocktail 10종 샘플 데이터
- 7:12 비율 카드 이미지 컨테이너
- 좌우 버튼 이동
- 터치 스와이프 이동
- 중앙 선택 카드 + 좌우 카드 일부 노출
- 현재 위치 인디케이터 또는 미니 카드 스트립
- 카드 하단 이름, 가격, 베이스/맛 태그/도수 요약
- 카드 선택 시 상세 모달 열기
- 카드 이미지 fallback

Custom Cocktail 처리:

- `AppSettings.features.customCocktail.enabled`가 `false`이면 Custom Cocktail 탭/버튼을 숨긴다.
- `true`이면 임시 안내 화면을 표시한다.
- 실제 커스텀 칵테일 설계는 후속 단계에서 다룬다.

제외:

- 최종 타로 카드 일러스트 완성본
- 커스텀 칵테일 주문 플로우
- 3D/고급 카드 전환 효과

완료 기준:

- 10종 카드를 좌우 버튼과 스와이프로 탐색할 수 있다.
- 카드 비율이 모든 화면에서 7:12로 유지된다.
- 카드 탭 시 해당 칵테일 상세 모달이 열린다.
- Landscape와 Portrait 모두에서 카드가 Category Rail/Dock과 겹치지 않는다.

### MVP-4: 상세 보기와 4개국어

목표:

- 손님이 메뉴를 이해하고 주문할 수 있을 만큼 상세 정보와 언어 전환을 완성한다.

포함:

- 메뉴 상세 모달
- 주류 상세: 이미지, 이름, 가격, ABV, 지역/증류소, 설명
- 칵테일 상세: 이미지, 이름, 가격, ABV, 베이스, 레시피/스토리, 맛 태그
- Guide 상세 패널
- 한국어/영어/일본어/중국어 전환
- 언어 변경 시 현재 화면/선택 상태 유지
- 번역 누락 시 `ko` fallback
- 외부 이미지 URL 로딩
- 이미지 로딩 실패 fallback
- 메뉴/타로카드/좌석배치 fallback 이미지 정책

제외:

- 번역 품질 최종 검수
- 관리자 번역 편집 기능
- 오프라인 이미지 캐시 고도화

완료 기준:

- 모든 주요 화면에서 4개국어 전환이 가능하다.
- 상세 모달의 필수 정보가 언어별로 표시된다.
- 이미지 실패 상황에서도 레이아웃이 깨지지 않는다.

### MVP-5: Firebase 읽기 연동 준비

목표:

- 외부 어드민/Firestore와 연결 가능한 구조를 만든다.

포함:

- `FirebaseMenuRepository` 초안
- `.env.local` 기반 Firebase config 로딩
- Firestore 읽기 전용 연결
- 확인된 컬렉션 기준 데이터 매핑 초안
- 안내문 데이터 읽기 구조
- 로컬 데이터 fallback
- Portal 단계 데이터 변경 확인
- 변경분이 있을 때만 로컬 캐시 갱신
- 로딩/오류/빈 상태 UI

확인된 Firestore 후보:

- `admin_draft_menu_board_items`
- `admin_draft_menu_board_tabs`
- `admin_draft_cocktails`
- `admin_draft_spirits`
- `admin_draft_guide`
- `live_cocktails`
- `meta`

제외:

- 어드민 쓰기 기능
- 인증/권한 관리 UI
- 데이터 마이그레이션 자동화
- 운영 배포 자동화

완료 기준:

- `.env.local`이 있으면 Firestore에서 읽기를 시도한다.
- Firestore 연결 실패 시 로컬 샘플 데이터로 앱이 동작한다.
- Firebase 설정값은 Git에 커밋되지 않는다.
- 메뉴 화면 사용 중에는 Firestore 변경이 실시간으로 끼어들지 않는다.

### Post-MVP

- 이미지 CDN/외부 URL 캐시 전략
- 위스키 고급 필터
- 칵테일 고급 필터
- Custom Cocktail 주문 보조 화면
- 메뉴 주문 요청 기능
- QR 웹 메뉴 공개 버전
- 매장 태블릿 전용 키오스크 모드
- 메뉴 조회 로그/인기 메뉴 분석
- 계절 메뉴/이벤트 메뉴 예약 노출

### Future: 주문 요청 플로우

이 기능은 MVP에는 포함하지 않는다. 향후 메뉴판 앱이 단순 열람을 넘어, 손님이 메뉴를 선택하고 자신의 좌석을 지정해 주문 요청을 보낼 수 있는 구조로 확장한다.

핵심 방향:

- 장바구니형 주문이 아니라 메뉴 상세에서 바로 “주문하기”를 누르는 단일 메뉴 주문 흐름으로 설계한다.
- 손님이 주문하기를 누르면 좌석 선택 화면을 띄운다.
- 좌석 선택은 텍스트 목록이 아니라 매장 좌석 배치 이미지 위에서 자신의 좌석 위치를 선택하는 방식으로 제공한다.
- 좌석 선택 후 주문 요청이 완료된다.
- 주문 요청은 DB에 저장된다.
- 주문 요청은 Discord Bot 또는 Discord Webhook을 통해 직원 채널로 전달된다.

예상 흐름:

```text
메뉴 상세 보기
  → 주문하기
  → 좌석 배치 이미지 표시
  → 좌석 위치 선택
  → 주문 확인
  → DB 저장
  → Discord 알림 전송
```

주문 데이터 초안:

```ts
type OrderRequest = {
  id: string;
  menuItemId: string;
  menuNameSnapshot: LocalizedText;
  priceSnapshot?: number;
  seatId: string;
  seatLabel?: string;
  status: "requested" | "accepted" | "rejected" | "served" | "cancelled";
  requestedAt: string;
  source: "tablet";
  notes?: string;
};
```

좌석 데이터 초안:

```ts
type SeatMap = {
  id: string;
  imageUrl: string;
  seats: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    radius?: number;
    enabled: boolean;
  }>;
};
```

고려사항:

- 좌석 이미지 비율과 좌표계는 고정되어야 한다.
- 태블릿 가로/세로에서 좌석 선택 영역이 정확히 맞아야 한다.
- 중복 주문 방지를 위해 주문 완료 후 짧은 확인/잠금 상태가 필요하다.
- 직원이 주문을 확인할 수 있도록 Discord 메시지에는 메뉴명, 가격, 좌석명, 요청 시간이 포함되어야 한다.
- Discord Bot/Webhook 토큰은 클라이언트 앱에 포함하지 않는다.
- 주문 전송은 클라이언트에서 Discord로 직접 보내지 않고, 서버/API/Cloud Function을 통해 처리한다.
- 이 기능을 시작하기 전, 직원 운영 흐름과 주문 취소/품절 대응 정책을 먼저 정해야 한다.

## 11. 화면 요구사항

### 운영 모드

매장 태블릿은 손님용 메뉴판 전용 기기로 운영한다.

원칙:

- 앱은 전체화면으로 실행한다.
- 화면 꺼짐 방지가 되어야 한다.
- 손님이 뒤로가기, 새로고침, 브라우저 주소창 조작을 할 수 없어야 한다.
- 전원 버튼 등으로 화면이 강제로 꺼졌다가 다시 켜진 경우에는 초기 Portal 화면으로 돌아간다.
- 앱 재시작 시에도 초기 Portal 화면에서 데이터 업데이트 확인 후 메뉴판으로 진입한다.
- 운영 중 데이터 동기화는 메뉴 화면에서 실시간으로 강제 반영하지 않는다.

초기화/동기화 흐름:

```text
앱 실행 또는 화면 강제 복귀
  → Portal 초기 화면
  → 로컬 데이터 즉시 준비
  → Firebase/원격 데이터 변경 확인
  → 변경분이 있으면 로컬 캐시 업데이트
  → 메뉴판 진입
```

뒤로가기/새로고침 정책:

- Android 뒤로가기 버튼은 메뉴판 내 탐색에 사용하지 않는다.
- 뒤로가기 입력이 들어오면 현재 모달이 열려 있을 때만 모달 닫기로 처리한다.
- 모달이 없으면 뒤로가기 입력은 무시하거나 Portal로 돌아가지 않게 막는다.
- 새로고침은 사용자 조작으로 노출하지 않는다.
- 개발/운영자용 강제 새로고침은 숨겨진 운영 액션으로만 제공할 수 있다.

화면 꺼짐 방지:

- PWA/WebView/Android 래퍼 단계에서 Wake Lock 또는 Android keep screen on 옵션을 적용한다.
- 브라우저/PWA 환경에서 Wake Lock API를 사용할 수 없으면 Android WebView 래퍼에서 처리한다.

### 메뉴판 메인

- 앱 실행 즉시 메뉴판 표시
- 브랜드 로고와 현재 언어 상태 노출
- 상위 카테고리는 항상 접근 가능
- Landscape에서는 카테고리를 좌측 Category Rail에 표시
- Portrait에서는 카테고리를 하단 Category Dock에 표시
- 하위 카테고리는 상위 카테고리에 따라 즉시 변경
- Guide는 하위 탭 대신 안내 카드 목록을 표시
- Whisky는 Recommend, Scotch, American, Others 탭을 표시
- Cocktail 하위 탭은 Tarot Signature Cocktail과 Custom Cocktail만 사용
- Custom Cocktail은 어드민 설정값이 OFF이면 버튼 자체를 숨김
- Wine & Other Spirits는 하위 탭 대신 필터칩과 섹션 헤더를 표시
- 세부탭/필터칩 아래에는 해당 영역의 안내문 티커를 표시
- 리스트는 빠르게 스캔 가능해야 함

### 안내문 티커

각 메뉴 카테고리 또는 세부탭 화면의 스크롤 상단 근처에 한줄 안내문을 표시한다. 안내문은 DB에서 리스트 형태로 받아오며, 여러 문구가 있을 경우 천천히 바뀌거나 흐르는 방식으로 노출한다.

역할:

- 메뉴 선택 전에 알아야 할 짧은 안내를 제공한다.
- 카테고리별 주문 팁, 가격 안내, 품절/추천 안내, 외부 음식 안내 등을 전달한다.
- 긴 공지사항이 아니라 한 줄로 읽히는 짧은 문구를 우선한다.

표시 위치:

- Landscape: 우측 Grimoire Scroll 상단, 하위 탭 바로 아래.
- Portrait: 중앙 Grimoire Scroll 상단, 하위 탭 또는 필터칩 바로 아래.
- Guide 카드 화면에서는 필요 시 카드 목록 상단에 표시한다.

동작:

- 안내문이 1개이면 고정 텍스트로 표시한다.
- 안내문이 2개 이상이면 일정 시간마다 부드럽게 교체한다.
- 문구가 길 경우 천천히 흐르는 marquee 형태를 사용할 수 있다.
- 손님이 메뉴를 읽는 데 방해되지 않도록 속도는 느리게 유지한다.
- 안내문 영역은 메뉴 리스트 레이아웃을 밀어내되, 메뉴 위를 덮지 않는다.
- 사용자가 카테고리/세부탭을 바꾸면 해당 영역의 안내문으로 전환한다.
- 안내문이 없으면 영역을 숨긴다.

안내문 데이터 초안:

```ts
type MenuNotice = {
  id: string;
  scope: {
    category?: "guide" | "whisky" | "cocktail" | "wine_other_spirits";
    subcategory?: string;
  };
  messages: LocalizedText[];
  displayMode: "static" | "fade" | "marquee";
  intervalMs?: number;
  enabled: boolean;
  order: number;
};
```

예시:

```text
Whisky / Scotch:
각 메뉴명을 터치하면 상세 정보를 확인할 수 있습니다.

Cocktail / Tarot Signature:
타로 카드 이미지를 좌우로 넘겨 원하는 칵테일을 선택해보세요.

Wine & Other Spirits:
와인 코르키지는 병당 30,000원입니다.
```

### Tarot Card Selector

Tarot Signature Cocktail 전용 화면이다.

필수 표시:

- 선택된 타로 카드 이미지
- 7:12 카드 비율 유지
- 이전/다음 이동 버튼
- 스와이프 제스처
- 현재 위치 인디케이터
- 칵테일 이름
- 가격
- 베이스/맛 태그/도수 요약

동작:

- 좌우 버튼으로 이전/다음 카드 이동
- 스와이프로 이전/다음 카드 이동
- 카드 탭 시 상세 정보 모달 열기
- 키보드/리모컨 환경을 고려해 좌우 방향키 이동도 2차로 검토

레이아웃:

- Landscape에서는 중앙 카드와 좌우 카드 일부 노출을 크게 사용한다.
- Portrait에서는 카드 크기를 줄이고 하단 Category Dock과 겹치지 않게 여백을 확보한다.
- 모든 화면에서 카드 컨테이너는 7:12 비율을 유지한다.

### 메뉴 카드

필수 표시:

- 메뉴명
- 보조 이름 또는 짧은 설명
- 가격
- 품절 상태

품절 표시:

- 품절 메뉴는 숨기지 않고 표시한다.
- 메뉴명에는 붉은색 취소선 2줄을 길게 그어 품절 상태를 강하게 표시한다.
- 메뉴 카드에는 `SOLD OUT` 텍스트 또는 품절 이미지를 함께 표시한다.
- 품절 메뉴는 상세 모달을 열 수는 있지만 주문/추천 액션은 비활성화한다.
- 품절 표시 색상은 어두운 매장 환경에서도 식별 가능한 붉은색 계열을 사용한다.

선택 표시:

- 추천 배지
- 도수
- 맛 태그
- 이미지/잔 아이콘

가격 표시:

- 가격 데이터는 원 단위 숫자로 저장한다.
- 메뉴판 표시에서는 천 원 단위로 축약한다.
- `16,000원`은 `16`으로 표시한다.
- `120,000원`은 `120`으로 표시한다.
- 단, 상세 모달이나 주문 확인 화면에서는 필요 시 `16,000원`처럼 전체 금액을 표시할 수 있다.
- 가격이 없거나 0인 안내/타이틀 항목은 가격 영역을 숨긴다.

정렬 기준:

- 메뉴 정렬은 `sort_code` 오름차순을 기본으로 한다.
- `sort_code`가 없는 항목은 해당 카테고리의 마지막에 배치한다.
- 같은 `sort_code`가 중복되면 `name.ko` 또는 `id` 기준으로 안정 정렬한다.

### 상세 모달

필수 표시:

- 이미지
- 메뉴명
- 가격
- 설명
- 도수/베이스/지역 등 핵심 속성

동작:

- 바깥 클릭/닫기 버튼으로 닫기
- 이전/다음 메뉴 이동은 2차 기능으로 고려

### 필터

필터는 처음부터 화면을 압도하지 않게 접이식 패널로 제공한다.

- 추천
- 품절 제외
- 도수
- 맛 태그
- 가격대

Wine & Other Spirits에서는 필터 패널보다 가벼운 필터칩을 우선 사용한다.

```text
All / Wine / Spirits / Liqueur / Other
```

Guide에서는 메뉴 필터를 사용하지 않는다.

### 이미지 로딩과 fallback

외부 이미지 링크는 만료되거나 깨질 수 있으므로 모든 이미지 영역은 fallback을 가져야 한다.

정책:

- 메뉴 이미지, 타로 카드 이미지, 좌석 배치 이미지는 각각 별도 fallback을 준비한다.
- 이미지 로딩 전에는 skeleton 또는 어두운 placeholder를 표시한다.
- 이미지 로딩 실패 시 레이아웃 크기는 유지하고 fallback 이미지만 대체한다.
- 타로 카드 fallback은 반드시 7:12 비율을 유지한다.
- 메뉴 이미지 fallback은 메뉴 타입에 맞는 기본 이미지를 사용한다.
- 외부 URL이 만료되어도 앱 전체가 깨지지 않아야 한다.

필요한 fallback 자산:

- `fallback-menu.png`
- `fallback-tarot-card.png`
- `fallback-seat-map.png`
- `fallback-guide.png`

기존 프로젝트 재사용 후보:

- `iv_loading.png`: 512 x 512. 로딩/placeholder 후보.
- `noimage.png`: 640 x 400. 일반 메뉴 이미지 fallback 후보.
- `special001.png`: 512 x 512. 이벤트/특수 항목 placeholder 후보.
- `iv_popup_background.png`: 180 x 280. 상세 모달 배경 질감 후보.
- `iv_mainbg.jpg`: 167 x 267. Portal/배경 질감 후보.
- `iv_scroll_1920h_03.png`: 1200 x 1920. Grimoire Scroll 배경 후보.
- `iv_scroll.png`: 3500 x 5250. 고해상도 스크롤 원본 후보.

자산 마이그레이션 정책:

- 기존 Android `res/drawable*` 자산은 새 앱의 `public/assets/legacy/` 또는 `src/assets/legacy/`로 복사해 검토한다.
- 고해상도 스크롤 원본은 용량이 크므로 웹용으로 최적화한 버전을 별도로 만든다.
- 타로 카드 fallback은 기존 `noimage.png`를 그대로 쓰지 않고, 7:12 비율에 맞춘 새 이미지를 만든다.
- 기존 자산을 그대로 쓰는 경우에도 파일명은 새 앱 의미에 맞춰 정리한다.

### 네트워크/데이터 동기화 정책

앱은 Firebase 연결 실패를 항상 정상적인 가능성으로 간주한다. 메뉴판은 원격 연결이 실패해도 로컬 데이터로 동작해야 한다.

원칙:

- 앱의 기본 실행 데이터는 로컬 데이터 또는 마지막 성공 캐시다.
- Firebase는 앱 실행/Portal 단계에서만 변경 여부를 확인한다.
- 메뉴판 사용 중에는 Firestore 변경을 실시간으로 반영하지 않는다.
- 원격 데이터가 바뀐 경우 Portal 단계에서 변경분을 받아 로컬 캐시를 업데이트한 뒤 메뉴판으로 진입한다.
- Firebase 연결 실패 시 에러 화면으로 막지 않고 로컬 데이터로 계속 진행한다.
- 원격 연결 실패 여부는 운영자 확인용 로그/상태로 남기되 손님에게 과하게 노출하지 않는다.

권장 흐름:

```text
Portal 진입
  → 로컬 데이터 로드
  → Firebase 버전/updated_at 확인
  → 변경 없음: 바로 메뉴판 진입
  → 변경 있음: 변경 데이터 다운로드 후 캐시 갱신
  → Firebase 실패: 로컬 데이터로 메뉴판 진입
```

데이터 버전 기준:

- 전체 메뉴 데이터 또는 카테고리별 데이터에 `version`, `updated_at` 값을 둔다.
- 클라이언트는 마지막 성공 동기화 시점과 원격 버전을 비교한다.
- 데이터 업데이트 중 실패하면 기존 로컬 데이터를 유지한다.

### 다국어 정책

정식 지원 언어:

- 한국어: `ko`
- 영어: `en`
- 일본어: `ja`
- 중국어: `zh`

원칙:

- 앱 UI 텍스트와 메뉴 데이터는 모두 `ko`, `en`, `ja`, `zh` 키를 기준으로 관리한다.
- 언어 전환은 앱 전역에서 즉시 반영되어야 한다.
- 사용자가 언어를 바꾸면 카테고리, 하위 탭, 메뉴명, 설명, 상세 정보가 같은 상태에서 언어만 변경된다.
- 번역이 누락된 경우 기본 언어 `ko`를 fallback으로 사용한다.
- 기존 앱처럼 문자열 배열 인덱스로 언어를 관리하지 않고, 명시적인 언어 코드로 관리한다.
- 시작 기본 언어는 `ko`로 한다.
- 어드민/백엔드도 같은 언어 키 구조를 사용해야 한다.

## 12. 개발 구조 제안

```text
src/
  app/
    App.tsx
    routes/
  components/
    CategoryNav.tsx
    SubcategoryTabs.tsx
    MenuList.tsx
    MenuCard.tsx
    MenuDetailDialog.tsx
    TarotCardSelector.tsx
    TarotCardCarousel.tsx
    LanguageToggle.tsx
    FilterPanel.tsx
  data/
    menu-items.ts
    categories.ts
    tags.ts
    notices.ts
    repositories/
      MenuRepository.ts
      LocalMenuRepository.ts
      FirebaseMenuRepository.ts
      ApiMenuRepository.ts
  domain/
    menu.ts
    filters.ts
    i18n.ts
  hooks/
    useMenuFilters.ts
    useLanguage.ts
  styles/
    tokens.css
    app.css
```

## 13. 마이그레이션 전략

### 1단계: 기존 앱에서 살릴 것 정리

- 카테고리 구조
- Firestore 필드에서 필요한 데이터
- 메뉴 이미지의 개념과 배치 규칙
- 타로맨스 특유의 분위기
- 커스텀 오더/취향 필터 개념

산출물:

- 레거시 기능 목록
- 신규 앱에 유지할 기능 목록
- 버릴 기능/후순위 기능 목록

### 2단계: 데이터 계약 정리

- 깨진 문자열 복구
- 한국어/영어/일본어/중국어 필수 번역 확정
- 쓰지 않는 필드 제거
- 가격/재고/노출 상태 표준화
- 태그 체계 정리
- 어드민 프로젝트와 공유할 데이터 필드명 정리
- `draft`와 `live` 데이터의 사용 기준 정리

산출물:

- 로컬 샘플 데이터
- 필드 매핑표
- 필수/선택 필드 정의

### 3단계: 로컬 데이터 MVP 구축

- 앱 구조 생성
- 샘플 메뉴 10~20개 입력
- UI/UX 확정
- Tarot Signature Cocktail 10종 카드 캐러셀 샘플 구현
- 로컬 설정값으로 Custom Cocktail 노출 ON/OFF 검증
- 가로/세로 카테고리 위치 전환 검증
- 태블릿 화면 검증

산출물:

- MVP-0부터 MVP-4까지 동작하는 로컬 앱
- 시연 가능한 태블릿 메뉴판
- Firebase 없이도 동작하는 fallback 구조

### 4단계: 원격 읽기 연동

- Firestore를 1차 원격 데이터 후보로 사용
- 메뉴 데이터 fetch/cache 구조 구현
- 어드민 설정값 기반 feature flag 연동
- 외부 이미지 URL/CDN 경로 정리
- 오프라인 fallback 적용
- 외부 어드민 프로젝트와 데이터 계약 검증

산출물:

- `FirebaseMenuRepository`
- `.env.local.example`
- Firestore 컬렉션 매핑 문서
- 원격 실패 시 로컬 데이터 fallback

### 5단계: 운영 검증

- 실제 태블릿 가로/세로 화면 검증
- Lenovo Xiaoxin Pad 2024 12.7인치 기준 실기기 검증
- 시작 화면에서 메뉴판 진입 흐름 검증
- 이미지 로딩 실패/느린 네트워크 검증
- 4개국어 전환 검증
- 품절/숨김/추천 상태 검증
- Custom Cocktail ON/OFF 검증

산출물:

- 태블릿 검증 체크리스트
- 알려진 이슈 목록
- 다음 개발 우선순위

## 14. 결정이 필요한 항목

- 새 앱을 웹/PWA로 만들지, Android 네이티브로 만들지
- Firebase를 계속 쓸지, 다른 백엔드를 쓸지
- 외부 어드민 프로젝트와 공유할 최종 데이터 계약
- Custom Cocktail 설정 구조를 어드민에서 어떤 단위로 제어할지
- 4개국어 번역 데이터를 어드민/백엔드에서 어떤 방식으로 검수할지
- 메뉴 이미지를 어떤 외부 이미지 호스팅/CDN에서 제공할지
- 기존 이미지 자산을 그대로 쓸지, 새 디자인 자산을 만들지
- 매장 태블릿 전용인지, 손님 개인폰 QR 메뉴까지 확장할지

## 15. 추천 결론

리뉴얼은 `React + Vite + TypeScript` 기반의 태블릿 우선 웹 앱으로 새로 시작하는 것을 추천한다. 기존 Android 앱은 메뉴 구조와 데이터 필드의 참고 자료로만 사용하고, 코드는 이식하지 않는 편이 좋다.

첫 구현 목표는 “데이터와 이미지 소스가 분리된 깔끔한 메뉴판 MVP”다. 기능을 욕심내기보다 메뉴 탐색, 상세 보기, 언어 전환, 품절/추천 상태, 외부 이미지 URL 로딩을 안정적으로 만든 뒤 필터와 관리자 기능을 확장하는 순서가 가장 안전하다.

## 16. 구현 시작 체크리스트

MVP-0 시작 전:

- [ ] 로컬 작업 폴더를 `taromance-menu-app` 저장소 기준으로 정리한다.
- [ ] React + Vite + TypeScript 프로젝트를 생성한다.
- [ ] 앱 패키지 이름, 문서 제목, 기본 메타 정보를 `Taromance Menu App` 기준으로 정리한다.
- [ ] `.env.local`, `.env.local.example`, `.gitignore` 정책을 정리한다.
- [ ] Firebase 설정값은 `.env.local`에만 둔다.
- [ ] Firebase 설정값이 Git에 커밋되지 않는지 확인한다.
- [ ] 기본 폴더 구조를 만든다.
- [ ] `MenuRepository`, `LocalMenuRepository` 인터페이스 초안을 만든다.
- [ ] `MenuItem`, `SpiritDetail`, `CocktailDetail`, `AppSettings`, `MenuNotice` 타입을 만든다.
- [ ] 로컬 샘플 데이터 파일을 만든다.
- [ ] 로컬 샘플 안내문 파일을 만든다.
- [ ] legacy asset 복사 위치를 정한다.

MVP-1 시작 전:

- [ ] Lenovo Xiaoxin Pad 2024 12.7인치 기준 viewport를 확인한다.
- [ ] Landscape/Portrait breakpoint 기준을 정한다.
- [ ] Portal 화면의 최소 연출 방향을 정한다.
- [ ] Category Rail/Dock의 버튼 크기와 배치를 정한다.
- [ ] Grimoire Scroll 영역의 기본 비율과 여백을 정한다.
- [ ] 화면 꺼짐 방지/전체화면 처리를 앱 패키징 단계에서 어떻게 할지 정한다.

MVP-2 시작 전:

- [ ] Guide, Whisky, Cocktail, Wine & Other Spirits 샘플 데이터를 준비한다.
- [ ] `sort_code` 기준 정렬 함수를 만든다.
- [ ] `16000 -> 16` 가격 축약 표시 함수를 만든다.
- [ ] 품절/숨김/추천 상태 표시 규칙을 컴포넌트에 반영한다.
- [ ] 안내문 티커의 `static`, `fade`, `marquee` 표시 방식을 정한다.

MVP-3 시작 전:

- [ ] Tarot Signature Cocktail 10종 샘플 데이터를 준비한다.
- [ ] 7:12 타로 카드 이미지 규격을 확정한다.
- [ ] 카드 fallback 이미지를 준비한다.
- [ ] 좌우 버튼과 스와이프 제스처 구현 방식을 정한다.
- [ ] 카드 상세 모달에 들어갈 필수 필드를 정한다.

MVP-4 시작 전:

- [ ] 4개국어 필수 UI 문구 목록을 만든다.
- [ ] 메뉴 데이터의 `ko`, `en`, `ja`, `zh` 필드 누락 정책을 확인한다.
- [ ] 이미지 로딩 실패 fallback을 실제 화면에서 확인한다.
- [ ] 상세 모달의 긴 텍스트 스크롤 방식을 정한다.

MVP-5 시작 전:

- [ ] Firebase `.env.local` 연결값을 준비한다.
- [ ] Firestore 컬렉션과 앱 모델 매핑표를 만든다.
- [ ] Portal 단계의 원격 버전 확인 기준을 정한다.
- [ ] 로컬 데이터 fallback 우선순위를 정한다.
- [ ] Firebase 실패 로그를 어디에 남길지 정한다.

커밋 기준:

- [ ] MVP 단계 단위로 커밋한다.
- [ ] 데이터 모델 변경은 별도 커밋으로 남긴다.
- [ ] 디자인 자산 추가는 별도 커밋으로 남긴다.
- [ ] Firebase/환경변수 파일은 커밋하지 않는다.

## 17. 디자인/이미지 자산 목록

앱 번들에 포함될 가능성이 높은 자산:

- 초기화면 전체 이미지 또는 영상
- 카테고리 버튼용 이미지
- 스크롤 배경 이미지
- 스크롤 화살표 이미지
- 타로카드 이미지
- 타로카드 fallback 이미지
- 칵테일 잔모양 표시 이미지
- 로딩 표시 이미지
- 일반 메뉴 fallback 이미지
- 품절/SOLD OUT 표시 이미지
- 안내/가이드 fallback 이미지

외부 URL로 불러올 자산:

- 칵테일 개별 메뉴 이미지
- 위스키 개별 메뉴 이미지
- 와인/기타 주류 개별 메뉴 이미지
- 향후 좌석 배치 이미지

초기화면 자산:

- Portal에서 전체 화면으로 표시한다.
- 이미지 또는 영상 모두 가능하다.
- 데이터 업데이트 확인 중에도 분위기를 해치지 않아야 한다.
- 영상 사용 시 로딩 지연에 대비해 정지 이미지 fallback을 둔다.

카테고리 버튼 자산:

- Guide
- Whisky
- Cocktail
- Wine & Other Spirits
- 선택됨/기본 상태를 구분할 수 있어야 한다.
- Landscape Category Rail과 Portrait Category Dock 양쪽에서 읽혀야 한다.

스크롤 자산:

- Grimoire Scroll 배경 이미지
- 스크롤 상단/하단 또는 좌우 장식
- 스크롤 화살표 이미지
- 큰 원본은 웹용 최적화 버전으로 변환한다.

타로카드 자산:

- Tarot Signature Cocktail 10종 카드 이미지
- 카드 비율은 7:12
- 카드 fallback도 7:12
- 카드 이미지와 앱 UI의 이름/가격/태그 정보가 서로 충돌하지 않아야 한다.

칵테일 잔모양 자산:

- Martini glass
- Highball glass
- On the rock glass
- Champagne glass
- Shot glass
- Brandy glass
- 기타 필요한 잔 타입

레거시 자산 후보:

- `iv_loading.png`: 로딩/placeholder 후보
- `noimage.png`: 일반 메뉴 fallback 후보
- `iv_scroll_1920h_03.png`: Grimoire Scroll 배경 후보
- `iv_scroll.png`: 고해상도 스크롤 원본 후보
- `arrow.png`: 스크롤 화살표 후보
- 기존 glass 이미지들: 칵테일 잔모양 후보

자산 관리 원칙:

- 앱 UI를 구성하는 공통 자산은 저장소에 포함한다.
- 개별 메뉴 이미지는 저장소에 포함하지 않고 데이터의 URL로 불러온다.
- 외부 URL 이미지가 깨졌을 때는 앱 번들 fallback 자산으로 대체한다.
- 고용량 이미지는 웹용으로 압축/리사이즈한 버전을 사용한다.
- 파일명은 역할이 드러나도록 정리한다.
