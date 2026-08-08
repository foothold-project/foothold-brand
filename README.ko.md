# FOOTHOLD 브랜드 시스템

한국어 · [English](./README.md)

![FOOTHOLD 자산 미리보기](./assets/exports/v1/FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg)

FOOTHOLD는 험지 적응형 4족 보행 프로젝트를 위한 공통 시각·언어 시스템입니다. 이 저장소는 브랜드 토큰, 승인된 로고 형상, 메시지, 비율에 종속되지 않는 Visual Master Board와 재사용 가능한 산출물의 공식 원본입니다.

> 사람이 먼저 밟아볼 수 없는 땅을, 로봇이 넘어지지 않고 건너가게 만듭니다.

## 현재 상태

- `v1.0.1`: 승인된 로고 및 SVG Asset Pack 기준선
- `v1.1.0`: 공개·크로스플랫폼 기반과 로컬 Figma 동기화 인프라
- `v1.2.0`: M01–M10 실제 콘텐츠와 전체 OSMU 템플릿 예정

v1.1에서는 검증되지 않은 로봇 이미지, 지표, 팀 역할, 적용 실적 또는 로드맵 사실을 임의로 만들지 않습니다.

## 단일 원본

| 결정 | 공식 원본 |
|---|---|
| 토큰 값 | [`tokens/foothold.tokens.json`](./tokens/foothold.tokens.json) |
| 승인 로고 형상 | [`assets/logo/v1`](./assets/logo/v1/) canonical SVG path |
| 승인 문구 | [`VOICE_AND_MESSAGE.md`](./VOICE_AND_MESSAGE.md) |
| 브랜드 규칙 | [`BRAND_BIBLE.md`](./BRAND_BIBLE.md) |
| 모듈 구조 | [`MASTER_BOARD_SPEC.md`](./MASTER_BOARD_SPEC.md) |
| 시각 조합 제안 | 검토 후 승격되는 Figma Master Board |

Figma는 수정 가능한 시각 작업 공간이지 두 번째 토큰·로고 원본이 아닙니다. Figma에서만 수정된 내용은 내보내기, 비교, 사람의 승인을 거쳐 이 저장소에 반영되기 전까지 제안 상태입니다.

## 빠른 검사

Node.js 20 이상을 권장합니다.

```bash
npm run generate
npm test
```

`npm run generate` 후 커밋된 생성 파일에 차이가 없어야 합니다.

## Figma 작업 흐름

로컬 플러그인은 Figma MCP 호출량을 사용하지 않으며 Professional 요금제를 요구하지 않습니다. Figma 데스크톱에서 개발 플러그인을 한 번 생성해 ID를 발급받은 뒤 [`figma/plugin/README.ko.md`](./figma/plugin/README.ko.md)를 따릅니다.

```text
Git 공식 원본
  -> 로컬 Figma 플러그인 동기화
  -> 시각 수정과 승인
  -> JSON + SVG + PNG 전달 묶음
  -> Codex 차이 검토와 사람 승인
  -> Git 승격 및 전체 재생성
```

## 라이선스

이 저장소에는 혼합 라이선스가 적용됩니다. 코드와 토큰은 MIT, 적용 가능한 브랜드 문서는 CC BY 4.0이며, FOOTHOLD 명칭·로고·지정 브랜드 자산은 두 라이선스의 허가 범위에서 제외됩니다. 사용 전 [`LICENSE.md`](./LICENSE.md), [`LICENSE_SCOPE.md`](./LICENSE_SCOPE.md), [`TRADEMARKS.md`](./TRADEMARKS.md)를 확인하십시오.
