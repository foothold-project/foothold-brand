# FOOTHOLD 로컬 Figma 플러그인

한국어 · [English](./README.md)

이 플러그인은 Figma MCP 호출량을 사용하지 않고 Git의 공식 원본을 기존 FOOTHOLD Figma 파일에 동기화합니다. Git 파일을 직접 수정하지 않으며 외부 네트워크에 접근하지 않습니다.

## 최초 한 번 설정

플러그인 ID는 Figma가 발급합니다. Figma 데스크톱 앱에서 다음을 수행합니다.

1. 디자인 파일을 엽니다.
2. **Plugins → Development → New plugin**을 선택합니다.
3. **Figma design**, **Custom UI**를 선택하고 임시 위치에 저장합니다.
4. 생성된 `manifest.json`에서 숫자 `id`를 복사합니다.
5. 이 저장소에서 다음을 실행합니다.

   ```bash
   node scripts/configure-plugin.mjs 발급받은_숫자_ID
   ```

6. Figma 데스크톱에서 **Plugins → Development → Import plugin from manifest**를 선택하고 `figma/plugin/manifest.json`을 지정합니다.

로컬 개발 ID는 Figma 계정 컨텍스트에 속하므로 생성된 `manifest.json`은 Git에서 제외됩니다.

## 명령

- **Inspect file**: 페이지, 컬렉션, 변수와 스타일을 변경 없이 조사합니다.
- **Sync foundations**: Starter 호환 변수 컬렉션 5개와 텍스트 스타일 5개를 중복 없이 생성·갱신합니다.
- **Build Master Board skeleton**: 3페이지와 근거 상태가 표시된 M01–M10 골격을 생성·갱신합니다.
- **Export review package**: JSON, SVG, PNG를 내려받습니다. 이 묶음은 변경 제안이며 Git 자동 수정이 아닙니다.

## 안전 규칙

- 플러그인이 소유한 정확한 `foothold.owner` 키 또는 정확한 canonical 변수만 갱신합니다.
- 페이지, 변수, 컴포넌트 또는 사용자 노드를 삭제하지 않습니다.
- Starter에서 네 번째 페이지가 필요하면 생성하지 않고 중단합니다.
- 미확인 프로젝트 사실을 임의로 채우지 않습니다.
