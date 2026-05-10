# 데이터 소스 MVP 구현 노트

작성일: 2026-05-11

## 목적

메뉴 앱이 Firebase 연결 여부와 무관하게 항상 실행되도록 데이터 소스 구조를 분리했다. 현재 단계에서는 로컬 샘플 데이터를 기본으로 사용하고, 브라우저 캐시와 원격 데이터 조회 준비 지점을 마련했다.

## 구현 내용

- `MenuDataBundle`로 설정, 카테고리, 메뉴, 공지를 하나의 데이터 묶음으로 관리한다.
- 앱 시작 시 캐시가 있으면 캐시를 우선 사용하고, 없으면 로컬 샘플 데이터를 사용한다.
- 포털 화면에서 메뉴 진입 버튼을 누르면 데이터 소스를 확인한다.
- Firebase 환경값 또는 컬렉션 매핑이 준비되지 않은 경우에도 로컬 데이터로 계속 실행한다.
- `customCocktail.enabled` 같은 기능 플래그는 데이터 번들 기준으로 판단한다.
- 카테고리/탭/공지/메뉴 필터는 화면이 아니라 저장소 계층에서 처리한다.

## 주요 파일

- `src/domain/menu.ts`
- `src/data/localDataBundle.ts`
- `src/hooks/useMenuDataSource.ts`
- `src/repositories/MenuDataService.ts`
- `src/repositories/BrowserMenuCache.ts`
- `src/repositories/RemoteMenuRepository.ts`
- `src/repositories/LocalMenuRepository.ts`

## 검증

- `npm run lint`: PASS
- `npm run build`: PASS
- 브라우저 검증:
  - 포털에 데이터 준비 상태 표시
  - 포털 진입 후 가이드 화면 기본 표시
  - 와인 & 기타 주류 전체 탭 표시 유지
  - 콘솔 에러 0개

## 다음 작업

- Firebase SDK 연결
- Firestore 컬렉션과 `MenuDataBundle` 매핑
- 원격 `contentVersion` 비교
- 최신 원격 데이터가 있을 때 캐시 갱신
- 원격 이미지 fallback 정책 구현
