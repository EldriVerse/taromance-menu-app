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

- 10인치 이상 가로 모드 우선
- 터치 타겟 44px 이상
- 가격과 이름 가독성 우선
- 과한 애니메이션보다 빠른 전환
- 어두운 바 환경에서도 읽히는 대비

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

1차 MVP:

- 메뉴판 메인 화면
- 카테고리/하위 카테고리 이동
- Guide 카테고리는 이용 안내/공지사항/외부 음식 안내 카드로 구성
- Whisky 카테고리는 Recommend, Scotch, American, Others 탭 제공
- 칵테일 카테고리는 Tarot Signature Cocktail, Custom Cocktail 2개 탭만 제공
- Tarot Signature Cocktail은 10종 카드 캐러셀/캐릭터 선택창 방식으로 제공
- Custom Cocktail 탭은 설정값에 따라 ON/OFF 가능
- Wine & Other Spirits는 통합 카테고리로 제공하고 내부 필터칩으로 구분
- 메뉴 리스트
- 메뉴 상세 모달
- 한국어/영어/일본어/중국어 전환
- 품절/숨김 상태
- 추천 메뉴 표시
- 로컬 데이터 기반 메뉴 관리
- 외부 이미지 URL 로딩 및 fallback 처리
- 가로/세로 반응형 카테고리 레이아웃
- 태블릿 가로 화면 최적화

2차:

- Firebase/Supabase/API 데이터 연동
- 이미지 CDN/외부 URL 캐시 전략
- 위스키/칵테일 필터
- 커스텀 오더 보조 화면
- 관리자용 데이터 편집 화면

3차:

- QR 웹 메뉴 공개 버전
- 매장 태블릿 전용 키오스크 모드
- 메뉴 조회 로그/인기 메뉴 분석
- 계절 메뉴/이벤트 메뉴 예약 노출

## 11. 화면 요구사항

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
- 리스트는 빠르게 스캔 가능해야 함

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

선택 표시:

- 추천 배지
- 도수
- 맛 태그
- 이미지/잔 아이콘

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

### 2단계: 데이터 정제

- 깨진 문자열 복구
- 한국어/영어/일본어/중국어 필수 번역 확정
- 쓰지 않는 필드 제거
- 가격/재고/노출 상태 표준화
- 태그 체계 정리

### 3단계: 로컬 데이터 MVP 구축

- 앱 구조 생성
- 샘플 메뉴 10~20개 입력
- UI/UX 확정
- Tarot Signature Cocktail 10종 카드 캐러셀 샘플 구현
- 로컬 설정값으로 Custom Cocktail 노출 ON/OFF 검증
- 가로/세로 카테고리 위치 전환 검증
- 태블릿 화면 검증

### 4단계: 원격 데이터 연동

- Firestore, Supabase, API 서버 중 선택
- 메뉴 데이터 fetch/cache 구조 구현
- 어드민 설정값 기반 feature flag 연동
- 외부 이미지 URL/CDN 경로 정리
- 오프라인 fallback 적용
- 외부 어드민 프로젝트와 데이터 계약 검증

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
