# 오프라인 성경 PWA
[https://pwa-bible.babpulss.workers.dev/](https://pwa-bible.babpulss.workers.dev/)

광고나 부가 기능 없이 성경 본문을 빠르게 읽고 검색할 수 있도록 만든 Vite + React 기반 PWA입니다. 최초 접속 시 `public/data/korean_bible.json`(개역한글)을 내려받아 `service worker`에 캐시하며, 이후에는 오프라인에서도 동일하게 사용할 수 있습니다.

## 주요 기능
- 성경/장 선택: 마지막으로 읽은 위치를 자동 저장해 재방문 시 이어서 열기
- 본문 뷰어: 장별 구절 렌더링, 검색 결과 이동 시 해당 구절 하이라이트
- 텍스트 검색: 단어 포함 검색 결과 120개까지 즉시 표시
- 라이트/다크 테마: 상단 토글로 즉시 전환, 시스템 기본 테마 자동 인식
- 검색 UI 최소화: 돋보기 버튼을 눌렀을 때만 검색창/결과 패널이 펼쳐져 본문에 집중 가능
- 글꼴 크기 조절: 헤더의 `Aa±` 버튼으로 본문 글꼴 비율을 즉시 변경 및 저장
- 한/영 병렬 본문: 개역한글과 NIV를 한 화면에서 절 단위로 비교, NIV 토글로 숨김/표시 제어
- 오프라인 지원: PWA 설치 및 `korean_bible.json`, `niv_bible.json`을 포함한 자산을 프리캐시
- 가독성 향상 폰트: Noto Sans/Serif KR (WOFF2) 파일을 `public/fonts`에 포함해 완전 오프라인에서도 동일한 렌더링
- Tailwind 기반 스타일: CSS 변수로 테마를 유지하면서 Tailwind 유틸리티/컴포넌트 레이어로 레이아웃 구성

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
- 본문: 대한성서공회 개역한글 (관련 저작권 FAQ 및 공개 공지 확인: 2011년 이후 자유 사용 가능)
- 프로젝트 문서에 출처 링크 및 조회 날짜 기록 권장

## 구조
```
frontend/
  public/
    data/korean_bible.json   # 개역한글 본문
    data/niv_bible.json      # NIV 본문
    icons/                   # PWA 아이콘 세트
  src/
    App.tsx                  # 메인 리더 UI 및 검색
    index.css                # 글로벌 베이스 스타일
    main.tsx                 # React 엔트리 + PWA 등록
    hooks/useBibleTranslation.ts # TanStack Query 기반 번역 본문 로드 훅
    types/bible.ts              # 성경/검색 관련 타입 정의
    vite-env.d.ts            # Vite/PWA 타입 선언
  tailwind.config.js        # Tailwind 테마/스캔 설정
  postcss.config.js          # PostCSS + Tailwind 플러그인 설정
  vite.config.ts             # vite-plugin-pwa 설정
```

필요 시 다른 번역본도 동일한 JSON 스키마(`books -> chapters -> verses`)로 변환해 `public/data`에 추가하면 확장할 수 있습니다.
