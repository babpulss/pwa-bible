# 오프라인 성경 PWA
[https://pwa-bible.babpulss.workers.dev/](https://pwa-bible.babpulss.workers.dev/)

광고나 부가 기능 없이 성경 본문을 빠르게 읽고 검색할 수 있도록 만든 Vite + React 기반 PWA입니다. 최초 접속 시 `public/data/korean_bible.json`(개역한글)과 `public/data/kjv_bible.json`(KJV)을 내려받아 `service worker`에 캐시하며, 설정에서 일본어와 이탈리아어 번역을 활성화하면 `public/data/japanese_bible.json`(口語訳聖書, 루비 포함)과 `public/data/italian_bible.json`(La Sacra Bibbia Riveduta 1927)도 동일하게 오프라인 캐시에 추가됩니다.

## 미리보기

![앱 스크린샷 - 다크 테마](docs/app-preview-dark.png)

### 작동 영상

https://github.com/user-attachments/assets/aba41127-33eb-457b-8967-4b4298673f30



## 주요 기능
- 성경/장 선택: 마지막으로 읽은 위치를 자동 저장해 재방문 시 이어서 열기
- 본문 뷰어: 장별 구절 렌더링, 검색 결과 이동 시 해당 구절 하이라이트
- 텍스트 검색: 단어 포함 검색 결과 120개까지 즉시 표시
- 라이트/다크 테마: 상단 토글로 즉시 전환, 시스템 기본 테마 자동 인식
- 검색 UI 최소화: 돋보기 버튼을 눌렀을 때만 검색창/결과 패널이 펼쳐져 본문에 집중 가능
- 글꼴 크기 조절: 헤더의 `Aa±` 버튼으로 본문 글꼴 비율을 즉시 변경 및 저장
- 번역 토글: 개역한글, KJV, 일본어, 이탈리아어를 번역별 스위치로 제어해 단일~사중 레이아웃으로 읽기
- 일본어 + 후리가나: 口語訳聖書(1955年版ルビ付き) 본문을 렌더링하고 후리가나(루비)를 별도 스위치로 숨김/표시
- 이탈리아어: La Sacra Bibbia Riveduta 1927 텍스트를 내려받아 병렬 번역으로 표시
- 오프라인 지원: PWA 설치 및 성경파일을 프리캐시
- 가독성 향상 폰트: Noto Sans/Serif KR (WOFF2) 파일을 `public/fonts`에 포함해 완전 오프라인에서도 동일한 렌더링

## 개발/빌드
```bash
npm install
npm run dev   # http://localhost:5173
npm run build # dist/ 에 production 번들 + PWA 서비스워커 생성
npm run preview
```

`npm run dev`를 실행하면 개발 중에도 서비스 워커가 로드되도록 설정되어 있으므로 브라우저에서 기존 캐시가 남아 있다면 갱신을 위해 한번 새로고침이 필요할 수 있습니다.

## 배포 가이드
1. `npm run build` 결과물(`dist/`)을 Cloudflare Pages, Vercel Static 등 정적 호스팅에 업로드
2. HTTPS 환경에서 접속하면 브라우저가 자동으로 PWA 설치 배너를 제공
3. iOS Safari의 경우 공유 버튼 → “홈 화면에 추가”를 사용해 설치

## 데이터 출처 및 저작권 고지
- 개역한글(대한성서공회): 대한성서공회가 제공한 공개 사용 안내 범위 내에서 자유롭게 이용할 수 있습니다. 실제 적용 시 최신 공지/FAQ를 확인해 주세요.
- KJV (King James Version): 퍼블릭 도메인으로 자유롭게 사용 및 배포할 수 있습니다.
- 口語訳聖書(1955年版ルビ付き): 퍼블릭 도메인으로 제공되는 일본어 번역으로, 루비(후리가나) 정보가 포함된 판본을 사용했습니다.
- La Sacra Bibbia Riveduta 1927 (Italiano): Società Biblica di Ginevra가 배포한 Riveduta 1927 판본으로 퍼블릭 도메인에 해당합니다. 
- 본 프로젝트는 상기 안내에 따라 본문을 표시만 하며, 상업적 기능이나 2차 배포를 포함하지 않습니다. 배포 시에는 각 출처의 최신 정책을 재확인해 주세요.

## 구조
```
frontend/
  public/
    data/korean_bible.json   # 개역한글 본문
    data/kjv_bible.json      # KJV 본문
    data/japanese_bible.json # 일본어 口語訳 본문 (루비 포함)
    data/italian_bible.json  # 이탈리아어 Riveduta 1927 본문
    icons/                   # PWA 아이콘 세트
  src/
    App.tsx                  # 메인 리더 UI 및 검색
    index.css                # 글로벌 베이스 스타일
    main.tsx                 # React 엔트리 + PWA 등록
    hooks/useBibleTranslation.ts # TanStack Query 기반 번역 본문 로드 훅
    types/bible.ts              # 성경/검색 관련 타입 정의
    vite-env.d.ts            # Vite/PWA 타입 선언
  postcss.config.js          # PostCSS + Autoprefixer 설정
  vite.config.ts             # vite-plugin-pwa 설정
```

필요 시 다른 번역본도 동일한 JSON 스키마(`books -> chapters -> verses`)로 변환해 `public/data`에 추가하면 확장할 수 있습니다. 일본어 본문은 루비 태그(`<ruby><rb>…</rb><rt>…</rt></ruby>`) 구조를 유지하면 후리가나 토글과 함께 사용할 수 있습니다.

## 라이선스

이 프로젝트의 소스 코드는 MIT License 하에 배포됩니다. 즉,
- 소스 코드의 사용, 복제, 수정, 병합, 배포, 서브라이선스, 판매가 자유롭게 가능합니다.
- 배포 시 저작권 고지와 라이선스 고지를 모든 사본 또는 실질적 부분에 포함해야 합니다.
- 소프트웨어는 “있는 그대로(AS IS)” 제공되며, 어떠한 보증도 제공되지 않습니다.

참고: 성경 데이터(개역한글, KJV, 口語訳, La Sacra Bibbia Riveduta 1927)는 각각의 라이선스/공개 사용 안내에 따릅니다. 소스 코드의 MIT 라이선스는 애플리케이션 코드에 적용되며, 데이터 파일의 이용 조건은 위 “데이터 출처 및 저작권 고지” 섹션을 따릅니다. 자세한 내용은 저장소 루트의 LICENSE 파일을 참고하세요.
