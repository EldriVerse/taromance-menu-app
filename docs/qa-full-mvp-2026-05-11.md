# 타로맨스 메뉴 앱 전체 MVP QA

실행일: 2026-05-11  
대상 커밋 기준: `14b8693 Add Firestore read integration MVP`  
대상 URL: `http://127.0.0.1:5173/`  
QA 범위: 현재 구현된 MVP 전체

## 1. MVP 체크 결과

| MVP | 범위 | 상태 | 비고 |
| --- | --- | --- | --- |
| MVP-0 | 프로젝트 기반, Git, Vite/React/TS, 기본 스크립트 | PASS | lint/build 통과 |
| MVP-1 | 포털, 메뉴 앱 셸, 가이드 기본 진입, 복귀 버튼 제거 | PASS | 브라우저 QA 통과 |
| MVP-2 | 로컬 데이터, 카테고리/탭 탐색, 가격 축약, 품절 표시 | PASS | 브라우저 QA 통과 |
| MVP-3 | 타로 시그니처 카드 캐러셀, 10장, 7:12 CSS 기준 | PASS | 브라우저 QA + 코드 확인 |
| MVP-4 | 상세 모달, 4개 국어 전환 | PASS | KO/EN/JA/ZH 전환 확인 |
| MVP-5 | 데이터 번들, 캐시/로컬 fallback 구조 | PASS | 환경값 없는 상태에서 fallback 확인 |
| MVP-6 | Firestore 읽기 연동 기반 | PARTIAL | SDK/매퍼/env/dynamic import 확인. 실제 Firebase 원격 읽기는 실환경 미검증 |

## 2. 정적 검증

| 항목 | 명령 | 결과 |
| --- | --- | --- |
| Lint | `npm run lint` | PASS |
| Production build | `npm run build` | PASS |

빌드 산출물에서 Firebase 관련 코드는 동적 청크로 분리됨을 확인했다.

## 3. 브라우저 기능 QA

| ID | 영역 | 항목 | 결과 |
| --- | --- | --- | --- |
| QA-001 | MVP-1 | 포털 화면 표시 | PASS |
| QA-002 | MVP-5 | 포털 데이터 준비 상태 표시 | PASS |
| QA-003 | MVP-1 | 포털 진입 버튼 단일성 | PASS |
| QA-004 | MVP-1 | 진입 후 가이드 기본 표시 | PASS |
| QA-005 | MVP-1 | 초기화면 복귀 버튼 없음 | PASS |
| QA-006 | MVP-2 | 메인 카테고리 표시 | PASS |
| QA-007 | MVP-4 | 언어 버튼 단일성 | PASS |
| QA-008 | MVP-4 | 4개 언어 옵션 표시 | PASS |
| QA-009 | MVP-4 | 영어 전환 | PASS |
| QA-010 | MVP-4 | 일본어 전환 | PASS |
| QA-011 | MVP-4 | 중국어 전환 | PASS |
| QA-012 | MVP-2 | Custom Cocktail 숨김 | PASS |
| QA-013 | MVP-3 | 타로 카드 10장 렌더링 | PASS |
| QA-014 | MVP-3 | 첫 타로 카드와 축약 가격 표시 | PASS |
| QA-015 | MVP-3 | 다음 카드 버튼 동작 | PASS |
| QA-016 | MVP-3 | 활성 타로 카드 선택 가능 | PASS |
| QA-017 | MVP-4 | 상세 모달 열림 | PASS |
| QA-018 | MVP-2 | 위스키 추천 기본 탭 표시 | PASS |
| QA-019 | MVP-2 | 위스키 스카치 탭 전환 | PASS |
| QA-020 | MVP-2 | 품절 메뉴 SOLD OUT 표시 | PASS |
| QA-021 | MVP-2 | 와인 & 기타 주류 통합 카테고리 표시 | PASS |
| QA-022 | 공통 | 브라우저 콘솔 에러 없음 | PASS |

최종 브라우저 결과: 22 PASS / 0 FAIL

## 4. 코드 기준 확인

| 항목 | 확인 내용 | 결과 |
| --- | --- | --- |
| 타로 카드 비율 | `aspect-ratio: 7 / 12` 존재 | PASS |
| Custom Cocktail feature flag | `customCocktail.enabled` 기준으로 탭 숨김 | PASS |
| 캐시 fallback | `readCachedMenuData`, `writeCachedMenuData` 존재 | PASS |
| 로컬 데이터 번들 | `source: 'local'` 기준 번들 생성 | PASS |
| 원격 데이터 번들 | `source: 'remote'` 기준 번들 생성 | PASS |
| Firebase 동적 로딩 | `import('firebase/firestore')` 사용 | PASS |
| Firestore env 예시 | `.env.local.example`에 컬렉션 env 포함 | PASS |
| QA/구현 문서 | QA, data source, firestore notes 존재 | PASS |

## 5. 미검증 및 리스크

다음 항목은 현재 MVP 코드가 준비되어 있지만, 실제 운영 검증은 아직 하지 않았다.

- 실제 Firebase `.env.local` 값으로 원격 Firestore 읽기
- 어드민 PC에서 생성될 실제 문서 구조와 매퍼 필드 완전 일치 여부
- 레노버 샤오신패드 2024 12.7 실기기 가로/세로 터치 QA
- Android 앱 패키징 후 전체 화면, 뒤로가기 제한, 화면 꺼짐 방지
- 외부 이미지 URL 만료/깨짐 fallback
- 실제 타로 카드 이미지 10종과 메뉴 이미지 반영

## 6. 결론

현재 구현된 MVP-0부터 MVP-5까지는 PASS로 판단한다. MVP-6 Firestore 읽기 연동은 코드 기반과 fallback 동작은 PASS지만, 실제 Firebase 데이터 읽기는 실환경 정보와 어드민 스키마 확정 후 추가 QA가 필요하므로 PARTIAL로 둔다.
